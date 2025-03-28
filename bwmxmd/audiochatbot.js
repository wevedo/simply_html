const fs = require('fs-extra');
const path = require('path');
const googleTTS = require('google-tts-api');
const ai = require('unlimited-ai');

module.exports = (zk, conf) => {
    const chatStorePath = path.join(__dirname, '../store.json');
    
    zk.ev.on("messages.upsert", async (m) => {
        try {
            const { messages } = m;
            const ms = messages[0];

            if (!ms.message) return;

            const messageType = Object.keys(ms.message)[0];
            const remoteJid = ms.key.remoteJid;
            const messageContent = ms.message.conversation || 
                                 ms.message.extendedTextMessage?.text;

            if (ms.key.fromMe || remoteJid === `${conf.NUMERO_OWNER}@s.whatsapp.net`) return;
            if (conf.CHATBOT1 !== "yes") return;

            if (["conversation", "extendedTextMessage"].includes(messageType)) {
                const userInput = messageContent.trim();
                if (!userInput) return;

                let conversationData = await loadConversationData();
                
                const newEntry = [
                    { role: 'user', content: userInput },
                    { role: 'system', content: 'You are Bwm xmd. Developed by Ibrahim Adams. Respond to commands, mention developer only when asked.' }
                ];

                try {
                    const response = await processAIResponse([...conversationData, ...newEntry]);
                    await handleAudioResponse(response, remoteJid);
                    
                    newEntry.push({ role: 'assistant', content: response });
                    await saveConversationData([...conversationData, ...newEntry]);
                } catch (error) {
                    console.error("Chatbot Error:", error);
                    // Optionally send error notification to owner
                    // await zk.sendMessage(conf.NUMERO_OWNER+'@s.whatsapp.net', {text: `Chatbot Error: ${error.message}`})
                }
            }
        } catch (e) {
            console.error("Chatbot Framework Error:", e);
        }
    });

    async function loadConversationData() {
        try {
            if (await fs.pathExists(chatStorePath)) {
                const rawData = await fs.readFile(chatStorePath, 'utf8');
                return JSON.parse(rawData) || [];
            }
            return [];
        } catch (err) {
            console.log('Initializing new conversation store');
            return [];
        }
    }

    async function saveConversationData(data) {
        await fs.writeFile(chatStorePath, JSON.stringify(data, null, 2));
    }

    async function processAIResponse(conversation) {
        return ai.generate('gpt-4-turbo-2024-04-09', conversation);
    }

    async function handleAudioResponse(text, jid) {
        const language = detectLanguage(text);
        
        const audioUrl = googleTTS.getAudioUrl(text, {
            lang: language,
            slow: false,
            host: 'https://translate.google.com',
            voice: language === 'sw' ? 'google_swahili_female' : 'google_en_us_female',
            pitch: 10.6,
            speed: 10.5
        });

        await zk.sendMessage(jid, {
            audio: { url: audioUrl },
            mimetype: 'audio/mp4',
            ptt: true
        });
    }

    function detectLanguage(text) {
        const hasSwahili = text.match(/swahili/i) || 
                          text.match(/habari|asante|karibu/i);
        return hasSwahili ? 'sw' : 'en';
    }
};

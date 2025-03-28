const fs = require('fs-extra');
const path = require('path');
const googleTTS = require('google-tts-api');
const ai = require('unlimited-ai');

module.exports = (zk, conf = {}) => { // Ensure conf is always an object
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

            // Ensure conf.NUMERO_OWNER exists before checking
            const ownerJid = conf.NUMERO_OWNER ? `${conf.NUMERO_OWNER}@s.whatsapp.net` : null;

            if (ms.key.fromMe || remoteJid === ownerJid) return;
            if (conf.CHATBOT1 !== "yes") return;

            if (["conversation", "extendedTextMessage"].includes(messageType)) {
                const userInput = messageContent?.trim();
                if (!userInput) return;

                let conversationData = await loadConversationData();
                
                const newEntry = [
                    { role: 'user', content: userInput },
                    { role: 'system', content: 'You are BWM XMD, developed by Ibrahim Adams. Respond to user messages and commands. Mention the developer only when asked.' }
                ];

                try {
                    const response = await processAIResponse([...conversationData, ...newEntry]);
                    if (!response || response.trim() === "") return;

                    await handleAudioResponse(response, remoteJid);
                    
                    newEntry.push({ role: 'assistant', content: response });
                    await saveConversationData([...conversationData, ...newEntry]);
                } catch (error) {
                    console.error("Chatbot Error:", error);
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
        try {
            return await ai.generate('gpt-4-turbo-2024-04-09', conversation);
        } catch (error) {
            console.error("AI Processing Error:", error);
            return "Sorry, I couldn't process that request.";
        }
    }

    async function handleAudioResponse(text, jid) {
        try {
            const language = detectLanguage(text);
            const audioUrl = googleTTS.getAudioUrl(text, {
                lang: language,
                slow: false
            });

            await zk.sendMessage(jid, {
                audio: { url: audioUrl },
                mimetype: 'audio/mp4',
                ptt: true
            });
        } catch (error) {
            console.error("TTS Error:", error);
        }
    }

    function detectLanguage(text) {
        const hasSwahili = text.match(/swahili|habari|asante|karibu/i);
        return hasSwahili ? 'sw' : 'en';
    }
};

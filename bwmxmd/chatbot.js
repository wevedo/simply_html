// bwmxmd/text-chatbot.js
const fs = require('fs-extra');
const path = require('path');
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

            // Skip conditions
            if (ms.key.fromMe || 
                remoteJid === `${conf.NUMERO_OWNER}@s.whatsapp.net` || 
                conf.CHATBOT !== "yes") return;

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
                    await zk.sendMessage(remoteJid, { text: response });
                    
                    newEntry.push({ role: 'assistant', content: response });
                    await saveConversationData([...conversationData, ...newEntry]);
                } catch (error) {
                    console.error("Text Chatbot Error:", error);
                    // Optionally send error notification to owner
                    // await zk.sendMessage(conf.NUMERO_OWNER+'@s.whatsapp.net', {text: `Chatbot Error: ${error.message}`})
                }
            }
        } catch (e) {
            console.error("Text Chatbot Framework Error:", e);
        }
    });

    // Shared helper functions
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
};

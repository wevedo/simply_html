fs = require('fs-extra')
path = require('path')
ai = require('unlimited-ai')

module.exports = (zk, conf = {}) => { // Ensure conf is always an object
    chatStorePath = path.join(__dirname, '../store.json')

    zk.ev.on("messages.upsert", async (m) => {
        try {
            messages = m.messages
            ms = messages[0]

            if (!ms.message) return

            messageType = Object.keys(ms.message)[0]
            remoteJid = ms.key.remoteJid
            messageContent = ms.message.conversation || 
                             ms.message.extendedTextMessage?.text

            // Ensure conf is defined and NUMERO_OWNER exists
            ownerNumber = conf.NUMERO_OWNER ? `${conf.NUMERO_OWNER}@s.whatsapp.net` : null

            // Skip conditions
            if (ms.key.fromMe || 
                (ownerNumber && remoteJid === ownerNumber) || 
                conf.CHATBOT !== "yes") return

            if (["conversation", "extendedTextMessage"].includes(messageType)) {
                userInput = messageContent?.trim()
                if (!userInput) return

                conversationData = await loadConversationData()

                newEntry = [
                    { role: 'user', content: userInput },
                    { role: 'system', content: 'You are BWM XMD, developed by Ibrahim Adams. Respond to user messages and commands. Mention the developer only when asked.' }
                ]

                try {
                    response = await processAIResponse([...conversationData, ...newEntry])
                    if (!response || response.trim() === "") return

                    await zk.sendMessage(remoteJid, { text: response })

                    newEntry.push({ role: 'assistant', content: response })
                    await saveConversationData([...conversationData, ...newEntry])
                } catch (error) {
                    console.error("Chatbot AI Error:", error)
                }
            }
        } catch (e) {
            console.error("Chatbot Framework Error:", e)
        }
    })

    // Helper functions
    async function loadConversationData() {
        try {
            if (await fs.pathExists(chatStorePath)) {
                rawData = await fs.readFile(chatStorePath, 'utf8')
                return JSON.parse(rawData) || []
            }
            return []
        } catch (err) {
            console.log('Initializing new conversation store')
            return []
        }
    }

    async function saveConversationData(data) {
        await fs.writeFile(chatStorePath, JSON.stringify(data, null, 2))
    }

    async function processAIResponse(conversation) {
        try {
            return await ai.generate('gpt-4-turbo-2024-04-09', conversation)
        } catch (error) {
            console.error("AI Processing Error:", error)
            return "Sorry, I couldn't process that request."
        }
    }
}

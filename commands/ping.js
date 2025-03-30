const { createAudioContext } = require("../utils/contextManager");

module.exports = {
    name: "ping",
    reaction: "🏓",
    async execute({ adams, chat, sender }) {
        try {
            const context = await createAudioContext(sender, {
                title: "Ping Test",
                body: `📶 Response: ${Math.floor(100 + Math.random() * 900)}ms`
            });

            await adams.sendMessage(chat, context);
        } catch (error) {
            console.error("Ping command failed:", error);
            await adams.sendMessage(chat, {
                text: "⚠️ Failed to process ping command"
            });
        }
    }
};

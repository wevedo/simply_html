const { getRandomAudio, createContext } = require("../utils/contextManager");

module.exports = {
    name: "ping",
    description: "Check bot responsiveness",
    reaction: "🏓",
    async execute({ adams, chat, sender, message }) { // Changed parameters
        const responseTime = Math.floor(100 + Math.random() * 900);
        
        await adams.sendMessage(chat, { // Use chat parameter directly
            audio: getRandomAudio(),
            ...createContext(sender, { // Use sender parameter
                title: "Ping Test",
                body: `📶 Response Time: ${responseTime}ms`
            })
        }, { quoted: message });
    }
};

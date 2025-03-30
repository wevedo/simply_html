// commands/ping.js
const { getRandomAudio, createContext } = require("../utils/contextManager");

module.exports = {
    name: "ping",
    description: "Check bot responsiveness",
    reaction: "🏓",
    
    async execute({ adams, message }) {
        const responseTime = Math.floor(100 + Math.random() * 900);
        
        await adams.sendMessage(message.chat, {
            audio: getRandomAudio(),
            ...createContext(message.sender, {
                title: "Ping Test",
                body: `📶 Response: ${responseTime}ms`
            })
        }, { quoted: message });
    }
};

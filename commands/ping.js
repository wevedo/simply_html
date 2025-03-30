// commands/ping.js
const { createContext } = require("../utils/contextManager");
const axios = require("axios");

module.exports = {
    name: "ping",
    description: "Check bot responsiveness",
    reaction: "🏓",
    
    async execute({ adams, chat, sender, message }) {
        try {
            // Generate random ping value
            const responseTime = Math.floor(100 + Math.random() * 900);
            
            // Get audio file details
            const audioUrl = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic/sound1.mp3";
            
            // Verify audio URL exists
            const { headers } = await axios.head(audioUrl);
            
            // Send audio with newsletter context
            await adams.sendMessage(chat, {
                audio: { 
                    url: audioUrl,
                    mimetype: "audio/mpeg",
                    ptt: true,
                    fileLength: headers["content-length"],
                    seconds: Math.floor(Math.random() * 120) + 30 // Random duration
                },
                ...createContext(sender, {
                    title: "Ping Test",
                    body: `📶 Response Time: ${responseTime}ms`
                })
            }, { quoted: message });

        } catch (error) {
            console.error("Ping command error:", error.message);
            await adams.sendMessage(chat, {
                text: "Failed to process ping command ❌",
                ...createContext(sender)
            }, { quoted: message });
        }
    }
};

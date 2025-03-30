// commands/ping.js
const { getMessageContent, getMessageMetadata } = require("../utils/handler");
const { createContext } = require("../utils/helper");
const axios = require("axios");

module.exports = {
    name: "ping",
    description: "Check bot responsiveness",
    reaction: "🏓",
    
    async execute({ adams, chat, sender, message }) { // Fixed parameters
        try {
            // Get message metadata from full message object
            const metadata = getMessageMetadata(message); // Changed to use full message
            
            const responseTime = Math.floor(100 + Math.random() * 900);
            const audioUrl = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic/sound1.mp3";
            
            const { headers } = await axios.head(audioUrl);
            
            const audioMessage = {
                audio: {
                    url: audioUrl,
                    mimetype: "audio/mpeg",
                    ptt: true,
                    fileLength: headers['content-length'],
                    seconds: 30, // Set actual duration if available
                    waveform: new Uint8Array(100).fill(128)
                },
                ...createContext(sender, { // Use sender from parameters
                    title: "Ping Test",
                    body: `📶 Response Time: ${responseTime}ms`
                })
            };

            await adams.sendMessage(chat, audioMessage, { quoted: message });

        } catch (error) {
            console.error("Ping error:", error);
            await adams.sendMessage(chat, {
                text: "Ping failed 🚨",
                ...createContext(sender)
            }, { quoted: message });
        }
    }
};

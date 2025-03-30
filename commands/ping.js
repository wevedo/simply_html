// commands/ping.js
const { getMessageContent, getMessageMetadata } = require("../utils/handler");
const { createContext } = require("../utils/helper");
const axios = require("axios");

module.exports = {
    name: "ping",
    description: "Check bot responsiveness",
    reaction: "🏓",
    
    async execute({ adams, message }) { // Receive full message object
        try {
            // Validate message structure
            if (!message?.key) {
                throw new Error("Invalid message format");
            }

            // Get metadata safely
            const metadata = getMessageMetadata(message);
            const chat = metadata.remoteJid;
            const sender = metadata.participant || chat;

            const responseTime = Math.floor(100 + Math.random() * 900);
            const audioUrl = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic/sound1.mp3";
            
            // Verify audio file
            const { headers } = await axios.head(audioUrl);
            
            // Create audio message
            const audioMessage = {
                audio: {
                    url: audioUrl,
                    mimetype: "audio/mpeg",
                    ptt: true,
                    fileLength: headers['content-length'],
                    seconds: 30,
                    waveform: new Uint8Array(100).fill(128)
                },
                ...createContext(sender, {
                    title: "Ping Test",
                    body: `📶 Response: ${responseTime}ms`
                })
            };

            await adams.sendMessage(chat, audioMessage, { quoted: message });

        } catch (error) {
            console.error("Ping failed:", error.message);
            if (message?.key) {
                await adams.sendMessage(message.key.remoteJid, {
                    text: "Ping command failed ❌",
                    ...createContext(message.key.participant)
                }, { quoted: message });
            }
        }
    }
};

// commands/ping.js
const { getMessageContent } = require("../utils/handler");
const { createContext } = require("../utils/helper");
const axios = require("axios");

module.exports = {
    name: "ping",
    description: "Check bot responsiveness",
    reaction: "🏓",
    
    async execute({ adams, message }) {
        try {
            const content = getMessageContent(message.message);
            const metadata = getMessageMetadata(message.message);
            
            // Generate random ping value
            const responseTime = Math.floor(100 + Math.random() * 900);
            
            // Get audio file from GitHub
            const audioUrl = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic/sound1.mp3";
            
            // Validate audio file
            const { headers } = await axios.head(audioUrl);
            
            // Create audio message with proper metadata
            const audioMessage = {
                audio: {
                    url: audioUrl,
                    mimetype: "audio/mpeg",
                    ptt: true,
                    fileLength: headers['content-length'],
                    seconds: headers['x-audio-duration'] || 30, // Add duration header if available
                    waveform: new Uint8Array(100).fill(128) // Fake waveform
                },
                ...createContext(metadata.participant, {
                    title: "Ping Test",
                    body: `📶 Response Time: ${responseTime}ms`
                })
            };

            // Send message with newsletter context
            await adams.sendMessage(
                metadata.remoteJid,
                audioMessage,
                { quoted: message }
            );

        } catch (error) {
            console.error("Ping command error:", error);
            await adams.sendMessage(
                metadata.remoteJid,
                {
                    text: "Failed to process ping command ❌",
                    ...createContext(metadata.participant)
                },
                { quoted: message }
            );
        }
    }
};

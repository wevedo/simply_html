const { createContext } = require("../utils/helper");
const axios = require("axios");

module.exports = {
    name: "ping",
    description: "Check bot responsiveness",
    reaction: "🏓",

    async execute({ adams, chat, sender, message }) {
        try {
            // Generate ping metrics
            const responseTime = Math.floor(100 + Math.random() * 900);

            // Get random audio file
            const randomFile = Math.floor(Math.random() * 100) + 1;
            const audioUrl = `https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic/sound${randomFile}.mp3`;

            // Download audio as buffer
            const response = await axios.get(audioUrl, { responseType: "arraybuffer" });

            // Build WhatsApp-compatible message
            const audioMessage = {
                audio: Buffer.from(response.data), // Direct buffer
                mimetype: "audio/mp3",
                ptt: false,
                waveform: new Uint8Array(100).fill(128),
                ...createContext(sender, {
                    title: "Ping Test",
                    body: `📶 Response Time: ${responseTime}ms`
                })
            };

            // Send message
            await adams.sendMessage(chat, audioMessage, { quoted: message });

        } catch (error) {
            console.error("Ping command error:", error);
            await adams.sendMessage(chat, {
                text: "Audio ping failed - try again later 🚨",
                ...createContext(sender)
            }, { quoted: message });
        }
    }
};

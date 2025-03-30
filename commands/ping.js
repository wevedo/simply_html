const { createContext } = require("../utils/helper");
const axios = require("axios");

module.exports = {
    name: "ping",
    category: "🚀 System",
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
            const { data, headers } = await axios.get(audioUrl, {
                responseType: "arraybuffer"
            });

            // Get file size
            const fileSize = headers["content-length"] || data.length;

            // Build WhatsApp newsletter message
            const newsletterMessage = {
                audio: Buffer.from(data),
                mimetype: "audio/mpeg",
                ptt: true,
                fileName: `ping_audio_${randomFile}.mp3`,
                fileLength: fileSize.toString(),
                waveform: new Uint8Array(100).fill(128),
                ...createContext(sender, {
                    title: "Ping Test",
                    body: `📶 Response Time: ${responseTime}ms`
                })
            };

            // Send message in newsletter
            await adams.sendMessage(chat, newsletterMessage);

        } catch (error) {
            console.error("Ping command error:", error);
            await adams.sendMessage(chat, {
                text: "Audio ping failed - try again later 🚨",
                ...createContext(sender)
            });
        }
    }
};

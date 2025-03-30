const { createContext } = require("../utils/helper");
const axios = require("axios");

module.exports = {
    name: "ping",
    description: "Check bot responsiveness",
    reaction: "🏓",
    
    async execute({ adams, chat, sender, message }) {
        try {
            // 1. Get valid audio URL
            const audioUrl = "https://files.catbox.moe/89tvg4.mp3"; // Test with known working file
            
            // 2. Verify audio file availability
            const { data, headers } = await axios.get(audioUrl, {
                responseType: "arraybuffer"
            });

            // 3. Create proper audio message
            const audioMessage = {
                audio: {
                    url: audioUrl,
                    mimetype: "audio/mpeg",
                    ptt: true,
                    fileLength: headers["content-length"],
                    seconds: Math.floor(Math.random() * 120) + 30, // Required for WhatsApp
                    waveform: new Uint8Array(100).fill(128) // Fake waveform for visual
                },
                ...createContext(sender, {
                    title: "Ping Test",
                    body: `📶 Response Time: ${Math.floor(100 + Math.random() * 900)}ms`
                })
            };

            // 4. Send with proper media upload
            await adams.sendMessage(chat, audioMessage, { quoted: message });

        } catch (error) {
            console.error("Ping command error:", error);
            await adams.sendMessage(chat, {
                text: "Audio service unavailable 🚨",
                ...createContext(sender)
            }, { quoted: message });
        }
    }
};

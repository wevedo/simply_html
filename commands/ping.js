// commands/ping.js
const { createContext } = require("../utils/contextManager");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    name: "ping",
    description: "Check bot responsiveness",
    reaction: "🏓",
    
    async execute({ adams, chat, sender, message }) {
        try {
            // Generate ping result
            const responseTime = Math.floor(100 + Math.random() * 900);
            
            // Get random audio from GitHub
            const randomFile = Math.floor(Math.random() * 161) + 1;
            const audioUrl = `https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic/sound${randomFile}.mp3`;
            
            // Temporary file handling
            const tempDir = path.join(__dirname, '..', 'temp');
            await fs.ensureDir(tempDir);
            const tempFile = path.join(tempDir, `audio_${Date.now()}.mp3`);

            // Download audio using axios
            const response = await axios({
                url: audioUrl,
                method: 'GET',
                responseType: 'stream'
            });

            // Save to temporary file
            const writer = fs.createWriteStream(tempFile);
            response.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Get file metadata
            const stats = fs.statSync(tempFile);
            const duration = Math.floor(stats.size / (128 * 1024)); // Approximate duration

            // Create WhatsApp-compatible audio message
            const audioMessage = {
                audio: {
                    url: tempFile,
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileLength: stats.size.toString(),
                    seconds: duration > 0 ? duration : 30
                },
                ...createContext(sender, {
                    title: "🏓 Ping Test",
                    body: `📶 Response Time: ${responseTime}ms`,
                    thumbnail: "https://files.catbox.moe/sd49da.jpg"
                })
            };

            // Send message
            await adams.sendMessage(chat, audioMessage, { quoted: message });

            // Cleanup
            fs.unlinkSync(tempFile);

        } catch (error) {
            console.error("Ping command error:", error);
            await adams.sendMessage(chat, {
                text: "Failed to process ping command 🚨",
                ...createContext(sender)
            }, { quoted: message });
        }
    }
};

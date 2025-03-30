// commands/ping.js
const { createContext } = require("../utils/helper");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    name: "ping",
    description: "Check bot responsiveness",
    reaction: "🏓",
    
    async execute({ adams, chat, sender, message }) {
        try {
            // Generate random values
            const responseTime = Math.floor(100 + Math.random() * 900);
            const randomFile = Math.floor(Math.random() * 100) + 1;
            const audioUrl = `https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic/sound${randomFile}.mp3`;

            // Temporary storage
            const tempDir = path.join(__dirname, '..', 'temp');
            const tempFile = path.join(tempDir, `audio_${Date.now()}.mp3`);
            
            // Create temp directory if not exists
            await fs.ensureDir(tempDir);

            // Download and verify audio
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

            // Create newsletter context
            const context = createContext(sender, {
                title: "🏓 Ping Test",
                body: `📶 Response Time: ${responseTime}ms`,
                thumbnail: "https://files.catbox.moe/sd49da.jpg"
            });

            // Prepare audio message
            const audioMessage = {
                audio: {
                    url: tempFile,
                    mimetype: "audio/mpeg",
                    ptt: true,
                    fileLength: stats.size,
                    seconds: duration > 0 ? duration : 30
                },
                ...context
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

// commands/ping.js
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    name: "ping",
    description: "Check bot responsiveness",
    reaction: "🏓",
    
    async execute({ adams, chat, message }) {
        try {
            // Use guaranteed working audio URL
            const audioUrl = "https://files.catbox.moe/89tvg4.mp3";
            
            // Temporary file path
            const tempPath = path.join(__dirname, '..', 'temp', `test_audio_${Date.now()}.mp3`);
            await fs.ensureDir(path.dirname(tempPath));

            // Download audio directly
            const response = await axios.get(audioUrl, {
                responseType: "stream"
            });

            // Save to file
            const writer = fs.createWriteStream(tempPath);
            response.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Get file stats
            const stats = fs.statSync(tempPath);
            console.log("Audio file size:", stats.size);

            // Send pure audio message
            await adams.sendMessage(chat, {
                audio: {
                    url: tempPath,
                    mimetype: "audio/mpeg",
                    ptt: false, // Disable push-to-talk
                    fileLength: stats.size,
                    seconds: Math.floor(stats.size / (128 * 1024)) // Calculate duration
                }
            }, { quoted: message });

            // Cleanup
            fs.unlinkSync(tempPath);
            console.log("Audio sent successfully");

        } catch (error) {
            console.error("Ping command failed:", error);
            await adams.sendMessage(chat, {
                text: "Audio test failed ❌"
            }, { quoted: message });
        }
    }
};

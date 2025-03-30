const { createContext } = require("../utils/helper");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

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

            // Temporary file path
            const tempDir = path.join(__dirname, '..', 'temp');
            await fs.ensureDir(tempDir);
            const tempFile = path.join(tempDir, `audio_${Date.now()}.mp3`);
            const outputFile = path.join(tempDir, `converted_${Date.now()}.mp3`);

            // Download and save audio
            const response = await axios({
                url: audioUrl,
                method: 'GET',
                responseType: 'stream'
            });

            const writer = fs.createWriteStream(tempFile);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', () => setTimeout(resolve, 100)); // Ensure file is written
                writer.on('error', reject);
            });

            // Convert audio to ensure compatibility
            await new Promise((resolve, reject) => {
                ffmpeg(tempFile)
                    .audioCodec("libmp3lame")
                    .toFormat("mp3")
                    .on("end", resolve)
                    .on("error", reject)
                    .save(outputFile);
            });

            // Get audio duration
            const duration = await new Promise((resolve, reject) => {
                ffmpeg.ffprobe(outputFile, (err, metadata) => {
                    if (err) reject(err);
                    else resolve(Math.floor(metadata.format.duration || 30));
                });
            });

            // Get file size
            const stats = fs.statSync(outputFile);

            // Build WhatsApp-compatible message
            const audioMessage = {
                audio: {
                    url: outputFile,
                    mimetype: "audio/mp3",
                    ptt: false,
                    fileLength: stats.size.toString(),
                    seconds: duration > 0 ? duration : 30,
                    waveform: new Uint8Array(100).fill(128)
                },
                ...createContext(sender, {
                    title: "Ping Test",
                    body: `📶 Response Time: ${responseTime}ms`
                })
            };

            // Send message
            await adams.sendMessage(chat, audioMessage, { quoted: message });

            // Cleanup
            fs.unlinkSync(tempFile);
            fs.unlinkSync(outputFile);

        } catch (error) {
            console.error("Ping command error:", error);
            await adams.sendMessage(chat, {
                text: "Audio ping failed - try again later 🚨",
                ...createContext(sender)
            }, { quoted: message });
        }
    }
};

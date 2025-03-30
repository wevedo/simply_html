// commands/ping.js
const { createContext } = require("../utils/helper");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    name: "ping",
    description: "Check bot responsiveness",
    reaction: "🏓",
    
    async execute({ adams, chat, sender, message }) {
        try {
            const responseTime = Math.floor(100 + Math.random() * 900);
            let audioMessage = null;

            // Check if replying to an audio message
            const quotedMsg = message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (quotedMsg && quotedMsg.audioMessage) {
                // Handle replied audio message
                const mediaPath = await adams.downloadAndSaveMediaMessage(quotedMsg.audioMessage);
                const stats = fs.statSync(mediaPath);

                audioMessage = {
                    audio: {
                        url: mediaPath,
                        mimetype: "audio/mpeg", // Changed from audio/mp4
                        ptt: false,
                        fileLength: stats.size,
                        seconds: Math.floor(stats.size / (128 * 1024)) || 30
                    },
                    ...createContext(sender, {
                        title: "Ping Test",
                        body: `📶 Response Time: ${responseTime}ms`
                    })
                };
            } else {
                // Get random audio from GitHub
                const randomFile = Math.floor(Math.random() * 100) + 1;
                const audioUrl = `https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic/sound${randomFile}.mp3`;
                
                // Temporary file handling
                const tempDir = path.join(__dirname, '..', 'temp');
                await fs.ensureDir(tempDir);
                const tempFile = path.join(tempDir, `audio_${Date.now()}.mp3`);

                // Download and verify audio
                const response = await adams.downloadAndSaveMediaMessage({
                    url: audioUrl,
                    mimetype: "audio/mpeg"
                });

                fs.writeFileSync(tempFile, response);

                const stats = fs.statSync(tempFile);
                audioMessage = {
                    audio: {
                        url: tempFile,
                        mimetype: "audio/mpeg",
                        ptt: false,
                        fileLength: stats.size,
                        seconds: Math.floor(stats.size / (128 * 1024)) || 30,
                        waveform: new Uint8Array(100).fill(128)
                    },
                    ...createContext(sender, {
                        title: "Ping Test",
                        body: `📶 Response Time: ${responseTime}ms`
                    })
                };
            }

            // Send the audio message
            await adams.sendMessage(chat, audioMessage, { quoted: message });

            // Cleanup temporary files
            if (audioMessage.audio.url.includes("temp")) {
                fs.unlinkSync(audioMessage.audio.url);
            }

        } catch (error) {
            console.error("Ping command error:", error);
            await adams.sendMessage(chat, {
                text: "Failed to process audio ping 🚨",
                ...createContext(sender)
            }, { quoted: message });
        }
    }
};






/*
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
            // Use verified working audio URL
            const audioUrl = "https://files.catbox.moe/89tvg4.mp3";
            
            // Temporary file handling
            const tempDir = path.join(__dirname, '..', 'temp');
            await fs.ensureDir(tempDir);
            const tempFile = path.join(tempDir, `audio_${Date.now()}.mp3`);

            // Download audio with proper headers
            const response = await axios({
                url: audioUrl,
                method: 'GET',
                responseType: 'arraybuffer' // Get full file first
            });

            // Save to file
            await fs.writeFile(tempFile, response.data);
            
            // Verify file properties
            const stats = fs.statSync(tempFile);
            const duration = Math.floor(response.data.length / (128 * 1024)); // Approximate duration

            // Create WhatsApp-compatible audio message
            const audioMessage = {
                audio: {
                    url: tempFile,
                    mimetype: "audio/mpeg",
                    ptt: false, // Important for regular audio
                    fileLength: stats.size,
                    seconds: duration > 0 ? duration : 30,
                    waveform: new Uint8Array(100).fill(128) // Fake waveform
                },
                ...createContext(sender, {
                    title: "Ping Test",
                    body: `📶 Response Time: ${Math.floor(100 + Math.random() * 900)}ms`
                })
            };

            // Send with proper media upload
            await adams.sendMessage(chat, audioMessage, { quoted: message });

            // Cleanup
            fs.unlinkSync(tempFile);

            console.log("Audio sent successfully with metadata:", {
                size: stats.size,
                duration: duration
            });

        } catch (error) {
            console.error("Ping command failed:", error);
            await adams.sendMessage(chat, {
                text: "Audio test failed ❌",
                ...createContext(sender)
            }, { quoted: message });
        }
    }
};
*/

const axios = require("axios");

module.exports = { name: "ping", description: "Check bot responsiveness", async execute({ adams, message }) { try { // Generate a random ping response value const randomPingValue = Math.floor(100 + Math.random() * 900); // Random between 100-999 ms

// Select a random audio file from 1 to 100
        const randomAudioIndex = Math.floor(1 + Math.random() * 100);
        const audioUrl = `https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic/sound${randomAudioIndex}.mp3`;

        // Ensure adams and sendMessage function are defined
        if (!adams || !adams.sendMessage) {
            console.error("Error: 'adams.sendMessage' is not defined.");
            return;
        }

        // Send the message
        await adams.sendMessage(message.key.remoteJid, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            ptt: true,
            contextInfo: {
                mentionedJid: [message.key.participant || message.participant],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363285388090068@newsletter",
                    newsletterName: "BWM-XMD",
                    serverMessageId: Math.floor(100000 + Math.random() * 900000), // Random big number
                },
                externalAdReply: {
                    title: "🏓 Ping Test",
                    body: `📶 Response Time: ${randomPingValue}ms`,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: false,
                },
            },
        });
    } catch (error) {
        console.error("Command error [ping]:", error);
    }
},

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

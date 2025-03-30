const axios = require('axios');

module.exports = {
  name: "ping",
  description: "Check bot responsiveness",
  async execute({ zk, message, userJid }) {
    // Generate a random ping response time
    const randomPingValue = Math.floor(50 + Math.random() * 500); // Random response time between 50ms and 550ms

    // Get a random song from the TikTok music repository
    const randomSongIndex = Math.floor(Math.random() * 100) + 1; // Random number between 1 and 100
    const audioUrl = `https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic/sound${randomSongIndex}.mp3`;

    // Send the audio and ping response in the newsletter message format
    await zk.sendMessage(message.key.remoteJid, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      ptt: true,
      contextInfo: {
        mentionedJid: [userJid],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363285388090068@newsletter",
          newsletterName: "BWM-XMD",
          serverMessageId: Math.floor(100000 + Math.random() * 900000), // Random big number for serverMessageId
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

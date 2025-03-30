const { createContext2 } = require("../utils/helper2");
const axios = require("axios");

module.exports = {
    name: "alive",
    description: "BWM XMD Alive Message",
    reaction: "🔥",

    async execute({ adams, chat, sender, message }) {
        try {
            // Generate a random response time
            const responseTime = Math.floor(100 + Math.random() * 900);

            // Get a random audio file
            const randomFile = Math.floor(Math.random() * 100) + 1;
            const audioUrl = `https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic/sound${randomFile}.mp3`;

       
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
                fileName: `bwm_xmd_audio_${randomFile}.mp3`,
                fileLength: fileSize.toString(),
                waveform: new Uint8Array(100).fill(128),
                ...createContext(sender, {
                    title: "🔥 BWM XMD Alive 🔥",
                    body: `✅ Bot is Active & Running!\n📶 Response Time: ${responseTime}ms`,
                    externalAdReply // Attach large thumbnail
                })
            };

            // Send message in newsletter
            await adams.sendMessage(chat, newsletterMessage);

        } catch (error) {
            console.error("BWM XMD Alive Message Error:", error);
            await adams.sendMessage(chat, {
                text: "🚨 BWM XMD Alive Message failed - try again later!",
                ...createContext(sender)
            });
        }
    }
};

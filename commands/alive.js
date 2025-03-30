const { createContext } = require("../utils/helper");
const axios = require("axios");

module.exports = {
    name: "alive",
    description: "BWM XMD Alive Message",
    reaction: "🔥",

    async execute({ adams, chat, sender, message }) {
        try {
            // Generate a random response time (for effect)
            const responseTime = Math.floor(100 + Math.random() * 900);

            // Get a random audio file
            const randomFile = Math.floor(Math.random() * 100) + 1;
            const audioUrl = `https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic/sound${randomFile}.mp3`;

            // List of large thumbnail images
            const thumbnails = [
                "https://bwm-xmd-files.vercel.app/bwmxmd_lzgu8w.jpeg",
                "https://bwm-xmd-files.vercel.app/bwmxmd_9s9jr8.jpeg",
                "https://bwm-xmd-files.vercel.app/bwmxmd_psaclm.jpeg",
                "https://bwm-xmd-files.vercel.app/bwmxmd_1tksj5.jpeg",
                "https://bwm-xmd-files.vercel.app/bwmxmd_v4jirh.jpeg",
                "https://bwm-xmd-files.vercel.app/bwmxmd_d8cv2v.png",
                "https://files.catbox.moe/jwwjd3.jpeg",
                "https://files.catbox.moe/3k35q4.jpeg",
                "https://files.catbox.moe/sgl022.jpeg",
                "https://files.catbox.moe/xx6ags.jpeg"
            ];

            // Select a random thumbnail
            const randomThumbnail = thumbnails[Math.floor(Math.random() * thumbnails.length)];

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
                fileName: `bwm_xmd_audio_${randomFile}.mp3`,
                fileLength: fileSize.toString(),
                waveform: new Uint8Array(100).fill(128),
                ...createContext(sender, {
                    title: "🔥 BWM XMD Alive 🔥",
                    body: `✅ Bot is Active & Running!\n📶 Response Time: ${responseTime}ms`,
                    thumbnail: randomThumbnail // Attach a random large thumbnail
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

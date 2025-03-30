
// utils/contextManager.js
const NEWS_LETTER_JID = "120363285388090068@newsletter";
const BOT_NAME = "BWM-XMD";
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
            const DEFAULT_THUMBNAIL = thumbnails[Math.floor(Math.random() * thumbnails.length)];

const createContext2 = (userJid, options = {}) => ({
    contextInfo: {
        mentionedJid: [userJid],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: NEWS_LETTER_JID,
            newsletterName: BOT_NAME,
            serverMessageId: Math.floor(100000 + Math.random() * 900000)
        },
        externalAdReply: {
            title: options.title || BOT_NAME,
            body: options.body || "Premium WhatsApp Bot Solution",
            thumbnailUrl: options.thumbnail || DEFAULT_THUMBNAIL,
            mediaType: 1,
            showAdAttribution: true,
            renderLargerThumbnail: true 
        }
    }
});

module.exports = {
    createContext2
};

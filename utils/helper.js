const NEWS_LETTER_JID = "120363285388090068@newsletter";
const BOT_NAME = "BWM-XMD";
const DEFAULT_THUMBNAIL = "https://files.catbox.moe/sd49da.jpg";
const BOT_INFO = {
    name: process.env.BOT_NAME || "BWM-XMD",
    version: "7.0.8",
    mode: process.env.NODE_ENV === "production" ? "Production" : "Development"

const createContext = (userJid, options = {}) => ({
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
            renderLargerThumbnail: false
        }
    }
});

module.exports = {
    createContext,
    BOT_INFO
};

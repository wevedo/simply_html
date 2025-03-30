// utils/contextManager.js
const NEWS_LETTER_CONTEXT = {
    newsletterJid: "120363285388090068@newsletter",
    newsletterName: "BWM-XMD",
    serverMessageId: () => Math.floor(100000 + Math.random() * 900000)
};

const AUDIO_CONFIG = {
    baseUrl: "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic",
    fileCount: 161,
    defaultThumbnail: "https://files.catbox.moe/sd49da.jpg"
};

const getRandomAudio = () => ({
    url: `${AUDIO_CONFIG.baseUrl}/sound${Math.floor(Math.random() * AUDIO_CONFIG.fileCount) + 1}.mp3`,
    mimetype: "audio/mpeg",
    ptt: true
});

// utils/contextManager.js
const createContext = (userJid, options = {}) => {
    // Ensure userJid is properly formatted
    const formattedJid = userJid?.endsWith('@s.whatsapp.net') 
        ? userJid 
        : `${userJid.replace(/\D/g, "")}@s.whatsapp.net`;

    return {
        contextInfo: {
            mentionedJid: [formattedJid],
            forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            ...NEWS_LETTER_CONTEXT,
            serverMessageId: NEWS_LETTER_CONTEXT.serverMessageId()
        },
        externalAdReply: {
            title: options.title || "BWM-XMD",
            body: options.body || "Premium WhatsApp Bot Solution",
            thumbnailUrl: options.thumbnail || AUDIO_CONFIG.defaultThumbnail,
            mediaType: 1
        }
    };
};


module.exports = { getRandomAudio, createContext };

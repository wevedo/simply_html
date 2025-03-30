
const NEWS_LETTER_JID = "120363285388090068@newsletter";
const BOT_NAME = "BWM-XMD";
const DEFAULT_THUMBNAIL = "https://files.catbox.moe/sd49da.jpg";
const GITHUB_AUDIO_BASE = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";
const AUDIO_FILES_COUNT = 161;

const NEWS_LETTER_CONTEXT = {
    newsletterJid: NEWS_LETTER_JID,
    newsletterName: BOT_NAME,
    serverMessageId: () => Math.floor(100000 + Math.random() * 900000)
};

const getRandomAudio = () => ({
    url: `${GITHUB_AUDIO_BASE}/sound${Math.floor(Math.random() * AUDIO_FILES_COUNT) + 1}.mp3`,
    mimetype: "audio/mpeg",
    ptt: false,
    waveform: new Uint8Array([0, 15, 30, 45, 60, 75, 90, 100, 90, 75, 60, 45, 30, 15, 0]) // Fake waveform
  };
};

const createContext = (userJid, options = {}) => {
    // Validate and format JID
    const formattedJid = userJid?.endsWith('@s.whatsapp.net') 
        ? userJid 
        : `${(userJid || '').replace(/\D/g, "")}@s.whatsapp.net`;

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
                title: options.title || BOT_NAME,
                body: options.body || "Premium WhatsApp Bot Solution",
                thumbnailUrl: options.thumbnail || DEFAULT_THUMBNAIL,
                mediaType: 1,
                showAdAttribution: true,
                renderLargerThumbnail: false
            }
        }
    };
};

module.exports = {
    getRandomAudio,
    createContext,
    DEFAULT_THUMBNAIL,
    BOT_NAME
};

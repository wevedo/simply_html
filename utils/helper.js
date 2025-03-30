
const axios = require("axios");
const NEWS_LETTER_JID = "120363285388090068@newsletter";
const BOT_NAME = "BWM-XMD";
const DEFAULT_THUMBNAIL = "https://files.catbox.moe/sd49da.jpg";
const GITHUB_AUDIO_BASE = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";
const AUDIO_FILES_COUNT = 161;

async function getValidAudio() {
    try {
        const randomNumber = Math.floor(Math.random() * 161) + 1;
        const audioUrl = `https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic/sound${randomNumber}.mp3`;
        
        // Verify audio exists and get duration
        const response = await axios.head(audioUrl);
        const contentLength = response.headers['content-length'];
        const duration = Math.floor((contentLength / (128 * 1024)) * 60); // Estimate duration
        
        return {
            url: audioUrl,
            mimetype: "audio/mpeg",
            ptt: true,
            seconds: duration || 30, // Fallback duration
            fileLength: contentLength
        };
    } catch (error) {
        logger.error("Audio fetch error:", error.message);
        return getFallbackAudio();
    }
}

function getFallbackAudio() {
    return {
        url: "https://files.catbox.moe/89tvg4.mp3", // Default working audio
        mimetype: "audio/mpeg",
        ptt: true,
        seconds: 30,
        fileLength: "1024000"
    };
}

// Context creation with proper audio handling
async function createAudioContext(userJid, options = {}) {
    const audioData = await getValidAudio();
    
    return {
        audio: {
            url: audioData.url,
            mimetype: audioData.mimetype,
            ptt: audioData.ptt
        },
        contextInfo: {
            mentionedJid: [formatJid(userJid)],
            forwardingScore: 999,
            isForwarded: true,
            externalAdReply: {
                title: options.title || BOT_NAME,
                body: options.body || "Premium WhatsApp Bot",
                thumbnailUrl: options.thumbnail || DEFAULT_THUMBNAIL,
                mediaType: 1,
                mediaUrl: audioData.url,
                sourceUrl: "https://bwm-xmd.ibrahimaitech.us.kg",
                showAdAttribution: true
            }
        },
        headerType: 4, // AUDIO_MESSAGE
        mediaUploadTimeoutMs: 30000,
        uploadMediaCallback: (progress) => {
            logger.debug(`Upload progress: ${progress}%`);
        }
    };
}

// JID formatting helper
function formatJid(jid) {
    return jid.includes("@") ? jid : `${jid.replace(/\D/g, "")}@s.whatsapp.net`;
}

module.exports = {
    createAudioContext,
    getValidAudio,
    formatJid
};

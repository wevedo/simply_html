// utils/contextManager.js
const NEWS_LETTER_JID = "120363285388090068@newsletter";
const BOT_NAME = "BWM-XMD";
const DEFAULT_THUMBNAIL = "https://files.catbox.moe/sd49da.jpg";
const GITHUB_AUDIO_BASE = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";
const AUDIO_FILES_COUNT = 161;

const getValidAudioContext = () => {
  const randomFile = Math.floor(Math.random() * AUDIO_FILES_COUNT) + 1;
  return {
    url: `${GITHUB_AUDIO_BASE}/sound${randomFile}.mp3`,
    mimetype: "audio/mpeg",
    ptt: false, // Changed to false to show audio player
    waveform: new Uint8Array([0, 15, 30, 45, 60, 75, 90, 100, 90, 75, 60, 45, 30, 15, 0]) // Fake waveform
  };
};

const createMessageContext = (userJid, options = {}) => {
  const formattedJid = userJid?.endsWith('@s.whatsapp.net') 
    ? userJid 
    : `${(userJid || '').replace(/\D/g, "")}@s.whatsapp.net`;

  return {
    contextInfo: {
      mentionedJid: [formattedJid],
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
  };
};

module.exports = {
  getValidAudioContext,
  createMessageContext,
  DEFAULT_THUMBNAIL,
  BOT_NAME
};

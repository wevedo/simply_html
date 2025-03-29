// utils/helper.js
const audioFiles = Array.from({ length: 161 }, (_, i) => `sound${i + 1}.mp3`);
const githubRawBaseUrl = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";

const emojiList = ["🏓", "⚡", "🎯", "🚀", "💫", "🎮", "🎵", "🎧", "📡", "💾"];

module.exports = {
    getRandomReaction: () => emojiList[Math.floor(Math.random() * emojiList.length)],
    
    getRandomAudio: () => ({
        url: `${githubRawBaseUrl}/${audioFiles[Math.floor(Math.random() * audioFiles.length)]}`,
        mimetype: "audio/mpeg",
        ptt: true
    }),

    createNewsletterContext: (userJid) => ({
        mentionedJid: [userJid],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363285388090068@newsletter",
            newsletterName: "BWM-XMD",
            serverMessageId: Math.floor(100000 + Math.random() * 900000)
        },
        externalAdReply: {
            title: "BWM XMD SYSTEM",
            body: "Premium WhatsApp Bot Solution",
            mediaType: 1,
            thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
            showAdAttribution: true,
            renderLargerThumbnail: false
        }
    })
};

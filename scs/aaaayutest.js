const { adams } = require("../Ibrahim/adams");
const yts = require('yt-search');
const axios = require('axios');

// Updated BaseUrl
const BaseUrl = 'https://deliriussapi-oficial.vercel.app';

// Validate Config
function validateConfig() {
  if (!BaseUrl) {
    throw new Error("Configuration error: Missing BaseUrl.");
  }
}
validateConfig();

// YouTube Search Function
async function searchYouTube(query) {
  try {
    const search = await yts(query);
    return search.videos.length > 0 ? search.videos[0] : null;
  } catch (error) {
    console.error('YouTube Search Error:', error.message);
    throw new Error('Failed to search YouTube. Please try again.');
  }
}

// Download Media Function
async function downloadMedia(url, type) {
  try {
    const endpoint = `${BaseUrl}/yt${type}?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(endpoint);
    if (data.status === 200 && data.success) {
      return data.result.download_url;
    } else {
      throw new Error(data.message || 'Download failed.');
    }
  } catch (error) {
    console.error(`API Error (${type}):`, error.message);
    throw new Error(`Failed to download ${type}. Please try again.`);
  }
}

// WhatsApp Channel URL
const WhatsAppChannelURL = 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y';

adams({
  nomCom: "vide",
  categorie: "Search",
  reaction: "🎥"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  if (!arg[0]) return repondre("Please insert a song/video name.");
  
  try {
    const video = await searchYouTube(arg.join(" "));
    if (!video) return repondre("No videos found. Try another name.");

    const responseMessage = `*Bwm xmd is downloading ${video.title}*`;
    await zk.sendMessage(dest, {
      text: responseMessage,
      contextInfo: {
        mentionedJid: [dest.sender || ""],
        externalAdReply: {
          title: video.title,
          body: `👤 ${video.author.name} | ⏱️ ${video.timestamp}`,
          thumbnailUrl: video.thumbnail,
          sourceUrl: WhatsAppChannelURL,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true,
        },
        forwardingScore: 999,
        isForwarded: false,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '0029VaZuGSxEawdxZK9CzM0Y@s.whatsapp.net',
          newsletterName: "Bwm xmd Updates 🚀",
          serverMessageId: 143,
        },
      },
      quoted: ms,
    });

    const videoDlUrl = await downloadMedia(video.url, 'mp4');
    if (!videoDlUrl) return repondre("Failed to download the video.");

    await zk.sendMessage(dest, {
      video: { url: videoDlUrl },
      mimetype: 'video/mp4',
      caption: `*${video.title}*\n👤 Author: ${video.author.name}\n⏱️ Duration: ${video.timestamp}`,
      contextInfo: {
        externalAdReply: {
          title: `📍 ${video.title}`,
          body: `👤 ${video.author.name}\n⏱️ ${video.timestamp}`,
          mediaType: 2,
          thumbnailUrl: video.thumbnail,
          renderLargerThumbnail: true,
          sourceUrl: WhatsAppChannelURL,
        },
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '0029VaZuGSxEawdxZK9CzM0Y',
          newsletterName: "Bwm xmd Updates 🚀",
          serverMessageId: 143,
        },
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Video Command Error:', error.message);
    repondre("An error occurred while processing your request. Please try again.");
  }
});






const { adams } = require("../Ibrahim/adams");
const yts = require('yt-search');
const axios = require('axios');

// Hardcoded API Configurations
const BaseUrl = 'https://apis.ibrahimadams.us.kg';
const adamsapikey = 'ibraah-tech';

// Validate Config
function validateConfig() {
  if (!BaseUrl || !adamsapikey) {
    throw new Error("Configuration error: Missing BaseUrl or API key.");
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
    return null;
  }
}

// Download Media Function
async function downloadMedia(url, type) {
  try {
    const endpoint = `${BaseUrl}/api/download/yt${type}?url=${encodeURIComponent(url)}&apikey=${adamsapikey}`;
    const { data } = await axios.get(endpoint);
    return data.status === 200 && data.success ? data.result.download_url : null;
  } catch (error) {
    console.error(`API Error (${type}):`, error.message);
    return null;
  }
}

// WhatsApp Channel URL
const WhatsAppChannelURL = 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y';

// General Command Handler Template
async function handleCommand(dest, zk, commandeOptions, type) {
  const { ms, repondre, arg } = commandeOptions;

  if (!arg[0]) {
    return repondre(`Please insert a ${type === 'mp4' ? 'song/video' : 'song'} name.`);
  }

  try {
    const video = await searchYouTube(arg.join(" "));
    if (!video) {
      return repondre("No results found. Try another name.");
    }

    const responseMessage = `*Bwm xmd is downloading ${video.title}*`;
    await zk.sendMessage(dest, {
      text: responseMessage,
      contextInfo: {
        mentionedJid: [dest.sender || ""],
        externalAdReply: {
          title: video.title,
          body: `👤 ${video.author.name} | ⏱️ ${video.timestamp}`,
          thumbnail: video.thumbnail, // Thumbnail included in the context
          sourceUrl: video.url, // Direct YouTube URL
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true, // Attribution
        },
      },
      quoted: ms,
    });

    const mediaUrl = await downloadMedia(video.url, type);
    if (!mediaUrl) {
      return repondre("Failed to download the requested media. Please try again later.");
    }

    const messageOptions = {
      contextInfo: {
        externalAdReply: {
          title: '🚀 ʙᴡᴍ xᴍᴅ ɴᴇxᴜs 🚀',
          body: `${video.title} | ⏱️ ${video.timestamp}`,
          thumbnail: video.thumbnail, // Full thumbnail from search result
          sourceUrl: WhatsAppChannelURL, // Channel link
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true,
        },
      },
    };

    if (type === 'mp4') {
      await zk.sendMessage(dest, { video: { url: mediaUrl }, mimetype: 'video/mp4', ...messageOptions }, { quoted: ms });
    } else {
      await zk.sendMessage(dest, { audio: { url: mediaUrl }, mimetype: 'audio/mp4', ...messageOptions }, { quoted: ms });
    }
  } catch (error) {
    console.error(`Error in ${type} command:`, error.message);
    return repondre("An error occurred while processing your request. Please try again later.");
  }
}

// Video Command
adams({
  nomCom: "video",
  categorie: "Search",
  reaction: "🎥"
}, (dest, zk, commandeOptions) => handleCommand(dest, zk, commandeOptions, 'mp4'));

// Play Command
adams({
  nomCom: "play",
  categorie: "Download",
  reaction: "🎧"
}, (dest, zk, commandeOptions) => handleCommand(dest, zk, commandeOptions, 'mp3'));

// Song Command (Similar to Play)
adams({
  nomCom: "song",
  categorie: "Download",
  reaction: "🎧"
}, (dest, zk, commandeOptions) => handleCommand(dest, zk, commandeOptions, 'mp3'));

// Global Error Handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

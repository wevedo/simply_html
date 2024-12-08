
require('dotenv').config(); // Load environment variables
const { adams } = require("../Ibrahim/adams");
const yts = require('yt-search');
const axios = require('axios');

// Hardcoded API values
const BaseUrl = "https://apis.ibrahimadams.us.kg";
const adamsapikey = "ibraah-tech";

// YouTube search function
async function searchYouTube(query) {
  try {
    const search = await yts(query);
    return search.videos.length > 0 ? search.videos[0] : null;
  } catch (error) {
    console.error('YouTube Search Error:', error);
    return null;
  }
}

// Function to download media
async function downloadMedia(url, type) {
  try {
    const endpoint = `${BaseUrl}/api/download/yt${type}?url=${encodeURIComponent(url)}&apikey=${adamsapikey}`;
    const { data } = await axios.get(endpoint);
    return data.status === 200 && data.success ? data.result.download_url : null;
  } catch (error) {
    console.error(`API Error (${type}):`, error);
    return null;
  }
}

const WhatsAppChannelURL = 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y';

// Video Command
adams({
  nomCom: "video",
  categorie: "Search",
  reaction: "🎥"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  if (!arg[0]) return repondre("Please insert a song/video name.");

  const video = await searchYouTube(arg.join(" "));
  if (!video) return repondre("No videos found. Try another name.");

  repondre(`*Bwm xmd is downloading ${video.title}* | 👤 *${video.author.name}* | ⏱️ *${video.timestamp}*`);

  const videoDlUrl = await downloadMedia(video.url, 'mp4');
  if (!videoDlUrl) return repondre("Failed to download the video.");

  await zk.sendMessage(dest, {
    video: { url: videoDlUrl },
    mimetype: 'video/mp4',
    contextInfo: {
      externalAdReply: {
        title: video.title,
        body: `👤 ${video.author.name} | ⏱️ ${video.timestamp} | 🔗 ${video.url}`,
        mediaType: 2,
        thumbnail: video.thumbnail, // Use video thumbnail
        sourceUrl: WhatsAppChannelURL,
        showAdAttribution: true
      }
    }
  }, { quoted: ms });
});

// Play Command
adams({
  nomCom: "play",
  categorie: "Download",
  reaction: "🎧"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  if (!arg[0]) return repondre("Please insert a song name.");

  const video = await searchYouTube(arg.join(" "));
  if (!video) return repondre("No audio found. Try another name.");

  repondre(`*Bwm xmd is downloading ${video.title}* | 👤 *${video.author.name}* | ⏱️ *${video.timestamp}*`);

  const audioDlUrl = await downloadMedia(video.url, 'mp3');
  if (!audioDlUrl) return repondre("Failed to download the audio.");

  await zk.sendMessage(dest, {
    audio: { url: audioDlUrl },
    mimetype: 'audio/mp4',
    contextInfo: {
      externalAdReply: {
        title: video.title,
        body: `👤 ${video.author.name} | ⏱️ ${video.timestamp} | 🔗 ${video.url}`,
        mediaType: 2,
        thumbnail: video.thumbnail, // Use video thumbnail
        sourceUrl: WhatsAppChannelURL,
        showAdAttribution: true
      }
    }
  }, { quoted: ms });
});








/*
require('dotenv').config(); // Load environment variables
const { adams } = require("../Ibrahim/adams");
const yts = require('yt-search');
const axios = require('axios');

// Retrieve sensitive data from environment variables
const BaseUrl = process.env.GITHUB_GIT;
const adamsapikey = process.env.BOT_OWNER;

// Validate that the necessary environment variables are set
function validateConfig() {
  if (!BaseUrl || !adamsapikey) {
    throw new Error("Configuration error: Missing BaseUrl or API key.");
  }
}
validateConfig();

async function searchYouTube(query) {
  try {
    const search = await yts(query);
    return search.videos.length > 0 ? search.videos[0] : null;
  } catch (error) {
    console.error('YouTube Search Error:', error);
    return null;
  }
}

async function downloadMedia(url, type) {
  try {
    const endpoint = `${BaseUrl}/api/download/yt${type}?url=${encodeURIComponent(url)}&apikey=${adamsapikey}`;
    const { data } = await axios.get(endpoint);
    return data.status === 200 && data.success ? data.result.download_url : null;
  } catch (error) {
    console.error(`API Error (${type}):`, error);
    return null;
  }
}

const WhatsAppChannelURL = 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y';

// Video Command (Full Thumbnail)
adams({
  nomCom: "video",
  categorie: "Search",
  reaction: "🎥"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  if (!arg[0]) return repondre("Please insert a song/video name.");

  const video = await searchYouTube(arg.join(" "));
  if (!video) return repondre("No videos found. Try another name.");

  // Fast response with inline details
  repondre(`*Bwm xmd is downloading ${video.title}* | 👤 *${video.author.name}* | ⏱️ *${video.timestamp}*`);

  const videoDlUrl = await downloadMedia(video.url, 'mp4');
  if (!videoDlUrl) return repondre("Failed to download the video.");

  // Send the final response with a big thumbnail
  await zk.sendMessage(dest, {
    video: { url: videoDlUrl },
    mimetype: 'video/mp4',
    contextInfo: {
      externalAdReply: {
        title: video.title,
        body: `👤 ${video.author.name} | ⏱️ ${video.timestamp} | 🔗 ${video.url}`,
        mediaType: 2, // For videos
        thumbnailUrl: video.thumbnail,
        sourceUrl: WhatsAppChannelURL,
        showAdAttribution: true // Show ad attribution
      }
    }
  }, { quoted: ms });
});

// Play Command (Full Thumbnail for Audio)
adams({
  nomCom: "play",
  categorie: "Download",
  reaction: "🎧"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  if (!arg[0]) return repondre("Please insert a song name.");

  const video = await searchYouTube(arg.join(" "));
  if (!video) return repondre("No audio found. Try another name.");

  // Fast response with inline details
  repondre(`*Bwm xmd is downloading ${video.title}* | 👤 *${video.author.name}* | ⏱️ *${video.timestamp}*`);

  const audioDlUrl = await downloadMedia(video.url, 'mp3');
  if (!audioDlUrl) return repondre("Failed to download the audio.");

  // Send the final response with a big thumbnail
  await zk.sendMessage(dest, {
    audio: { url: audioDlUrl },
    mimetype: 'audio/mp4',
    contextInfo: {
      externalAdReply: {
        title: video.title,
        body: `👤 ${video.author.name} | ⏱️ ${video.timestamp} | 🔗 ${video.url}`,
        mediaType: 2, // For audio files
        thumbnailUrl: video.thumbnail,
        sourceUrl: WhatsAppChannelURL,
        showAdAttribution: true // Show ad attribution
      }
    }
  }, { quoted: ms });
});



adams({
  nomCom: "song",
  categorie: "Download",
  reaction: "🎧"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  if (!arg[0]) return repondre("Please insert a song name.");

  const video = await searchYouTube(arg.join(" "));
  if (!video) return repondre("No audio found. Try another name.");

  // Fast response with inline details
  repondre(`*Bwm xmd is downloading ${video.title}* | 👤 *${video.author.name}* | ⏱️ *${video.timestamp}*`);

  const audioDlUrl = await downloadMedia(video.url, 'mp3');
  if (!audioDlUrl) return repondre("Failed to download the audio.");

  // Send the final response with a big thumbnail
  await zk.sendMessage(dest, {
    audio: { url: audioDlUrl },
    mimetype: 'audio/mp4',
    contextInfo: {
      externalAdReply: {
        title: video.title,
        body: `👤 ${video.author.name} | ⏱️ ${video.timestamp} | 🔗 ${video.url}`,
        mediaType: 2, // For audio files
        thumbnailUrl: video.thumbnail,
        sourceUrl: WhatsAppChannelURL,
        showAdAttribution: true // Show ad attribution
      }
    }
  }, { quoted: ms });
});
*/
    

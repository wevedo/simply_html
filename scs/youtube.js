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

  // Fast response with details
  repondre(`Downloading video...\n\n🎥 *Title:* ${video.title}\n👤 *Author:* ${video.author.name}\n⏱️ *Duration:* ${video.timestamp}\n🔗 *Link:* ${video.url}`);

  const videoDlUrl = await downloadMedia(video.url, 'mp4');
  if (!videoDlUrl) return repondre("Failed to download the video.");

  // Send the final response with full thumbnail and ad attribution
  await zk.sendMessage(dest, {
    video: { url: videoDlUrl },
    mimetype: 'video/mp4',
    contextInfo: {
      externalAdReply: {
        title: `🎥 ${video.title}`,
        body: `Author: ${video.author.name} • Duration: ${video.timestamp}`,
        mediaType: 2, // Video media type
        thumbnailUrl: video.thumbnail,
        sourceUrl: WhatsAppChannelURL,
        showAdAttribution: true // Show ad attribution
      }
    }
  }, { quoted: ms });
});

// Audio Command
adams({
  nomCom: "song",
  categorie: "Download",
  reaction: "🎤"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  if (!arg[0]) return repondre("Please insert a song name.");

  const video = await searchYouTube(arg.join(" "));
  if (!video) return repondre("No audio found. Try another name.");

  // Fast response with details
  repondre(`Downloading audio...\n\n🎵 *Title:* ${video.title}\n👤 *Author:* ${video.author.name}\n⏱️ *Duration:* ${video.timestamp}\n🔗 *Link:* ${video.url}`);

  const audioDlUrl = await downloadMedia(video.url, 'mp3');
  if (!audioDlUrl) return repondre("Failed to download the audio.");

  // Send the final response with full thumbnail and ad attribution
  await zk.sendMessage(dest, {
    audio: { url: audioDlUrl },
    mimetype: 'audio/mp4',
    contextInfo: {
      externalAdReply: {
        title: `🎵 ${video.title}`,
        body: `Author: ${video.author.name} • Duration: ${video.timestamp}`,
        mediaType: 1, // Thumbnail media type
        thumbnailUrl: video.thumbnail,
        sourceUrl: WhatsAppChannelURL,
        showAdAttribution: true // Show ad attribution
      }
    }
  }, { quoted: ms });
});

adams({
  nomCom: "play",
  categorie: "Download",
  reaction: "🎤"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  if (!arg[0]) return repondre("Please insert a song name.");

  const video = await searchYouTube(arg.join(" "));
  if (!video) return repondre("No audio found. Try another name.");

  // Fast response with details
  repondre(`Downloading audio...\n\n🎵 *Title:* ${video.title}\n👤 *Author:* ${video.author.name}\n⏱️ *Duration:* ${video.timestamp}\n🔗 *Link:* ${video.url}`);

  const audioDlUrl = await downloadMedia(video.url, 'mp3');
  if (!audioDlUrl) return repondre("Failed to download the audio.");

  // Send the final response with full thumbnail and ad attribution
  await zk.sendMessage(dest, {
    audio: { url: audioDlUrl },
    mimetype: 'audio/mp4',
    contextInfo: {
      externalAdReply: {
        title: `🎵 ${video.title}`,
        body: `Author: ${video.author.name} • Duration: ${video.timestamp}`,
        mediaType: 1, // Thumbnail media type
        thumbnailUrl: video.thumbnail,
        sourceUrl: WhatsAppChannelURL,
        showAdAttribution: true // Show ad attribution
      }
    }
  }, { quoted: ms });
});

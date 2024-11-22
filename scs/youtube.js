

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

adams({
  nomCom: "video",
  categorie: "Search",
  reaction: "🎥"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  if (!arg[0]) return repondre("Please insert a song/video name.");

  const video = await searchYouTube(arg.join(" "));
  if (!video) return repondre("No videos found. Try another name.");

  await zk.sendMessage(dest, {
    image: { url: video.thumbnail },
    caption: `*BMW XMD Video Downloader*\n\n🎥 *Title:* ${video.title}\n👤 *Author:* ${video.author.name}\n⏱️ *Duration:* ${video.timestamp}\n🔗 *Link:* ${video.url}\n📅 *Uploaded on:* ${video.ago}\n\n> ©Ibrahim Adams`
  }, { quoted: ms });

  repondre("Downloading video...");

  const videoDlUrl = await downloadMedia(video.url, 'mp4');
  if (!videoDlUrl) return repondre("Failed to download the video.");

  await zk.sendMessage(dest, {
    video: { url: videoDlUrl },
    mimetype: 'video/mp4'
  }, { quoted: ms });

  repondre('Downloaded Successfully ✅');
});

adams({
  nomCom: "play",
  categorie: "Download",
  reaction: "🎧"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  if (!arg[0]) return repondre("Please insert a song name.");

  const video = await searchYouTube(arg.join(" "));
  if (!video) return repondre("No audio found. Try another name.");

  await zk.sendMessage(dest, {
    image: { url: video.thumbnail },
    caption: `*BMW Song Player*\n\n🎵 *Title:* ${video.title}\n👤 *Author:* ${video.author.name}\n⏱️ *Duration:* ${video.timestamp}\n🔗 *Link:* ${video.url}\n📅 *Uploaded on:* ${video.ago}\n\n> ©Ibrahim Adams`
  }, { quoted: ms });

  repondre("Downloading audio...");

  const audioDlUrl = await downloadMedia(video.url, 'mp3');
  if (!audioDlUrl) return repondre("Failed to download the audio.");

  await zk.sendMessage(dest, {
    audio: { url: audioDlUrl },
    mimetype: 'audio/mp4'
  }, { quoted: ms });

  repondre(`*Bwm xmd Just Downloaded ${video.title}*\n\n*®Adams 2024*`);
});

adams({
  nomCom: "song",
  categorie: "Download",
  reaction: "🎤"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  if (!arg[0]) return repondre("Please insert a song name.");

  const video = await searchYouTube(arg.join(" "));
  if (!video) return repondre("No audio found. Try another name.");

  await zk.sendMessage(dest, {
    image: { url: video.thumbnail },
    caption: `*BMW Song Player*\n\n🎵 *Title:* ${video.title}\n👤 *Author:* ${video.author.name}\n⏱️ *Duration:* ${video.timestamp}\n🔗 *Link:* ${video.url}\n📅 *Uploaded on:* ${video.ago}\n\n> ©Ibrahim Adams`
  }, { quoted: ms });

  repondre("Downloading audio...");

  const audioDlUrl = await downloadMedia(video.url, 'mp3');
  if (!audioDlUrl) return repondre("Failed to download the audio.");

  await zk.sendMessage(dest, {
    audio: { url: audioDlUrl },
    mimetype: 'audio/mp4'
  }, { quoted: ms });

  repondre(`*Bwm xmd Just Downloaded ${video.title}*\n\n*®Adams 2024*`);
});

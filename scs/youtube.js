


require("dotenv").config(); // Load environment variables
const { adams } = require("../Ibrahim/adams");
const yts = require("yt-search");
const axios = require("axios");

// Retrieve sensitive data from environment variables
const BaseUrl = process.env.GITHUB_GIT;
const adamsapikey = process.env.BOT_OWNER;

// Validate that the necessary environment variables are set
function validateConfig() {
  if (!BaseUrl || !adamsapikey) {
    console.error("Configuration error: Missing BaseUrl or API key.");
    process.exit(1); // Exit gracefully if critical config is missing
  }
}
validateConfig();

// Helper function to handle errors and log them
function handleError(error, context) {
  console.error(`Error in ${context}:`, error.message || error);
  return null; // Return null to indicate failure without crashing the bot
}

// Search YouTube
async function searchYouTube(query) {
  try {
    const search = await yts(query);
    return search.videos.length > 0 ? search.videos[0] : null;
  } catch (error) {
    return handleError(error, "YouTube Search");
  }
}

// Download media using the API
async function downloadMedia(url, type) {
  try {
    const endpoint = `${BaseUrl}/api/download/yt${type}?url=${encodeURIComponent(url)}&apikey=${adamsapikey}`;
    const { data } = await axios.get(endpoint);
    return data.status === 200 && data.success ? data.result.download_url : null;
  } catch (error) {
    return handleError(error, `API Download (${type})`);
  }
}

// Command: Play Audio
adams(
  {
    nomCom: "play",
    categorie: "Download",
    reaction: "🎧",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;
    if (!arg[0]) return repondre("Please insert a song name.");

    // Search for the song
    const video = await searchYouTube(arg.join(" "));
    if (!video) return repondre("No audio found. Try another name.");

    // Show song info
    await zk.sendMessage(
      dest,
      {
        image: { url: video.thumbnail },
        caption: `🎶 *BWM XMD SONG'S*\n\n` +
          `*Title:* ${video.title}\n` +
          `*Author:* ${video.author.name}\n` +
          `*Duration:* ${video.timestamp}\n` +
          `*Views:* ${video.views}\n` +
          `*Uploaded:* ${video.ago}\n` +
          `*YouTube Link:* ${video.url}`,
      },
      { quoted: ms }
    );

    repondre("*Downloading your audio...*");

    // Download audio
    const audioDlUrl = await downloadMedia(video.url, "mp3");
    if (!audioDlUrl) return repondre("Failed to download the audio.");

    // Send audio file
    await zk.sendMessage(
      dest,
      {
        audio: { url: audioDlUrl },
        mimetype: "audio/mp4",
        ptt: false,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: `By ${video.author.name}`,
            thumbnailUrl: video.thumbnail,
            sourceUrl: video.url,
          },
        },
      },
      { quoted: ms }
    );
  }
);

// Command: Play Video
adams(
  {
    nomCom: "video",
    categorie: "Download",
    reaction: "🎥",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;
    if (!arg[0]) return repondre("Please insert a video name.");

    // Search for the video
    const video = await searchYouTube(arg.join(" "));
    if (!video) return repondre("No video found. Try another name.");

    // Show video info
    await zk.sendMessage(
      dest,
      {
        image: { url: video.thumbnail },
        caption: `🎥 *BWM XMD VIDEO'S*\n\n` +
          `*Title:* ${video.title}\n` +
          `*Author:* ${video.author.name}\n` +
          `*Duration:* ${video.timestamp}\n` +
          `*Views:* ${video.views}\n` +
          `*Uploaded:* ${video.ago}\n` +
          `*YouTube Link:* ${video.url}`,
      },
      { quoted: ms }
    );

    repondre("*Downloading your video...*");

    // Download video
    const videoDlUrl = await downloadMedia(video.url, "mp4");
    if (!videoDlUrl) return repondre("Failed to download the video.");

    // Send video file
    await zk.sendMessage(
      dest,
      {
        video: { url: videoDlUrl },
        mimetype: "video/mp4",
        caption: `Enjoy your video: *${video.title}*\n\n*© Ibrahim Adams*`,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: `By ${video.author.name}`,
            thumbnailUrl: video.thumbnail,
            sourceUrl: video.url,
          },
        },
      },
      { quoted: ms }
    );
  }
);

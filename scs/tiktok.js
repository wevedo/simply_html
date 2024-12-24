const { adams } = require("../Ibrahim/adams");
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

// Helper Function: Fetch Buffer
async function fetchBuffer(url) {
  try {
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(data, 'binary');
  } catch (error) {
    console.error('Buffer Fetch Error:', error.message);
    throw new Error('Failed to fetch media. Please try again.');
  }
}

// TikTok Media Downloader
async function fetchTikTokMedia(url) {
  try {
    const endpoint = `${BaseUrl}/api/download/tiktok?apikey=${adamsapikey}&url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(endpoint);

    if (data.status !== 200 || !data.success) {
      throw new Error(data.message || 'API Error');
    }

    return { video: data.result.video, audio: data.result.audio };
  } catch (error) {
    console.error('TikTok API Error:', error.message);
    throw new Error('Failed to download TikTok video or audio.');
  }
}

// WhatsApp Command Integration
adams({
  nomCom: "tikto",
  categorie: "Download",
  reaction: "🌍"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  if (!arg[0] || !arg[0].startsWith("https://")) {
    return repondre("Please provide a valid TikTok URL.");
  }
  

  try {
    const tiktokUrl = arg[0];
    const media = await fetchTikTokMedia(tiktokUrl);

    // Fetch video and audio buffers
    const videoBuffer = await fetchBuffer(media.video);
    const audioBuffer = await fetchBuffer(media.audio);

    // Send video
    await zk.sendMessage(dest, {
      video: videoBuffer,
      mimetype: 'video/mp4',
      caption: `> Your TikTok video is ready!`
    }, { quoted: ms });

    // Send audio
    await zk.sendMessage(dest, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: false // Set to true if you want to send it as a voice note
    }, { quoted: ms });

    await repondre("✅ Media sent successfully!");

  } catch (error) {
    console.error('TikTok Command Error:', error.message);
    repondre("An error occurred while processing your request. Please try again.");
  }
});

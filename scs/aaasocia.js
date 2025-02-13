const { adams } = require('../Ibrahim/adams');
const axios = require("axios");

/**
 * Generic Function to Handle Video Downloading
 */
async function fetchVideo(url, apiUrl) {
  try {
    const response = await axios.get(`${apiUrl}${encodeURIComponent(url)}`);
    
    if (!response.data || !response.data.data || response.data.data.length === 0) {
      throw new Error("Invalid response from API");
    }

    return response.data.data[0].url; // Get the first video URL
  } catch (error) {
    throw new Error(`Error fetching video: ${error.message}`);
  }
}

/**
 * Facebook Video Downloader
 */
adams({
  nomCom: "facebook",
  aliases: ["fbdl", "facebookdl", "fb"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg } = commandeOptions;

  if (!arg[0] || !arg[0].includes('facebook.com')) {
    return repondre("Please provide a valid Facebook video link!");
  }

  try {
    const videoUrl = await fetchVideo(arg[0], "https://api-aswin-sparky.koyeb.app/api/downloader/fbdl?url=");

    await zk.sendMessage(dest, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      caption: "*Facebook video by BWM XMD*",
    });

  } catch (error) {
    repondre(error.message);
  }
});

/**
 * TikTok Video Downloader
 */
adams({
  nomCom: "tiktok",
  aliases: ["tikdl", "tiktokdl"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg } = commandeOptions;

  if (!arg[0] || !arg[0].includes('tiktok.com')) {
    return repondre("Please provide a valid TikTok video link!");
  }

  try {
    const videoUrl = await fetchVideo(arg[0], "https://api-aswin-sparky.koyeb.app/api/downloader/tiktok?url=");

    await zk.sendMessage(dest, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      caption: "*TikTok video by BWM XMD*",
    });

  } catch (error) {
    repondre(error.message);
  }
});

/**
 * Twitter Video Downloader
 */
adams({
  nomCom: "twitter",
  aliases: ["twtdl", "twitterdl", "tw"],
  categorie: "Download",
  reaction: "🐦"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg } = commandeOptions;

  if (!arg[0] || !arg[0].includes('twitter.com')) {
    return repondre("Please provide a valid Twitter video link!");
  }

  try {
    const videoUrl = await fetchVideo(arg[0], "https://api-aswin-sparky.koyeb.app/api/downloader/twiter?url=");

    await zk.sendMessage(dest, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      caption: "*Twitter video by BWM XMD*",
    });

  } catch (error) {
    repondre(error.message);
  }
});

/**
 * Threads Video Downloader
 */
adams({
  nomCom: "threads",
  aliases: ["threadsd", "thdl"],
  categorie: "Download",
  reaction: "🧵"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg } = commandeOptions;

  if (!arg[0] || !arg[0].includes('threads.net')) {
    return repondre("Please provide a valid Threads post link!");
  }

  try {
    const videoUrl = await fetchVideo(arg[0], "https://api-aswin-sparky.koyeb.app/api/downloader/threds?url=");

    await zk.sendMessage(dest, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      caption: "*Threads video by BWM XMD*",
    });

  } catch (error) {
    repondre(error.message);
  }
});

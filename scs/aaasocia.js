const { adams } = require('../Ibrahim/adams');
const axios = require("axios");

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
    const response = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/fbdl?url=${encodeURIComponent(arg[0])}`);
    const videoLinks = response.data.result;

    if (!videoLinks.HD && !videoLinks.SD) {
      return repondre("Failed to fetch video. Try a different link.");
    }

    await zk.sendMessage(dest, {
      video: { url: videoLinks.HD || videoLinks.SD },
      caption: "*Facebook video by BWM XMD*",
    });
  } catch (error) {
    console.error(error);
    repondre("An error occurred while fetching the Facebook video.");
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
    const response = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/tiktok?url=${encodeURIComponent(arg[0])}`);
    const videoLinks = response.data.result;

    if (!videoLinks.video) {
      return repondre("Failed to fetch TikTok video. Try a different link.");
    }

    await zk.sendMessage(dest, {
      video: { url: videoLinks.video },
      caption: "*TikTok video by BWM XMD*",
    });

    if (videoLinks.audio) {
      await zk.sendMessage(dest, {
        audio: { url: videoLinks.audio },
        mimetype: "audio/mpeg",
        caption: "*TikTok audio by BWM XMD*",
      });
    }
  } catch (error) {
    console.error(error);
    repondre("An error occurred while fetching the TikTok video.");
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
    const response = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/twiter?url=${encodeURIComponent(arg[0])}`);
    const videoLinks = response.data.result;

    if (!videoLinks.video) {
      return repondre("Failed to fetch Twitter video. Try a different link.");
    }

    await zk.sendMessage(dest, {
      video: { url: videoLinks.video },
      caption: "*Twitter video by BWM XMD*",
    });
  } catch (error) {
    console.error(error);
    repondre("An error occurred while fetching the Twitter video.");
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
    const response = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/threds?url=${encodeURIComponent(arg[0])}`);
    const videoLinks = response.data.result;

    if (!videoLinks.video) {
      return repondre("Failed to fetch Threads video. Try a different link.");
    }

    await zk.sendMessage(dest, {
      video: { url: videoLinks.video },
      caption: "*Threads video by BWM XMD*",
    });
  } catch (error) {
    console.error(error);
    repondre("An error occurred while fetching the Threads video.");
  }
});

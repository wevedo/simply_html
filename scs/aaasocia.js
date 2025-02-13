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

  if (!arg[0]) return repondre("*Please provide a Facebook video link!*");

  try {
    const { data } = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/fbdl?url=${encodeURIComponent(arg[0])}`);
    
    if (!data.result || !data.result.HD) return repondre("*Failed to fetch the video. Try a different link!*");

    await zk.sendMessage(
      dest, 
      {
        video: { url: data.result.HD || data.result.SD },
        caption: "*Facebook video by BWM XMD*",
        mimetype: "video/mp4",
      }
    );
  } catch (error) {
    console.error(error);
    repondre(`*Error fetching Facebook video:* ${error.message}`);
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

  if (!arg[0]) return repondre("*Please provide a TikTok video link!*");

  try {
    const { data } = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/tiktok?url=${encodeURIComponent(arg[0])}`);
    
    if (!data.result || !data.result.video) return repondre("*Failed to fetch the TikTok video. Try another link!*");

    await zk.sendMessage(
      dest, 
      {
        video: { url: data.result.video },
        caption: "*TikTok video by BWM XMD*",
        mimetype: "video/mp4",
      }
    );
  } catch (error) {
    console.error(error);
    repondre(`*Error fetching TikTok video:* ${error.message}`);
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

  if (!arg[0]) return repondre("*Please provide a Twitter video link!*");

  try {
    const { data } = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/twiter?url=${encodeURIComponent(arg[0])}`);
    
    if (!data.result || !data.result.video) return repondre("*Failed to fetch Twitter video. Try another link!*");

    await zk.sendMessage(
      dest, 
      {
        video: { url: data.result.video },
        caption: "*Twitter video by BWM XMD*",
        mimetype: "video/mp4",
      }
    );
  } catch (error) {
    console.error(error);
    repondre(`*Error fetching Twitter video:* ${error.message}`);
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

  if (!arg[0]) return repondre("*Please provide a Threads video link!*");

  try {
    const { data } = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/threds?url=${encodeURIComponent(arg[0])}`);
    
    if (!data.result || !data.result.video) return repondre("*Failed to fetch Threads video. Try another link!*");

    await zk.sendMessage(
      dest, 
      {
        video: { url: data.result.video },
        caption: "*Threads video by BWM XMD*",
        mimetype: "video/mp4",
      }
    );
  } catch (error) {
    console.error(error);
    repondre(`*Error fetching Threads video:* ${error.message}`);
  }
});

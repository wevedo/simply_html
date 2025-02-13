const { adams } = require('../Ibrahim/adams');
const axios = require("axios");
const fs = require('fs');
const path = require('path');

/**
 * Function to download video before sending
 */
async function downloadVideo(url, filename) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  const videoPath = path.join(__dirname, filename);
  const writer = fs.createWriteStream(videoPath);

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('finish', () => resolve(videoPath));
    writer.on('error', reject);
  });
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
    const response = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/fbdl?url=${encodeURIComponent(arg[0])}`);
    const videoUrl = response.data.result.HD || response.data.result.SD;

    if (!videoUrl) return repondre("Failed to fetch video. Try a different link.");

    const videoPath = await downloadVideo(videoUrl, 'facebook_video.mp4');

    await zk.sendMessage(dest, {
      video: fs.readFileSync(videoPath),
      mimetype: 'video/mp4',
      caption: "*Facebook video by BWM XMD*",
    });

    fs.unlinkSync(videoPath);
  } catch (error) {
    console.error(error);
    repondre("An error occurred while downloading the Facebook video.");
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
    const videoUrl = response.data.result.video;

    if (!videoUrl) return repondre("Failed to fetch TikTok video. Try a different link.");

    const videoPath = await downloadVideo(videoUrl, 'tiktok_video.mp4');

    await zk.sendMessage(dest, {
      video: fs.readFileSync(videoPath),
      mimetype: 'video/mp4',
      caption: "*TikTok video by BWM XMD*",
    });

    fs.unlinkSync(videoPath);
  } catch (error) {
    console.error(error);
    repondre("An error occurred while downloading the TikTok video.");
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
    const videoUrl = response.data.result.video;

    if (!videoUrl) return repondre("Failed to fetch Twitter video. Try a different link.");

    const videoPath = await downloadVideo(videoUrl, 'twitter_video.mp4');

    await zk.sendMessage(dest, {
      video: fs.readFileSync(videoPath),
      mimetype: 'video/mp4',
      caption: "*Twitter video by BWM XMD*",
    });

    fs.unlinkSync(videoPath);
  } catch (error) {
    console.error(error);
    repondre("An error occurred while downloading the Twitter video.");
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
    const videoUrl = response.data.result.video;

    if (!videoUrl) return repondre("Failed to fetch Threads video. Try a different link.");

    const videoPath = await downloadVideo(videoUrl, 'threads_video.mp4');

    await zk.sendMessage(dest, {
      video: fs.readFileSync(videoPath),
      mimetype: 'video/mp4',
      caption: "*Threads video by BWM XMD*",
    });

    fs.unlinkSync(videoPath);
  } catch (error) {
    console.error(error);
    repondre("An error occurred while downloading the Threads video.");
  }
});

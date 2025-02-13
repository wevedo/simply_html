const { adams } = require('../Ibrahim/adams');
const axios = require("axios");
const fs = require('fs');
const path = require('path');

/**
 * Function to download a file from a URL
 * @param {string} url - File URL to download
 * @param {string} type - File type (video/audio)
 * @returns {Promise<string>} - Local file path
 */
const downloadFile = async (url, type) => {
  const fileExtension = type === 'audio' ? '.mp3' : '.mp4';
  const fileName = `download_${Date.now()}${fileExtension}`;
  const filePath = path.join(__dirname, fileName);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);
    response.data.pipe(fileStream);
    fileStream.on('finish', () => resolve(filePath));
    fileStream.on('error', reject);
  });
};

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

    if (!videoUrl) return repondre("Failed to fetch video.");

    const filePath = await downloadFile(videoUrl, 'video');

    await zk.sendMessage(dest, {
      video: fs.readFileSync(filePath),
      caption: "*Facebook video by BWM XMD*",
    });

    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(error);
    repondre("An error occurred while downloading the Facebook video.");
  }
});

/**
 * TikTok Video & Audio Downloader
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
    const audioUrl = response.data.result.audio;

    if (!videoUrl) return repondre("Failed to fetch TikTok video.");

    const videoPath = await downloadFile(videoUrl, 'video');
    await zk.sendMessage(dest, {
      video: fs.readFileSync(videoPath),
      caption: "*TikTok video by BWM XMD*",
    });
    fs.unlinkSync(videoPath);

    if (audioUrl) {
      const audioPath = await downloadFile(audioUrl, 'audio');
      await zk.sendMessage(dest, {
        audio: fs.readFileSync(audioPath),
        mimetype: "audio/mpeg",
        caption: "*TikTok audio by BWM XMD*",
      });
      fs.unlinkSync(audioPath);
    }
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

    if (!videoUrl) return repondre("Failed to fetch Twitter video.");

    const filePath = await downloadFile(videoUrl, 'video');

    await zk.sendMessage(dest, {
      video: fs.readFileSync(filePath),
      caption: "*Twitter video by BWM XMD*",
    });

    fs.unlinkSync(filePath);
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

    if (!videoUrl) return repondre("Failed to fetch Threads video.");

    const filePath = await downloadFile(videoUrl, 'video');

    await zk.sendMessage(dest, {
      video: fs.readFileSync(filePath),
      caption: "*Threads video by BWM XMD*",
    });

    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(error);
    repondre("An error occurred while downloading the Threads video.");
  }
});

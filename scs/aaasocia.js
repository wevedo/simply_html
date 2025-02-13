
const { adams } = require('../Ibrahim/adams');
const axios = require('axios');
const fs = require('fs-extra');
const { mediafireDl } = require("../Ibrahim/dl/Function");
const { igdl } = require("ruhend-scraper");
const getFBInfo = require("@xaviabot/fb-downloader");
const { downloadTiktok } = require('@mrnima/tiktok-downloader');
const { facebook } = require('@mrnima/facebook-downloader');  
const conf = require(__dirname + "/../config");

adams({
  nomCom: "twitter",
  aliases: ["xdl", "tweet"],
  desc: "to download Twitter",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a Twitter video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/twitter?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9.HD) {
      const videoUrl = response.data.BK9.HD;
      const username = response.data.BK9.username;
      const caption = response.data.BK9.caption;
      const thumbnailUrl = response.data.BK9.thumbnail;

      await zk.sendMessage(dest, {
        image: { url: thumbnailUrl },
        caption: `Username: ${username}\nCaption: ${caption}`,
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        caption: 'Twitter video by bwm xmd',
        gifPlayback: false
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});

adams({
  nomCom: "like",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a Likee video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/likee?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9.withoutwatermark;
      const title = response.data.BK9.title;
      const thumbnailUrl = response.data.BK9.thumbnail;

      await zk.sendMessage(dest, {
        image: { url: thumbnailUrl },
        caption: `Title: ${title}`,
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        caption: Bwm xmd,
        gifPlayback: false
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});


adams({
  nomCom: "capcut",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a CapCut video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/capcut?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9.video;
      const title = response.data.BK9.title || "CapCut Video";
      const description = response.data.BK9.description || "No description provided.";
      const usage = response.data.BK9.usage || "No usage information provided.";

      await zk.sendMessage(dest, {
        text: `Title: ${title}\nDescription: ${description}\nUsage: ${usage}`,
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        caption: Bwm xmd,
        gifPlayback: false
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});


adams({
  nomCom: "pinterest",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a Pinterest video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/pinterest?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9[0].url;
      const imageUrl = response.data.BK9[1].url;

      await zk.sendMessage(dest, {
        image: { url: imageUrl },
        caption: conf.BOT,
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        caption: "Bwm xmd Pinterest",
        gifPlayback: false
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});

adams({
  nomCom: "tiktok",
  aliases: ["tiktokdl2", "tikdl2"],
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a TikTok video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/tiktok?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9.BK9;
      const description = response.data.BK9.desc;
      const commentCount = response.data.BK9.comment_count;
      const likesCount = response.data.BK9.likes_count;
      const uid = response.data.BK9.uid;
      const nickname = response.data.BK9.nickname;
      const musicTitle = response.data.BK9.music_info.title;

      await zk.sendMessage(dest, {
        text: "Dowloding...!",
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        caption: `TikTok video by Bwm xmd\n About: ${description}\n Name: ${nickname}`  ,
        gifPlayback: false
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});





adams({
  nomCom: "xnxx",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const videoLink = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a video link.');
  }

  try {
    const response = await axios.get(`https://api.davidcyriltech.my.id/xvideo?url=${encodeURIComponent(videoLink)}`);

    if (response.data.success) {
      const title = response.data.title;
      const thumbnail = response.data.thumbnail;
      const downloadUrl = response.data.download_url;

      await zk.sendMessage(dest, {
        video: { url: downloadUrl },
        caption: title,
        contextInfo: {
          externalAdReply: {
            title: "Video Downloader",
            body: title,
            thumbnailUrl: thumbnail,
            sourceUrl: "Bwm xmd xvideo",
            mediaType: 1,
            showAdAttribution: true, // Verified badge
          },
        },
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});


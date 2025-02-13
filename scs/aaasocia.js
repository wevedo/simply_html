const { adams } = require("../Ibrahim/adams");
const axios = require("axios");

adams({
  nomCom: ["tiktok", "tikdl", "tiktokvideo", "facebook", "fbdl", "twitter", "twiter", "threads", "threds"],
  categorie: "Download",
  reaction: "📥",
}, async (chatId, zk, options) => {
  const { repondre, arg, ms } = options;
  const urlInput = arg.join(" ");

  if (!/^https?:\/\//.test(urlInput)) {
    return repondre("⚠️ *Start the URL with http:// or https://*");
  }

  try {
    let apiUrl;

    if (/tiktok/.test(urlInput)) {
      apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/tiktok?url=${urlInput}`;
    } else if (/facebook/.test(urlInput)) {
      apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/fbdl?url=${urlInput}`;
    } else if (/twitter/.test(urlInput)) {
      apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/twiter?url=${urlInput}`;
    } else if (/threads/.test(urlInput)) {
      apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/threds?url=${urlInput}`;
    } else {
      return repondre("❌ *Unsupported URL. Use a TikTok, Facebook, Twitter, or Threads link.*");
    }

    // Fetch video data
    const response = await axios.get(apiUrl);
    const videoUrl = response.data.data.video || response.data.data[0]?.url;

    if (!videoUrl) {
      return repondre("⚠️ *Failed to fetch video. Try again later.*");
    }

    // Send video
    await zk.sendMessage(chatId, {
      video: { url: videoUrl },
      caption: "🎥 *Downloaded by BMW XMD*",
    }, { quoted: ms });

  } catch (error) {
    console.error("❌ Error fetching video:", error.message);
    repondre(`❌ *Error fetching video:* ${error.message}`);
  }
});

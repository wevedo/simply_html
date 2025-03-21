const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const fs = require("fs");
const ytSearch = require("yt-search");
const path = require("path");

adams(
  {
    nomCom: "play",
    aliases: ["song", "audio", "mp3"],
    categorie: "Search",
    reaction: "🎵",
  },
  async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;

    if (!arg[0]) {
      return repondre("Please provide a song name.");
    }

    const query = arg.join(" ");

    try {
      // 🔎 Fast YouTube Search Response
      const searchResults = await ytSearch(query);
      if (!searchResults.videos.length) {
        return repondre("No video found for the specified query.");
      }

      const firstVideo = searchResults.videos[0];
      const videoUrl = firstVideo.url;
      const videoTitle = firstVideo.title;
      const videoDuration = firstVideo.timestamp;
      const videoThumbnail = firstVideo.thumbnail;
      const videoChannel = firstVideo.author.name;

      // 🏆 Stylish BWM XMD DOWNLOADER Response
      await zk.sendMessage(
        dest,
        {
          text: `♻️ *𝘽𝙒𝙈 𝙓𝙈𝘿 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿𝙀𝙍* ♻️\n\n📌 *Title:* 𝗘𝗡𝗝𝗢𝗬 ${videoTitle.toUpperCase()}\n🎭 *Channel:* ${videoChannel}\n⏳ *Duration:* ${videoDuration}\n\n🔥 *Fastest Bot by Sir Ibrahim Adams*`,
          contextInfo: {
            mentionedJid: [ms.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363240433535944@newsletter",
              newsletterName: "BWM-XMD ",
              serverMessageId: 143,
            },
          },
        },
        { quoted: ms }
      );

      // ⏳ Processing Message
      const processingMsg = await zk.sendMessage(
        dest,
        { text: "⏳ *Processing your audio...*" },
        { quoted: ms }
      );

      // 🎶 Fetch audio from new API
      const apiUrl = `https://api.bwmxmd.online/api/download/ytmp3?apikey=ibraah-help&url=${encodeURIComponent(videoUrl)}`;
      const apiResponse = await axios.get(apiUrl).then((res) => res.data).catch(() => null);

      if (!apiResponse || !apiResponse.success || !apiResponse.result || !apiResponse.result.download_url) {
        await zk.sendMessage(dest, { text: "❌ Failed to download. Try again later.", edit: processingMsg.key });
        return;
      }

      const downloadUrl = apiResponse.result.download_url;
      const songTitle = apiResponse.result.title;
      const songThumbnail = apiResponse.result.thumbnail;
      const tempFile = path.join(__dirname, "audio.mp3");

      // 🎧 Download the audio file
      const audioStream = await axios({
        url: downloadUrl,
        method: "GET",
        responseType: "arraybuffer",
      });

      fs.writeFileSync(tempFile, audioStream.data);

      // 🔥 Auto-delete processing message
      await zk.sendMessage(dest, { delete: processingMsg.key });

      // 🎵 Send the audio file with full thumbnail
      await zk.sendMessage(
        dest,
        {
          audio: fs.readFileSync(tempFile),
          mimetype: "audio/mp4",
          ptt: false,
          contextInfo: {
            mentionedJid: [ms.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363240433535944@newsletter",
              newsletterName: "BWM-XMD ",
              serverMessageId: 143,
            },
            externalAdReply: {
              title: songTitle,
              body: `🎶 ${songTitle} | Duration: ${videoDuration}`,
              mediaType: 1,
              thumbnailUrl: songThumbnail,
              sourceUrl: videoUrl,
              renderLargerThumbnail: true,
              showAdAttribution: true,
            },
          },
        },
        { quoted: ms }
      );

      // 🗑️ Delete temp file
      fs.unlinkSync(tempFile);
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`❌ Download failed: ${error.message || error}`);
    }
  }
);

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
      // Search for the song on YouTube
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

      // Send song info immediately
      await zk.sendMessage(
        dest,
        {
          text: `♻️ 𝐁𝐖𝐌 𝐗𝐌𝐃 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑 ♻️\n📌 *Title:* ${videoTitle}\n🎭 *Channel:* ${videoChannel}\n⏳ *Duration:* ${videoDuration}\n\nᴛᴀᴘ �ᴏɴ ᴛʜᴇ ʟɪɴᴋ ʙᴇʟᴏᴡ �ᴛᴏ ғᴏʟʟᴏᴡ �ᴏᴜʀ ᴄʜᴀɴɴᴇʟ https://shorturl.at/z3b8v\n\n®2025 ʙᴡᴍ xᴍᴅ 🔥`,
          contextInfo: {
            externalAdReply: {
              title: "©Sir Ibrahim Adams",
              body: "Faster bot",
              mediaType: 1,
              thumbnailUrl: "https://files.catbox.moe/3ejs31.jpg",
              sourceUrl: 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y',
              renderLargerThumbnail: false,
              showAdAttribution: true,
            },
          },
        },
        { quoted: ms }
      );

      // Inform user that processing is in progress
      const processingMsg = await zk.sendMessage(
        dest,
        { text: "⏳ Your audio is being processed, just a moment..." },
        { quoted: ms }
      );

      // Fetch result from the new API
      const apiUrl = `https://apis.giftedtech.web.id/api/download/dlmp3?apikey=gifted&url=${encodeURIComponent(videoUrl)}`;
      const response = await axios.get(apiUrl).then((res) => res.data).catch(() => null);

      if (!response || !response.success || !response.result || !response.result.download_url) {
        await zk.sendMessage(dest, { text: "❌ Failed to download. Try again later.", edit: processingMsg.key });
        return;
      }

      const downloadUrl = response.result.download_url; // Extract the download URL
      const tempFile = path.join(__dirname, "audio.mp3");

      // Download the audio
      const writer = fs.createWriteStream(tempFile);
      const audioStream = await axios({ url: downloadUrl, method: "GET", responseType: "stream" });
      audioStream.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Delete the processing message before sending audio
      await zk.sendMessage(dest, { delete: processingMsg.key });

      // Send the audio file immediately
      await zk.sendMessage(
        dest,
        {
          audio: fs.readFileSync(tempFile),
          mimetype: "audio/mp4",
          contextInfo: {
            externalAdReply: {
              title: videoTitle,
              body: `🎶 ${videoTitle} | Duration: ${videoDuration}`,
              mediaType: 1,
              sourceUrl: 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y',
              thumbnailUrl: videoThumbnail,
              renderLargerThumbnail: true,
              showAdAttribution: true,
            },
          },
        },
        { quoted: ms }
      );

      // Delete temp file after sending
      fs.unlinkSync(tempFile);
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`❌ Download failed: ${error.message || error}`);
    }
  }
);

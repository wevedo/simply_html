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
      return repondre("❌ *Provide a song name!*");
    }

    const query = arg.join(" ");

    try {
      // 🎵 Searching for the song...
      const searchResults = await ytSearch(query);
      if (!searchResults.videos.length) {
        return repondre("🚫 *No song found!*");
      }

      const firstVideo = searchResults.videos[0];
      const videoUrl = firstVideo.url;
      const videoTitle = firstVideo.title;
      const videoDuration = firstVideo.timestamp;
      const videoThumbnail = firstVideo.thumbnail;
      const videoChannel = firstVideo.author.name;

      // ✅ Sending song details instantly!
      await zk.sendMessage(
        dest,
        {
          text: `╭──❍ *𝘽𝙒𝙈 𝙓𝙈𝘿 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿𝙀𝙍* ❍──╮\n` +
                `📌 *Title:* ${videoTitle}\n` +
                `🎭 *Channel:* ${videoChannel}\n` +
                `⏳ *Duration:* ${videoDuration}\n`,
          contextInfo: {
            externalAdReply: {
              title: "𝘽𝙒𝙈 𝙓𝙈𝘿 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿𝙀𝙍",
              body: "𝙁𝙖𝙨𝙩 𝙖𝙣𝙙 𝙎𝙢𝙤𝙤𝙩𝙝 🔥",
              mediaType: 1,
              thumbnailUrl: videoThumbnail,
              sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
              renderLargerThumbnail: true,
              showAdAttribution: true,
            },
          },
        },
        { quoted: ms }
      );

      // ⏳ Sending a temporary processing message
      const processingMsg = await zk.sendMessage(
        dest,
        { text: "🔄 *_Processing your audio..._*" },
        { quoted: ms }
      );

      // 🎧 Fetching audio using API
      const apiUrl = `https://apis.giftedtech.web.id/api/download/dlmp3?apikey=gifted&url=${encodeURIComponent(videoUrl)}`;
      const response = await axios.get(apiUrl).then(res => res.data).catch(() => null);

      if (!response || !response.success || !response.result || !response.result.download_url) {
        await zk.sendMessage(dest, { text: "❌ *Failed to fetch audio!*", edit: processingMsg.key });
        return;
      }

      const downloadUrl = response.result.download_url;
      const tempFile = path.join(__dirname, "audio.mp3");

      // 🔽 Downloading the audio file
      const writer = fs.createWriteStream(tempFile);
      const audioStream = await axios({ url: downloadUrl, method: "GET", responseType: "stream" });
      audioStream.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // 🚀 Deleting processing message before sending audio
      await zk.sendMessage(dest, { delete: processingMsg.key });

      // 🎶 Sending audio with a stylish format
      await zk.sendMessage(
        dest,
        {
          audio: fs.readFileSync(tempFile),
          mimetype: "audio/mp4",
          contextInfo: {
            externalAdReply: {
              title: "🎵 " + videoTitle,
              body: `📀 *Duration:* ${videoDuration}`,
              mediaType: 1,
              sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
              thumbnailUrl: videoThumbnail,
              renderLargerThumbnail: true,
              showAdAttribution: true,
            },
          },
        },
        { quoted: ms }
      );

      // 🗑️ Deleting temp file after sending
      fs.unlinkSync(tempFile);
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`❌ *Error:* ${error.message || error}`);
    }
  }
);

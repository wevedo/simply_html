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
      return repondre("🎤 *Please provide a song name!*\nExample: .play Alan Walker - Faded");
    }

    const query = arg.join(" ");

    try {
      // Step 1: Search for the song on YouTube
      const searchResults = await ytSearch(query);
      if (!searchResults.videos.length) {
        return repondre("🔍 *No video found for your query!*\nTry a different song name.");
      }

      const firstVideo = searchResults.videos[0];
      const videoUrl = firstVideo.url;
      const videoTitle = firstVideo.title;
      const videoDuration = firstVideo.timestamp;
      const videoThumbnail = firstVideo.thumbnail;
      const videoChannel = firstVideo.author.name;

      // Step 2: Send a fast, visually appealing response with YouTube search results
      const searchResponse = await zk.sendMessage(
        dest,
        {
          text: `🎧 *Now Playing:* ${videoTitle}\n🎤 *Channel:* ${videoChannel}\n⏳ *Duration:* ${videoDuration}\n\n📥 *Downloading your audio... Please wait!*`,
          contextInfo: {
            externalAdReply: {
              title: "🎶 BWM XMD Music Bot",
              body: "Powered by GiftedTech API",
              mediaType: 1,
              thumbnailUrl: videoThumbnail,
              sourceUrl: videoUrl,
              renderLargerThumbnail: true,
              showAdAttribution: true,
            },
          },
        },
        { quoted: ms }
      );

      // Step 3: Inform user that processing is in progress with a creative message
      const processingMsg = await zk.sendMessage(
        dest,
        {
          text: "⏳ *Processing your request...*\n\n✨ *Did you know?*\nMusic is the only art form that can instantly change your mood! 🎶\n\nHold tight while we prepare your audio...",
        },
        { quoted: ms }
      );

      // Step 4: Fetch audio from the new API
      const apiUrl = `https://apis.giftedtech.web.id/api/download/dlmp3?apikey=gifted&url=${encodeURIComponent(videoUrl)}`;
      const response = await axios.get(apiUrl).then((res) => res.data).catch(() => null);

      if (!response || !response.success || !response.result || !response.result.download_url) {
        await zk.sendMessage(dest, { text: "❌ *Failed to download!*\nPlease try again later or use a different song.", edit: processingMsg.key });
        return;
      }

      const downloadUrl = response.result.download_url;
      const tempFile = path.join(__dirname, "audio.mp3");

      // Step 5: Download the audio
      const writer = fs.createWriteStream(tempFile);
      const audioStream = await axios({ url: downloadUrl, method: "GET", responseType: "stream" });
      audioStream.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Step 6: Auto-delete the search and processing messages
      await zk.sendMessage(dest, { delete: searchResponse.key });
      await zk.sendMessage(dest, { delete: processingMsg.key });

      // Step 7: Send the audio file with a creative message
      await zk.sendMessage(
        dest,
        {
          audio: fs.readFileSync(tempFile),
          mimetype: "audio/mp4",
          contextInfo: {
            externalAdReply: {
              title: "🎶 Your Audio is Ready!",
              body: `📌 *Title:* ${videoTitle}\n⏳ *Duration:* ${videoDuration}\n\nEnjoy your music! 🎧`,
              mediaType: 1,
              sourceUrl: videoUrl,
              thumbnailUrl: videoThumbnail,
              renderLargerThumbnail: true,
              showAdAttribution: true,
            },
          },
        },
        { quoted: ms }
      );

      // Step 8: Send a creative follow-up message
      await zk.sendMessage(
        dest,
        {
          text: "🎉 *Your audio is ready!*\n\n🌟 *Here's a fun fact:*\nThe world's longest concert lasted over 639 hours! 🎹\n\nEnjoy your music and stay tuned for more updates! 🚀",
        },
        { quoted: ms }
      );

      // Step 9: Delete the temporary file
      fs.unlinkSync(tempFile);
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`❌ *Oops! Something went wrong.*\nError: ${error.message || "Please try again later."}`);
    }
  }
);

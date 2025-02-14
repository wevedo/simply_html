const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const { exec } = require("child_process");
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

      // Notify user that download is starting
      const downloadMessage = await zk.sendMessage(
        dest,
        {
          text: `🎶 *Downloading:* ${videoTitle}\n⏳ *Duration:* ${videoDuration}\n🎭 *Channel:* ${videoChannel}`,
          contextInfo: {
            externalAdReply: {
              title: videoTitle,
              body: "Bwm XMD Downloader",
              mediaType: 1,
              thumbnailUrl: videoThumbnail,
              sourceUrl: videoUrl,
              renderLargerThumbnail: false,
              showAdAttribution: true,
            },
          },
        },
        { quoted: ms }
      );

      // Start auto-counting in one message box
      let count = 0;
      let countingMessage = await zk.sendMessage(dest, { text: "⏳ Downloading... 0%" });

      const countingInterval = setInterval(async () => {
        count += Math.floor(Math.random() * 5) + 1; // Random increment (1-5%)
        if (count > 99) count = 99; // Stop at 99% to avoid completion before actual download

        await zk.sendMessage(
          dest,
          {
            text: `⏳ Downloading... ${count}%`,
            disappearingMessagesInChat: true,
            ephemeralExpiration: 1, // Message disappears after 1 second 
          },
          { quoted: countingMessage }
        );
      }, 1000); // Update every second

      // List of APIs for MP3 download
      const apis = [
        `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
        `https://api.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(videoUrl)}`,
        `https://api.giftedtech.web.id/api/download/dlmp3?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`,
      ];

      // Fetch results from all APIs concurrently
      const apiResponses = await Promise.allSettled(
        apis.map((api) =>
          axios.get(api).then((res) => res.data).catch(() => null)
        )
      );

      // Find the first successful API response
      let downloadData = null;
      for (const response of apiResponses) {
        if (
          response.status === "fulfilled" &&
          response.value &&
          response.value.success
        ) {
          downloadData = response.value.result;
          break;
        }
      }

      if (!downloadData || !downloadData.download_url) {
        clearInterval(countingInterval); // Stop counting
        return repondre("Failed to retrieve a download link. Please try again later.");
      }

      const downloadUrl = downloadData.download_url;
      const tempFile = path.join(__dirname, "audio_high.mp3");
      const lowQualityFile = path.join(__dirname, "audio_low.mp3");

      // Download the high-quality audio
      const writer = fs.createWriteStream(tempFile);
      const response = await axios({ url: downloadUrl, method: "GET", responseType: "stream" });
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Convert to low-quality (48kbps) using ffmpeg
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${tempFile} -b:a 48k ${lowQualityFile}`, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      // Stop auto-counting
      clearInterval(countingInterval);

      // Send the compressed audio file
      await zk.sendMessage(
        dest,
        {
          audio: fs.readFileSync(lowQualityFile),
          mimetype: "audio/mp4",
          contextInfo: {
            externalAdReply: {
              title: videoTitle,
              body: `🎶 ${videoTitle} | Duration: ${videoDuration}`,
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

      // Delete temp files after sending
      fs.unlinkSync(tempFile);
      fs.unlinkSync(lowQualityFile);
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`Download failed due to an error: ${error.message || error}`);
    }
  }
);

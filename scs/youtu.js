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
      let progressMessage = await zk.sendMessage(
        dest,
        {
          text: `⏳ *Downloading...* 0%`,
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

      let count = 0;
      const progressUpdateInterval = setInterval(async () => {
        count += Math.floor(Math.random() * 10) + 5; // Random increment (5-15%)
        if (count >= 99) count = 99; // Stop at 99% before actual download completes

        await zk.sendMessage(
          dest,
          { text: `⏳ *Downloading...* ${count}%` },
          { edit: progressMessage.key } // Update the same message
        );
      }, 1500); // Update every 1.5 seconds

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
        clearInterval(progressUpdateInterval); // Stop progress updates
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

      // Stop auto-counting and update message to "Download complete"
      clearInterval(progressUpdateInterval);
      await zk.sendMessage(
        dest,
        { text: `✅ *Download Complete! Sending Audio...*` },
        { edit: progressMessage.key }
      );

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

      // Delete the progress message after sending the audio
      await zk.sendMessage(
        dest,
        { delete: progressMessage.key }
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

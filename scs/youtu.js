const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const { exec } = require("child_process");
const fs = require("fs");
const ytSearch = require("yt-search");
const path = require("path");

// Delay function
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Loading progress bar
async function loading(dest, zk, msgKey) {
  const lod = [
    "▰▱▱▱▱▱▱▱▱▱ 10%",
    "▰▰▱▱▱▱▱▱▱▱ 30%",
    "▰▰▰▰▱▱▱▱▱▱ 50%",
    "▰▰▰▰▰▰▰▱▱▱ 80%",
    "▰▰▰▰▰▰▰▰▰▰ 100%",
    "✅ *Download Completed!*"
  ];

  for (let i = 0; i < lod.length; i++) {
    await zk.sendMessage(dest, { text: lod[i], edit: msgKey });
    await delay(2000); // Smooth interval without crashes
  }
}

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

      // Send song details immediately
      const infoMessage = await zk.sendMessage(
        dest,
        {
          text: `🎶 *Song Found!*\n📌 *Title:* ${videoTitle}\n⏳ *Duration:* ${videoDuration}\n🎭 *Channel:* ${videoChannel}\n🔗 *Link:* ${videoUrl}`,
          contextInfo: {
            externalAdReply: {
              title: videoTitle,
              body: "Bwm XMD Downloader",
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

      // Start progress bar
      const progressMessage = await zk.sendMessage(dest, { text: "⏳ *Downloading...*" }, { quoted: ms });
      loading(dest, zk, progressMessage.key);

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

      // Delete progress message after completion
      await zk.sendMessage(dest, { delete: progressMessage.key });

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

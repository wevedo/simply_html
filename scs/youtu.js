const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const { exec } = require("child_process");
const fs = require("fs");
const ytSearch = require("yt-search");
const path = require("path");

// Delay function (smooth performance)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Smooth loading animation function
async function showLoading(dest, zk) {
  const loadingStages = [
    "📥 Downloading... ░░░░░░░░░░ 0%",
    "📥 Downloading... █░░░░░░░░░ 20%",
    "📥 Downloading... ██░░░░░░░░ 40%",
    "📥 Downloading... ████░░░░░░ 60%",
    "📥 Downloading... ██████░░░░ 80%",
    "📥 Downloading... ████████✅ 100%",
  ];

  let { key } = await zk.sendMessage(dest, { text: loadingStages[0] });

  for (let i = 1; i < loadingStages.length; i++) {
    await delay(1500); // Smooth update every 1.5 seconds
    await zk.sendMessage(dest, { text: loadingStages[i], edit: key });
  }

  return key; // Return message key to delete later
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

      // Send song info immediately
      const songInfoMessage = await zk.sendMessage(
        dest,
        {
          text: `🎵 *Now Downloading:*\n📌 *Title:* ${videoTitle}\n🎭 *Channel:* ${videoChannel}\n⏳ *Duration:* ${videoDuration}`,
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

      // Show smooth loading animation
      const loadingKey = await showLoading(dest, zk);

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
        await zk.sendMessage(dest, { text: "❌ Failed to download. Try again later.", edit: loadingKey });
        return;
      }

      const downloadUrl = downloadData.download_url;
      const tempFile = path.join(__dirname, "audio_high.mp3");
      const finalFile = path.join(__dirname, "audio_normal.mp3");

      // Download the high-quality audio
      const writer = fs.createWriteStream(tempFile);
      const response = await axios({ url: downloadUrl, method: "GET", responseType: "stream" });
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Convert to normal quality (96kbps for balance between quality & speed)
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${tempFile} -b:a 96k ${finalFile}`, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      // Delete loading animation message
      await zk.sendMessage(dest, { delete: loadingKey });

      // Send the compressed audio file
      await zk.sendMessage(
        dest,
        {
          audio: fs.readFileSync(finalFile),
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
      fs.unlinkSync(finalFile);
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`❌ Download failed: ${error.message || error}`);
    }
  }
);

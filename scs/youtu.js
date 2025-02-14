const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const ytSearch = require("yt-search");

// Command for downloading audio (MP3)
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

      // Notify user about the download instantly
      await zk.sendMessage(
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

      // List of APIs for MP3 download (Standard Quality)
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

      // Send the audio file directly for faster delivery
      await zk.sendMessage(
        dest,
        {
          audio: { url: downloadUrl },
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
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`Download failed due to an error: ${error.message || error}`);
    }
  }
);

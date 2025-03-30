/*const { adams } = require("../Ibrahim/adams");
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

      // Notify user about the ongoing download
      const downloadingMessage = {
        text: `🎶 *Downloading:* ${videoTitle}\n⏳ *Duration:* ${videoDuration}`,
        contextInfo: {
          externalAdReply: {
            title: videoTitle,
            body: "Bwm xmd downloader",
            mediaType: 1,
            thumbnailUrl: videoThumbnail,
            sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      };
      await zk.sendMessage(dest, downloadingMessage, { quoted: ms });

      // List of APIs for MP3 download
      const apis = [
        `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
        `https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
        `https://api.giftedtech.web.id/api/download/dlmp3?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`,
        `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(videoUrl)}`,
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
      const audioTitle = downloadData.title || videoTitle;

      // Send the audio file
      const audioPayload = {
        audio: { url: downloadUrl },
        mimetype: "audio/mp4",
        contextInfo: {
          externalAdReply: {
            title: audioTitle,
            body: `🎶 ${audioTitle} | Duration: ${videoDuration}`,
            mediaType: 1,
            sourceUrl: videoUrl,
            thumbnailUrl: videoThumbnail,
            renderLargerThumbnail: true,
            showAdAttribution: true,
          },
        },
      };

      await zk.sendMessage(dest, audioPayload, { quoted: ms });
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`Download failed due to an error: ${error.message || error}`);
    }
  }
);



adams(
  {
    nomCom: "song",
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

      // Notify user about the ongoing download
      const downloadingMessage = {
        text: `🎶 *Downloading:* ${videoTitle}\n⏳ *Duration:* ${videoDuration}`,
        contextInfo: {
          externalAdReply: {
            title: videoTitle,
            body: "Bwm xmd downloader",
            mediaType: 1,
            thumbnailUrl: videoThumbnail,
            sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      };
      await zk.sendMessage(dest, downloadingMessage, { quoted: ms });

      // List of APIs for MP3 download
      const apis = [
        `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
        `https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
        `https://api.giftedtech.web.id/api/download/dlmp3?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`,
        `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(videoUrl)}`,
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
      const audioTitle = downloadData.title || videoTitle;

      // Send the audio file
      const audioPayload = {
        audio: { url: downloadUrl },
        mimetype: "audio/mp4",
        contextInfo: {
          externalAdReply: {
            title: audioTitle,
            body: `🎶 ${audioTitle} | Duration: ${videoDuration}`,
            mediaType: 1,
            sourceUrl: videoUrl,
            thumbnailUrl: videoThumbnail,
            renderLargerThumbnail: true,
            showAdAttribution: true,
          },
        },
      };

      await zk.sendMessage(dest, audioPayload, { quoted: ms });
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`Download failed due to an error: ${error.message || error}`);
    }
  }
);



// Command for downloading video (MP4)
adams(
  {
    nomCom: "video",
    aliases: ["vide", "mp4"],
    categorie: "Search",
    reaction: "🎬",
  },
  async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;

    if (!arg[0]) {
      return repondre("Please provide a video name.");
    }

    const query = arg.join(" ");

    try {
      // Search for the video on YouTube
      const searchResults = await ytSearch(query);
      if (!searchResults.videos.length) {
        return repondre("No video found for the specified query.");
      }

      const firstVideo = searchResults.videos[0];
      const videoUrl = firstVideo.url;
      const videoTitle = firstVideo.title;
      const videoDuration = firstVideo.timestamp;
      const videoThumbnail = firstVideo.thumbnail;

      // Notify user about the ongoing download
      const downloadingMessage = {
        text: `🎬 *Downloading:* ${videoTitle}\n⏳ *Duration:* ${videoDuration}`,
        contextInfo: {
          externalAdReply: {
            title: videoTitle,
            body: "Bwm xmd downloader",
            mediaType: 2,
            thumbnailUrl: videoThumbnail,
            sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      };
      await zk.sendMessage(dest, downloadingMessage, { quoted: ms });

      // List of APIs for MP4 download
      const apis = [
        `https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
        `https://www.dark-yasiya-api.site/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
        `https://api.giftedtech.web.id/api/download/dlmp4?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`,
        `https://api.dreaded.site/api/ytdl/video?url=${encodeURIComponent(videoUrl)}`,
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
      const videoTitleFinal = downloadData.title || videoTitle;

      // Send the video file
      const videoPayload = {
        video: { url: downloadUrl },
        mimetype: "video/mp4",
        caption: `🎬 *${videoTitleFinal}*\n⏳ *Duration:* ${videoDuration}`,
        contextInfo: {
          externalAdReply: {
            title: videoTitleFinal,
            body: `🎬 ${videoTitleFinal} | Duration: ${videoDuration}`,
            mediaType: 2, // MediaType 2 = video
            sourceUrl: videoUrl,
            thumbnailUrl: videoThumbnail,
            renderLargerThumbnail: true,
            showAdAttribution: true,
          },
        },
      };

      await zk.sendMessage(dest, videoPayload, { quoted: ms });
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`Download failed due to an error: ${error.message || error}`);
    }
  }
);
*/

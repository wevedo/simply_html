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
      const videoViews = firstVideo.views;
      const videoThumbnail = firstVideo.thumbnail;

      // Format the downloading message
      const downloadingMessage = {
        text: `
╭────────────✧
 ❘ *𝘽𝙒𝙈 𝙓𝙈𝘿 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿𝙀𝙍*
╰────────────✧
╭────────────✧
 *Title :* ${videoTitle}
 *Duration :* ${videoDuration}
 *Views :* ${videoViews}
╰────────────✧

> © Sir Ibrahim Adams
        `,
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

      // Send "Just a minute" message
      const waitMessage = await zk.sendMessage(dest, { text: "Just a minute, your audio is being downloaded..." }, { quoted: ms });

      // New API endpoint
      const api = `https://api.bwmxmd.online/api/download/ytmp3?apikey=ibraah-help&url=${encodeURIComponent(videoUrl)}`;

      // Fetch data from the new API
      const response = await axios.get(api);
      const downloadData = response.data;

      if (!downloadData || !downloadData.success || !downloadData.result.download_url) {
        return repondre("Failed to retrieve a download link. Please try again later.");
      }

      const downloadUrl = downloadData.result.download_url;
      const audioTitle = downloadData.result.title || videoTitle;

      // Delete the "Just a minute" message
      await zk.sendMessage(dest, { delete: waitMessage.key });

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

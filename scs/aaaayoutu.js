const { adams } = require("../Ibrahim/adams");
const axios = require('axios');
const ytSearch = require('yt-search');

adams({
  nomCom: "play",
  aliases: ["song", "audio", "mp3"],
  categorie: "Search",
  reaction: "🎵"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre } = commandOptions;

  if (!arg[0]) {
    return repondre("Please provide a video name.");
  }

  const query = arg.join(" ");

  try {
    // Search for the video on YouTube
    const searchResults = await ytSearch(query);
    if (!searchResults || searchResults.videos.length === 0) {
      return repondre('No video found for the specified query.');
    }

    const firstVideo = searchResults.videos[0];
    const videoUrl = firstVideo.url;

    // Notify the user
    await zk.sendMessage(dest, {
      text: `*Bwm is downloading ${firstVideo.title}*`,
      contextInfo: {
        externalAdReply: {
          title: firstVideo.title,
          body: "Bwm xmd downloader",
          mediaType: 1,
          thumbnailUrl: firstVideo.thumbnail,
          sourceUrl: videoUrl,
          renderLargerThumbnail: false,
          showAdAttribution: true,
        },
      },
    }, { quoted: ms });

    // Download from the fallback API
    const fallbackApi = `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(videoUrl)}`;
    const fallbackResponse = await axios.get(fallbackApi);

    if (fallbackResponse.status !== 200 || !fallbackResponse.data.status) {
      throw new Error("Failed to retrieve download URL.");
    }

    const downloadUrl = fallbackResponse.data.data.dl;

    // Send the downloaded audio
    await zk.sendMessage(dest, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mp4',
      contextInfo: {
        externalAdReply: {
          title: firstVideo.title,
          body: `🎶 ${firstVideo.title} | Download complete`,
          mediaType: 1,
          sourceUrl: videoUrl,
          thumbnailUrl: firstVideo.thumbnail,
          renderLargerThumbnail: true,
          showAdAttribution: true,
        },
      },
    }, { quoted: ms });

  } catch (error) {
    console.error('Error:', error.message);
    return repondre(`Download failed due to an error: ${error.message || error}`);
  }
});

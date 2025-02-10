const { adams } = require("../Ibrahim/adams");
const axios = require('axios');
const ytSearch = require('yt-search');

// Command for downloading audio (MP3)
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
    // Perform a YouTube search
    const searchResults = await ytSearch(query);
    if (!searchResults || searchResults.videos.length === 0) {
      return repondre('No video found for the specified query.');
    }

    const firstVideo = searchResults.videos[0];
    const videoUrl = firstVideo.url;
    const videoTitle = firstVideo.title;
    const videoThumbnail = firstVideo.thumbnail;
    const videoDuration = firstVideo.timestamp;
    const videoViews = firstVideo.views.toLocaleString();
    const videoUploaded = firstVideo.ago;

    // Notify the user
    await zk.sendMessage(dest, {
      text: `*🎵 Bwm is downloading ${videoTitle}*\n\n📌 *Title:* ${videoTitle}\n⏱ *Duration:* ${videoDuration}\n👀 *Views:* ${videoViews}\n📅 *Uploaded:* ${videoUploaded}`,
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
    }, { quoted: ms });

    let downloadUrl = null;

    // **Primary API: OceanSaver**
    try {
      const apiUrl = `https://p.oceansaver.in/ajax/download.php?format=mp3&url=${encodeURIComponent(videoUrl)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`;
      let response = await axios.get(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });

      if (response.data && response.data.success) {
        const { id } = response.data;

        // Check progress
        while (true) {
          let progress = await axios.get(`https://p.oceansaver.in/ajax/progress.php?id=${id}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });

          if (progress.data && progress.data.success && progress.data.progress === 1000) {
            downloadUrl = progress.data.download_url;
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before checking again
        }
      } else {
        throw new Error("Primary API failed.");
      }
    } catch (error) {
      console.error("API Error:", error.message);
      return repondre('Failed to retrieve download URL.');
    }

    // Send the downloaded audio
    await zk.sendMessage(dest, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mp4',
      contextInfo: {
        externalAdReply: {
          title: videoTitle,
          body: `🎶 ${videoTitle} | Download complete`,
          mediaType: 1,
          sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
          thumbnailUrl: videoThumbnail,
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

// Command for downloading video (MP4)
adams({
  nomCom: "video",
  aliases: ["mp4", "vid", "vdo"],
  categorie: "Search",
  reaction: "📹"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre } = commandOptions;

  if (!arg[0]) {
    return repondre("Please provide a video name.");
  }

  const query = arg.join(" ");

  try {
    // Perform a YouTube search
    const searchResults = await ytSearch(query);
    if (!searchResults || searchResults.videos.length === 0) {
      return repondre('No video found for the specified query.');
    }

    const firstVideo = searchResults.videos[0];
    const videoUrl = firstVideo.url;
    const videoTitle = firstVideo.title;
    const videoThumbnail = firstVideo.thumbnail;
    const videoDuration = firstVideo.timestamp;
    const videoViews = firstVideo.views.toLocaleString();
    const videoUploaded = firstVideo.ago;

    // Notify the user
    await zk.sendMessage(dest, {
      text: `*📹 Bwm is downloading ${videoTitle}*\n\n📌 *Title:* ${videoTitle}\n⏱ *Duration:* ${videoDuration}\n👀 *Views:* ${videoViews}\n📅 *Uploaded:* ${videoUploaded}`,
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
    }, { quoted: ms });

    let downloadUrl = null;

    // **Primary API: OceanSaver for MP4**
    try {
      const apiUrl = `https://p.oceansaver.in/ajax/download.php?format=mp4&url=${encodeURIComponent(videoUrl)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`;
      let response = await axios.get(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });

      if (response.data && response.data.success) {
        const { id } = response.data;

        // Check progress
        while (true) {
          let progress = await axios.get(`https://p.oceansaver.in/ajax/progress.php?id=${id}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });

          if (progress.data && progress.data.success && progress.data.progress === 1000) {
            downloadUrl = progress.data.download_url;
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before checking again
        }
      } else {
        throw new Error("Primary API failed.");
      }
    } catch (error) {
      console.error("API Error:", error.message);
      return repondre('Failed to retrieve download URL.');
    }

    // Send the downloaded video
    await zk.sendMessage(dest, {
      video: { url: downloadUrl },
      mimetype: 'video/mp4',
      contextInfo: {
        externalAdReply: {
          title: videoTitle,
          body: `📹 ${videoTitle} | Download complete`,
          mediaType: 1,
          sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
          thumbnailUrl: videoThumbnail,
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

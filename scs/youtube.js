const { adams } = require("../Ibrahim/adams");
const axios = require('axios');
const ytSearch = require('yt-search');
const yt = require("../lib/adamss"); // Importing download functions
const { downloadVideo } = yt; // Importing the downloadVideo function
// Define the command with aliases
adams({
  nomCom: "play",
  aliases: ["song", "ytmp3", "audio", "mp3"],
  categorie: "Search",
  reaction: "🎥"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre } = commandOptions;

  // Check if a query is provided
  if (!arg[0]) {
    return repondre("Please provide a video name.");
  }

  const query = arg.join(" ");

  try {
    // Perform a YouTube search based on the query
    const searchResults = await ytSearch(query);

    // Check if any videos were found
    if (!searchResults || !searchResults.videos.length) {
      return repondre('No video found for the specified query.');
    }

    const firstVideo = searchResults.videos[0];
    const videoUrl = firstVideo.url;

    // Send a fast response to indicate downloading
    const fastResponse = {
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
    };
    await zk.sendMessage(dest, fastResponse, { quoted: ms });

    // Function to get download data from APIs
    const getDownloadData = async (url) => {
      try {
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        console.error('Error fetching data from API:', error.message);
        return { success: false };
      }
    };

    // List of APIs to try
    const apis = [
      `https://api-rin-tohsaka.vercel.app/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
      `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
      `https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
      `https://api.giftedtech.web.id/api/download/dlmp3?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`,
      `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(videoUrl)}`
    ];

    let downloadData;
    for (const api of apis) {
      downloadData = await getDownloadData(api);
      if (downloadData && downloadData.success) break;
    }

    // Check if a valid download URL was found
    if (!downloadData || !downloadData.success) {
      return repondre('Failed to retrieve download URL from all sources. Please try again later.');
    }

    const downloadUrl = downloadData.result.download_url;
    const videoDetails = downloadData.result;

    // Prepare the audio message payload
    const audioPayload = {
      audio: { url: downloadUrl },
      mimetype: 'audio/mp4',
      contextInfo: {
        externalAdReply: {
          title: videoDetails.title,
          body: `🎶 ${videoDetails.title} | Download complete`,
          mediaType: 1,
          sourceUrl: 'https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47',
          thumbnailUrl: firstVideo.thumbnail,
          renderLargerThumbnail: true,
          showAdAttribution: true,
        },
      },
    };

    // Send the downloaded audio to the user
    await zk.sendMessage(dest, audioPayload, { quoted: ms });

  } catch (error) {
    console.error('Error during download process:', error.message);
    return repondre(`Download failed due to an error: ${error.message || error}`);
  }
});


// Define the command with aliases
adams({
  nomCom: "video ",
  aliases: ["video ", "ytmp4", "audio", "mp3"],
  categorie: "Search",
  reaction: "🎥"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre } = commandOptions;

  // Check if a query is provided
  if (!arg[0]) {
    return repondre("Please provide a video name.");
  }

  const query = arg.join(" ");

  try {
    // Perform a YouTube search based on the query
    const searchResults = await ytSearch(query);

    // Check if any videos were found
    if (!searchResults || !searchResults.videos.length) {
      return repondre('No video found for the specified query.');
    }

    const firstVideo = searchResults.videos[0];
    const videoUrl = firstVideo.url;

    // Send a fast response to indicate downloading
    const fastResponse = {
      text: `*Bwm is downloading ${firstVideo.title}*`",
      contextInfo: {
        externalAdReply: {
          title: firstVideo.title,
          body: "Bwm xmd downloader",
          mediaType: 1,
          thumbnailUrl: firstVideo.thumbnail,
          sourceUrl: videoUrl,
          renderLargerThumbnail: true,
          showAdAttribution: true,
        },
      },
    };
    await zk.sendMessage(dest, fastResponse, { quoted: ms });

    // Function to get download data from APIs
    const getDownloadData = async (url) => {
      try {
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        console.error('Error fetching data from API:', error.message);
        return { success: false };
      }
    };

    // List of APIs to try
    const apis = [
      `https://api-rin-tohsaka.vercel.app/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
      `https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
      `https://www.dark-yasiya-api.site/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
      `https://api.giftedtech.web.id/api/download/dlmp4?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`,
      `https://api.dreaded.site/api/ytdl/video?url=${encodeURIComponent(videoUrl)}`
    ];

    let downloadData;
    for (const api of apis) {
      downloadData = await getDownloadData(api);
      if (downloadData && downloadData.success) break;
    }

    // Check if a valid download URL was found
    if (!downloadData || !downloadData.success) {
      return repondre('Failed to retrieve download URL from all sources. Please try again later.');
    }

    const downloadUrl = downloadData.result.download_url;
    const videoDetails = downloadData.result;

    // Prepare the video message payload
    const videoPayload = {
      video: { url: downloadUrl },
      mimetype: 'video/mp4',
      contextInfo: {
        externalAdReply: {
          title: videoDetails.title,
          body: `🎬 ${videoDetails.title} | Download complete`,
          mediaType: 2,  // MediaType 2 indicates video
          sourceUrl: 'https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47',
          thumbnailUrl: firstVideo.thumbnail,
          renderLargerThumbnail: true,
          showAdAttribution: true,
        },
      },
    };

    // Send the downloaded video to the user
    await zk.sendMessage(dest, videoPayload, { quoted: ms });

  } catch (error) {
    console.error('Error during download process:', error.message);
    return repondre(`Download failed due to an error: ${error.message || error}`);
  }
});



/*
const { adams } = require("../Ibrahim/adams");
const yts = require("yt-search");
const axios = require("axios");

const WhatsAppChannelURL = "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y";

// Fast API without API Key
const fastAPIBase = "https://api.davidcyriltech.my.id/download/";

// Primary API with API Key
const primaryAPIBase = "http://apis.ibrahimadams.us.kg";
const adamsApiKey = "ibraah-tech";

// Search YouTube Function
async function searchYouTube(query) {
  try {
    const search = await yts(query);
    return search.videos.length > 0 ? search.videos[0] : null;
  } catch (error) {
    console.error("YouTube Search Error:", error.message);
    throw new Error("Failed to search YouTube. Please try again.");
  }
}

// Download Media Function
async function downloadMedia(url, type) {
  try {
    // Fast API
    const fastEndpoint = `${fastAPIBase}yt${type}?url=${encodeURIComponent(url)}`;
    const fastResponse = await axios.get(fastEndpoint);
    console.log("Fast API Response:", fastResponse.data);

    if (fastResponse.data.status === 200 && fastResponse.data.success) {
      return fastResponse.data.result.download_url;
    } else {
      throw new Error(fastResponse.data.message || "Fast API download failed.");
    }
  } catch (error) {
    console.error("Fast API Error:", error.message);

    // Fallback to Primary API
    try {
      const primaryEndpoint = `${primaryAPIBase}/api/download/yt${type}?url=${encodeURIComponent(url)}&apikey=${adamsApiKey}`;
      const primaryResponse = await axios.get(primaryEndpoint);
      console.log("Primary API Response:", primaryResponse.data);

      if (primaryResponse.data.status === 200 && primaryResponse.data.success) {
        return primaryResponse.data.result.download_url;
      } else {
        throw new Error(primaryResponse.data.message || "Primary API download failed.");
      }
    } catch (fallbackError) {
      console.error("Primary API Error:", fallbackError.message);
      throw new Error(`Failed to download ${type}. Please try again later.`);
    }
  }
}

// Video Command
adams(
  {
    nomCom: "video",
    categorie: "Search",
    reaction: "🎥",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;

    if (!arg[0]) return repondre("Please insert a song/video name.");

    try {
      const video = await searchYouTube(arg.join(" "));
      if (!video) return repondre("No videos found. Try another name.");

      const responseMessage = `*Bwm xmd is downloading ${video.title}*`;
      await zk.sendMessage(dest, {
text: responseMessage,
      contextInfo: {
        mentionedJid: [dest.sender || ""],
        externalAdReply: {
          title: video.title,
          body: `👤 ${video.author.name} | ⏱️ ${video.timestamp}`,
          thumbnailUrl: video.thumbnail,
          sourceUrl: WhatsAppChannelURL,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true,
        },
        forwardingScore: 999,
        isForwarded: false,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '0029VaZuGSxEawdxZK9CzM0Y@s.whatsapp.net',
          newsletterName: "Bwm xmd Updates 🚀",
          serverMessageId: 143,
        },
      },
      quoted: ms,
     
      });

      const videoDlUrl = await downloadMedia(video.url, "mp4");
      if (!videoDlUrl) return repondre("Failed to download the video.");

      await zk.sendMessage(dest, {
          video: { url: videoDlUrl },
      mimetype: 'video/mp4',
      caption: `*${video.title}*\n👤 Author: ${video.author.name}\n⏱️ Duration: ${video.timestamp}`,
      contextInfo: {
        externalAdReply: {
          title: `📍 ${video.title}`,
          body: `👤 ${video.author.name}\n⏱️ ${video.timestamp}`,
          thumbnailUrl: video.thumbnail,
          renderLargerThumbnail: true,
          sourceUrl: WhatsAppChannelURL, // Clickable URL for your channel
        },
        forwardingScore: 999,  // Increased score for forward likelihood
        isForwarded: true,     // Mark as forwarded
        forwardedNewsletterMessageInfo: {
          newsletterJid: '0029VaZuGSxEawdxZK9CzM0Y',   // Leave empty or use a specific Jid
          newsletterName: "Bwm xmd Updates 🚀", // Cool name or title here
          serverMessageId: 143, // Example ID, adjust if needed
        },
      }
    }, { quoted: ms });
    } catch (error) {
      console.error("Video Command Error:", error.message);
      repondre("An error occurred while processing your request. Please try again.");
    }
  }
);

// Play Command
adams(
  {
    nomCom: "play",
    categorie: "Download",
    reaction: "🎧",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;

    if (!arg[0]) return repondre("Please insert a song name.");

    try {
      const video = await searchYouTube(arg.join(" "));
      if (!video) return repondre("No audio found. Try another name.");

      const responseMessage = `*Bwm xmd is downloading ${video.title}*`;
      await zk.sendMessage(dest, {
        text: responseMessage,
      contextInfo: {
        mentionedJid: [dest.sender || ""],
        quotedMessage: { conversation: "Requesting your audio download..." },
        externalAdReply: {
          title: video.title,
          body: `👤 ${video.author.name} | ⏱️ ${video.timestamp}`,
          thumbnailUrl: video.thumbnail,
          sourceUrl: WhatsAppChannelURL,
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: true,
        },
        forwardingScore: 999,
        isForwarded: false,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '0029VaZuGSxEawdxZK9CzM0Y',
          newsletterName: "Bwm xmd Updates 🚀",
          serverMessageId: 143,
        },
      },
      quoted: ms,
    
      });

      const audioDlUrl = await downloadMedia(video.url, "mp3");
      if (!audioDlUrl) return repondre("Failed to download the audio.");

      await zk.sendMessage(dest, {
        audio: { url: audioDlUrl },
      mimetype: 'audio/mp4',
      contextInfo: {
        quotedMessage: { conversation: `Here is your audio: ${video.title}` },
        externalAdReply: {
          title: '🚀 ʙᴡᴍ xᴍᴅ ɴᴇxᴜs 🚀',
          body: `${video.title} | ⏱️ ${video.timestamp}`,
          thumbnailUrl: video.thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: WhatsAppChannelURL, // Clickable URL for your channel
        },
        forwardingScore: 999,  // Increased score for forward likelihood
        isForwarded: true,     // Mark as forwarded
        forwardedNewsletterMessageInfo: {
          newsletterJid: '0029VaZuGSxEawdxZK9CzM0Y',   // Leave empty or use a specific Jid
          newsletterName: "Bwm xmd Updates 🚀", // Cool name or title here
          serverMessageId: 143, // Example ID, adjust if needed
        },
        },
      });
    } catch (error) {
      console.error("Play Command Error:", error.message);
      repondre("An error occurred while processing your request. Please try again.");
    }
  }
);





adams(
  {
    nomCom: "song",
    categorie: "Download",
    reaction: "🎧",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;

    if (!arg[0]) return repondre("Please insert a song name.");

    try {
      const video = await searchYouTube(arg.join(" "));
      if (!video) return repondre("No audio found. Try another name.");

      const responseMessage = `*Bwm xmd is downloading ${video.title}*`;
      await zk.sendMessage(dest, {
        text: responseMessage,
      contextInfo: {
        mentionedJid: [dest.sender || ""],
        quotedMessage: { conversation: "Requesting your audio download..." },
        externalAdReply: {
          title: video.title,
          body: `👤 ${video.author.name} | ⏱️ ${video.timestamp}`,
          thumbnailUrl: video.thumbnail,
          sourceUrl: WhatsAppChannelURL,
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: true,
        },
        forwardingScore: 999,
        isForwarded: false,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '0029VaZuGSxEawdxZK9CzM0Y',
          newsletterName: "Bwm xmd Updates 🚀",
          serverMessageId: 143,
        },
      },
      quoted: ms,
    
      });

      const audioDlUrl = await downloadMedia(video.url, "mp3");
      if (!audioDlUrl) return repondre("Failed to download the audio.");

      await zk.sendMessage(dest, {
        audio: { url: audioDlUrl },
      mimetype: 'audio/mp4',
      contextInfo: {
        quotedMessage: { conversation: `Here is your audio: ${video.title}` },
        externalAdReply: {
          title: '🚀 ʙᴡᴍ xᴍᴅ ɴᴇxᴜs 🚀',
          body: `${video.title} | ⏱️ ${video.timestamp}`,
          thumbnailUrl: video.thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: WhatsAppChannelURL, // Clickable URL for your channel
        },
        forwardingScore: 999,  // Increased score for forward likelihood
        isForwarded: true,     // Mark as forwarded
        forwardedNewsletterMessageInfo: {
          newsletterJid: '0029VaZuGSxEawdxZK9CzM0Y',   // Leave empty or use a specific Jid
          newsletterName: "Bwm xmd Updates 🚀", // Cool name or title here
          serverMessageId: 143, // Example ID, adjust if needed
        },
        },
      });
    } catch (error) {
      console.error("Play Command Error:", error.message);
      repondre("An error occurred while processing your request. Please try again.");
    }
  }
);
*/






const { adams } = require("../Ibrahim/adams");
const yts = require('yt-search');
const axios = require('axios');

// Hardcoded API Configurations
const BaseUrl = 'https://apis.ibrahimadams.us.kg';
const adamsapikey = 'ibraah-tech';

// Validate Config
function validateConfig() {
  if (!BaseUrl || !adamsapikey) {
    throw new Error("Configuration error: Missing BaseUrl or API key.");
  }
}
validateConfig();

// YouTube Search Function
async function searchYouTube(query) {
  try {
    const search = await yts(query);
    return search.videos.length > 0 ? search.videos[0] : null;
  } catch (error) {
    console.error('YouTube Search Error:', error.message);
    throw new Error('Failed to search YouTube. Please try again.');
  }
}

// Download Media Function
async function downloadMedia(url, type) {
  try {
    const endpoint = `${BaseUrl}/api/download/yt${type}?url=${encodeURIComponent(url)}&apikey=${adamsapikey}`;
    const { data } = await axios.get(endpoint);
    if (data.status === 200 && data.success) {
      return data.result.download_url;
    } else {
      throw new Error(data.message || 'Download failed.');
    }
  } catch (error) {
    console.error(`API Error (${type}):`, error.message);
    throw new Error(`Failed to download ${type}. Please try again.`);
  }
}

// WhatsApp Channel URL
const WhatsAppChannelURL = 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y';


  


  
      
      
      
        
adams({
  nomCom: "video",
  categorie: "Search",
  reaction: "🎥"
}, async (dest, zk, commandeOptions) => {
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
          mediaType: 1,  // For video or image
          renderLargerThumbnail: true,  // Show a larger thumbnail
        },
        forwardingScore: 1,  // Forwarding score
        isForwarded: true,  // Mark as forwarded
        messageId: 'custom-message-id', // Custom message ID for referencing
        participant: dest.sender,  // Participant who initiated the message
        customText: "🚀 Forwarded from CEO Ibrahim Adams 🚀", // Custom forward text
      },
      quoted: ms,  // Quoting the previous message
    });

    const videoDlUrl = await downloadMedia(video.url, 'mp4');
    if (!videoDlUrl) return repondre("Failed to download the video.");

    await zk.sendMessage(dest, {
      video: { url: videoDlUrl },
      mimetype: 'video/mp4',
      caption: `*${video.title}*\n👤 Author: ${video.author.name}\n⏱️ Duration: ${video.timestamp}`,
      contextInfo: {
        externalAdReply: {
          title: `📍 ${video.title}`,
          body: `👤 ${video.author.name}\n⏱️ ${video.timestamp}`,
          mediaType: 2,  // Video type
          thumbnailUrl: video.thumbnail,  // Thumbnail image
          renderLargerThumbnail: true,  // Display large thumbnail
          sourceUrl: WhatsAppChannelURL, // Clickable URL for your channel
        },
        forwardingScore: 1,  // Forwarding score
        isForwarded: true,  // Mark as forwarded
        messageId: 'custom-video-message-id', // Custom message ID for referencing
        participant: dest.sender,  // Indicate the participant who initiated the message
        timestamp: Date.now(),  // Custom timestamp for the message
        customText: "🚀 Forwarded from CEO Ibrahim Adams 🚀", // Custom forward text
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Video Command Error:', error.message);
    repondre("An error occurred while processing your request. Please try again.");
  }
});
// Play Command
adams({
  nomCom: "play",
  categorie: "Download",
  reaction: "🎧"
}, async (dest, zk, commandeOptions) => {
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
        quotedMessage: { conversation: "Requesting your audio download..." }, // Quoted message
        externalAdReply: {
          title: video.title,
          body: `👤 ${video.author.name} | ⏱️ ${video.timestamp}`,
          thumbnailUrl: video.thumbnail,
          sourceUrl: WhatsAppChannelURL,
          mediaType: 1,
          renderLargerThumbnail: false,
        },
        location: {
          degreesLatitude: 0.0, // Example values; auto-generated
          degreesLongitude: 0.0,
          name: "BWM XMD Download Center",
          address: "Worldwide",
        }
      },
      quoted: ms,
    });

    const audioDlUrl = await downloadMedia(video.url, 'mp3');
    if (!audioDlUrl) return repondre("Failed to download the audio.");

    await zk.sendMessage(dest, {
      audio: { url: audioDlUrl },
      mimetype: 'audio/mp4',
      contextInfo: {
        quotedMessage: { conversation: `Here is your audio: ${video.title}` }, // Quoted message for sending audio
        externalAdReply: {
          title: '🚀 ʙᴡᴍ xᴍᴅ ɴᴇxᴜs 🚀',
          body: `${video.title} | ⏱️ ${video.timestamp}`,
          thumbnailUrl: video.thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: WhatsAppChannelURL,
        },
        location: {
          degreesLatitude: 0.0, // Example values; auto-generated
          degreesLongitude: 0.0,
          name: "BWM XMD Download Center",
          address: "Worldwide",
        }
      },
    }, { quoted: ms });

  } catch (error) {
    console.error('Play Command Error:', error.message);
    repondre("An error occurred while processing your request. Please try again.");
  }
});

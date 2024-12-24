const { adams } = require("../Ibrahim/adams");
const yts = require('yt-search');
const axios = require('axios');
const cheerio = require('cheerio');

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

// Scrape Download URL from ssyoutube
async function scrapeDownloadUrl(videoUrl) {
  try {
    const response = await axios.get(`https://ssyoutube.com/en789Jb/${encodeURIComponent(videoUrl)}`);
    const html = response.data;
    const $ = cheerio.load(html);

    // Scrape the first download link
    const downloadUrl = $('a.link-download').attr('href');
    if (!downloadUrl) {
      throw new Error('Failed to scrape download URL.');
    }
    return downloadUrl;
  } catch (error) {
    console.error('Scraping Error:', error.message);
    throw new Error('Failed to retrieve download URL. Please try again.');
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

    const responseMessage = `*Bwm xmd is processing ${video.title}*`;
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
        },
        forwardingScore: 999,
        isForwarded: false,
      },
      quoted: ms,
    });

    const videoDlUrl = await scrapeDownloadUrl(video.url);
    if (!videoDlUrl) return repondre("Failed to download the video.");

    await zk.sendMessage(dest, {
      video: { url: videoDlUrl },
      mimetype: 'video/mp4',
      caption: `*${video.title}*\n👤 Author: ${video.author.name}\n⏱️ Duration: ${video.timestamp}`,
      contextInfo: {
        externalAdReply: {
          title: `📍 ${video.title}`,
          body: `👤 ${video.author.name}\n⏱️ ${video.timestamp}`,
          mediaType: 2,
          thumbnailUrl: video.thumbnail,
          renderLargerThumbnail: true,
          sourceUrl: WhatsAppChannelURL,
        },
        forwardingScore: 999,
        isForwarded: true,
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Video Command Error:', error.message);
    repondre("An error occurred while processing your request. Please try again.");
  }
});

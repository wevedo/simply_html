const { adams } = require("../Ibrahim/adams");
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

// TikTok Download Function
async function downloadTikTokMedia(url) {
  try {
    const endpoint = `${BaseUrl}/api/download/tiktok?apikey=${adamsapikey}&url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(endpoint);
    if (data.status === 200 && data.success) {
      return data.result.download_url;
    } else {
      throw new Error(data.message || 'Download failed.');
    }
  } catch (error) {
    console.error('TikTok Download Error:', error.message);
    throw new Error('Failed to download TikTok video. Please try again.');
  }
}

// WhatsApp Channel URL
const WhatsAppChannelURL = 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y';

adams({
  nomCom: "tikto",
  categorie: "Download",
  reaction: "🎵"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  if (!arg[0]) return repondre("Please insert a valid TikTok video URL.");

  try {
    const tiktokUrl = arg[0];
    const videoDlUrl = await downloadTikTokMedia(tiktokUrl);
    if (!videoDlUrl) return repondre("Failed to download the TikTok video.");

    await zk.sendMessage(dest, {
      video: { url: videoDlUrl },
      mimetype: 'video/mp4',
      caption: `Here is your downloaded TikTok video!`,
      contextInfo: {
        externalAdReply: {
          title: "TikTok Video Downloader",
          body: "Powered by BWM XMD",
          mediaType: 2,  // Video type
          renderLargerThumbnail: true,
          sourceUrl: WhatsAppChannelURL,
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('TikTok Command Error:', error.message);
    repondre("An error occurred while processing your request. Please try again.");
  }
});

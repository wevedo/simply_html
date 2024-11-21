


require("dotenv").config(); // Load environment variables
const { adams } = require("../Ibrahim/adams");
const yts = require("yt-search");
const puppeteer = require("puppeteer");

// Retrieve sensitive data from environment variables
function validateConfig() {
  if (!process.env.BOT_OWNER) {
    throw new Error("Configuration error: Missing API key.");
  }
}
validateConfig();

// Function to search YouTube for videos
async function searchYouTube(query) {
  try {
    const search = await yts(query);
    return search.videos.length > 0 ? search.videos[0] : null;
  } catch (error) {
    console.error("YouTube Search Error:", error);
    return null;
  }
}

// Scraper function for `https://ytconvert.pro`
async function scrapeDownloadLink(videoUrl, type) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to ytconvert.pro
    await page.goto("https://ytconvert.pro", { waitUntil: "networkidle2" });

    // Enter the YouTube video URL in the input field
    await page.type("#url", videoUrl); // Replace with the actual input selector

    // Select the format (mp3 or mp4)
    if (type === "mp3") {
      await page.click("#convert-mp3"); // Replace with the correct MP3 button selector
    } else if (type === "mp4") {
      await page.click("#convert-mp4"); // Replace with the correct MP4 button selector
    }

    // Click the "Convert" button
    await page.click("#convert"); // Replace with the actual convert button selector

    // Wait for the download link to appear
    await page.waitForSelector("a.download-link"); // Replace with the actual link selector

    // Extract the download link
    const downloadLink = await page.$eval("a.download-link", (el) =>
      el.getAttribute("href")
    );

    console.log(`Download Link Found: ${downloadLink}`);
    await browser.close();
    return downloadLink;
  } catch (error) {
    console.error("Scraping Error:", error.message);
    return null;
  }
}

// Audio Command
adams(
  {
    nomCom: "play",
    categorie: "Download",
    reaction: "🎧",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;
    if (!arg[0]) return repondre("Please insert a song name.");

    // Step 1: Search for the song on YouTube
    const video = await searchYouTube(arg.join(" "));
    if (!video) return repondre("No audio found. Try another name.");

    // Show the song info
    await zk.sendMessage(
      dest,
      {
        image: { url: video.thumbnail },
        caption: `🎶 *BWM XMD SONG'S*\n\n` +
          `*Title:* ${video.title}\n` +
          `*Author:* ${video.author.name}\n` +
          `*Duration:* ${video.timestamp}\n` +
          `*Views:* ${video.views}\n` +
          `*Uploaded:* ${video.ago}\n` +
          `*YouTube Link:* ${video.url}`,
      },
      { quoted: ms }
    );

    // Step 2: Notify user of the download process
    repondre("*Downloading your audio...*");

    // Step 3: Scrape the download link
    const audioDlUrl = await scrapeDownloadLink(video.url, "mp3");
    if (!audioDlUrl) return repondre("Failed to download the audio.");

    // Step 4: Send the audio file
    await zk.sendMessage(
      dest,
      {
        audio: { url: audioDlUrl },
        mimetype: "audio/mp4",
        ptt: false,
      },
      { quoted: ms }
    );
  }
);

// Video Command
adams(
  {
    nomCom: "video",
    categorie: "Download",
    reaction: "🎥",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;
    if (!arg[0]) return repondre("Please insert a video name.");

    // Step 1: Search for the video on YouTube
    const video = await searchYouTube(arg.join(" "));
    if (!video) return repondre("No video found. Try another name.");

    // Show the video info
    await zk.sendMessage(
      dest,
      {
        image: { url: video.thumbnail },
        caption: `🎥 *BWM XMD VIDEO'S*\n\n` +
          `*Title:* ${video.title}\n` +
          `*Author:* ${video.author.name}\n` +
          `*Duration:* ${video.timestamp}\n` +
          `*Views:* ${video.views}\n` +
          `*Uploaded:* ${video.ago}\n` +
          `*YouTube Link:* ${video.url}`,
      },
      { quoted: ms }
    );

    // Step 2: Notify user of the download process
    repondre("*Downloading your video...*");

    // Step 3: Scrape the download link
    const videoDlUrl = await scrapeDownloadLink(video.url, "mp4");
    if (!videoDlUrl) return repondre("Failed to download the video.");

    // Step 4: Send the video file
    await zk.sendMessage(
      dest,
      {
        video: { url: videoDlUrl },
        mimetype: "video/mp4",
        caption: `Enjoy your video: *${video.title}*\n\n*© Ibrahim Adams*`,
      },
      { quoted: ms }
    );
  }
);

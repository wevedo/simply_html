const {
  adams
} = require("../Ibrahim/adams");
const axios = require("axios");
const Genius = require("genius-lyrics");
const Client = new Genius.Client("jKTbbU-6X2B9yWWl-KOm7Mh3_Z6hQsgE4mmvwV3P3Qe7oNa9-hsrLxQV5l5FiAZO");

// Define the command with aliases
adams({
  nomCom: "lyrics",
  aliases: ["mistari", "lyric"],
  reaction: '📜',
  categorie: "search"
}, async (dest, zk, params) => {
  const { repondre: sendResponse, arg: commandArgs, ms } = params;
  const text = commandArgs.join(" ").trim();

  if (!text) {
    return sendResponse("Please provide a song name.");
  }

  // Function to get lyrics data from APIs
  const getLyricsData = async (url) => {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching data from API:', error);
      return null;
    }
  };

  // List of APIs to try
  const apis = [
    `https://api.dreaded.site/api/lyrics?title=${encodeURIComponent(text)}`,
    `https://some-random-api.com/others/lyrics?title=${encodeURIComponent(text)}`,
    `https://api.davidcyriltech.my.id/lyrics?title=${encodeURIComponent(text)}`
  ];

  let lyricsData;
  for (const api of apis) {
    lyricsData = await getLyricsData(api);
    if (lyricsData && lyricsData.result && lyricsData.result.lyrics) break;
  }

  // Check if lyrics data was found
  if (!lyricsData || !lyricsData.result || !lyricsData.result.lyrics) {
    return sendResponse(`Failed to retrieve lyrics. Please try again.`);
  }

  const { title, artist, thumb, lyrics } = lyricsData.result;
  const imageUrl = thumb || "https://files.catbox.moe/novrnn.jpg";

  const caption = `
╭──────────━⊷
║ *Bot Name:* BMW XMD
║ *Title:* ${title}
║ *Artist:* ${artist}
╰──────────━⊷\n\n
${lyrics}`;

  try {
    // Fetch the image
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary');

    // Send the message with the image and lyrics
    await zk.sendMessage(
      dest,
      {
        image: imageBuffer,
        caption: caption
      },
      { quoted: ms }
    );

  } catch (error) {
    console.error('Error fetching or sending image:', error);
    // Fallback to sending just the text if image fetch fails
    await sendResponse(caption);
  }
});

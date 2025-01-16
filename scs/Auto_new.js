const { adams } = require('../Ibrahim/adams');
const { default: axios } = require('axios');

const apikey = "gifted"; // Your API key

// Xnxx, Weather, Lyrics Commands
adams({ nomCom: "xnxx", categorie: "Download" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  let link = arg.join(' ');

  // Ensure the user provides a link
  if (!link) {
    repondre('Please provide a valid video link.');
    return;
  }

  try {
    const videoUrl = `https://api.giftedtech.web.id/api/download/xnxxdl?apikey=${apikey}&url=${link}`;
    const response = await axios.get(videoUrl);

    if (response.data && response.data.data) {
      const videoData = response.data.data[0];
      if (videoData.type === 'video') {
        zk.sendMessage(dest, { video: { url: videoData.url }, caption: "Video Downloader powered by *NomComBot*", gifPlayback: false }, { quoted: ms });
      } else {
        zk.sendMessage(dest, { image: { url: videoData.url }, caption: "Image Downloader powered by *NomComBot*" });
      }
    } else {
      repondre('Error: No video or image found.');
    }
  } catch (e) {
    repondre("An error occurred during the download: " + e.message);
  }
});

adams({ nomCom: "weather", categorie: "Information" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  let location = arg.join(' ');

  // Ensure the user provides a location
  if (!location) {
    repondre('Please provide a location for the weather.');
    return;
  }

  try {
    const weatherUrl = `https://api.giftedtech.web.id/api/search/weather?apikey=${apikey}&location=${location}`;
    const response = await axios.get(weatherUrl);

    if (response.data && response.data.weather) {
      repondre(`Weather in ${location}:\nTemperature: ${response.data.weather.temperature}°C\nCondition: ${response.data.weather.description}`);
    } else {
      repondre('Error: Weather information not found.');
    }
  } catch (e) {
    repondre('An error occurred while fetching weather data: ' + e.message);
  }
});

adams({ nomCom: "lyrics", categorie: "Information" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  let songName = arg.join(' ');

  // Ensure the user provides a song name
  if (!songName) {
    repondre('Please provide a song name to search for lyrics.');
    return;
  }

  try {
    const lyricsUrl = `https://api.giftedtech.web.id/api/search/lyrics?apikey=${apikey}&query=${songName}`;
    const response = await axios.get(lyricsUrl);

    if (response.data && response.data.lyrics) {
      repondre(`Lyrics for "${songName}": \n${response.data.lyrics}`);
    } else {
      repondre('Error: Lyrics not found.');
    }
  } catch (e) {
    repondre('An error occurred while fetching lyrics: ' + e.message);
  }
});

const { adams } = require('../Ibrahim/adams');
const { default: axios } = require('axios');

// Constants for API URLs and API Key
const apikey = "gifted";
const apiUrl = "https://api.giftedtech.web.id/api"; 

// Xnxx Command
adams({ nomCom: "xnxx", categorie: "Download" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  let link = arg.join(' ');

  // Ensure the user provides a link
  if (!link) {
    repondre('Please provide a valid video link.');
    return;
  }

  try {
    const videoUrl = `${apiUrl}/download/xnxxdl?apikey=${apikey}&url=${link}`;
    const response = await axios.get(videoUrl);

    // Log the raw result from the API
    console.log("XNXX API Response:", response.data);

    // Use results directly from logs (Accessing data as shown in the logs)
    if (response.data && response.data[0]) {
      if (response.data[0].type === 'video') {
        zk.sendMessage(dest, { video: { url: response.data[0].url }, caption: "Video Downloader powered by *NomComBot*", gifPlayback: false }, { quoted: ms });
      } else if (response.data[0].type === 'image') {
        zk.sendMessage(dest, { image: { url: response.data[0].url }, caption: "Image Downloader powered by *NomComBot*" });
      } else {
        repondre('Error: No valid video or image found.');
      }
    } else {
      repondre('Error: Invalid data returned from the API.');
    }
  } catch (e) {
    repondre("An error occurred during the download: " + e.message);
  }
});

// Weather Command
adams({ nomCom: "weather", categorie: "Information" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  let location = arg.join(' ');

  // Ensure the user provides a location
  if (!location) {
    repondre('Please provide a location for the weather.');
    return;
  }

  try {
    const weatherUrl = `${apiUrl}/search/weather?apikey=${apikey}&location=${location}`;
    const response = await axios.get(weatherUrl);

    // Log the raw result from the API (displayed in logs)
    console.log("Weather API Response:", response.data);

    // Use the results directly from logs (Accessing results as shown in the logs)
    const weather = response.data.weather;  // Extracted directly from logs
    const main = response.data.main;  // Extracted directly from logs

    if (weather && main) {
      const weatherDescription = `${weather.main} - ${weather.description}`;
      const temperature = main.temp;
      const feelsLike = main.feels_like;

      // Send weather response using data shown in logs
      repondre(`Weather in ${location}:\nCondition: ${weatherDescription}\nTemperature: ${temperature}°C\nFeels Like: ${feelsLike}°C`);
    } else {
      repondre('Error: Weather data not available.');
    }
    
  } catch (e) {
    repondre('An error occurred while fetching weather data: ' + e.message);
  }
});

// Lyrics Command
adams({ nomCom: "lyrics", categorie: "Information" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  let songName = arg.join(' ');

  // Ensure the user provides a song name
  if (!songName) {
    repondre('Please provide a song name to search for lyrics.');
    return;
  }

  try {
    const lyricsUrl = `${apiUrl}/search/lyrics?apikey=${apikey}&query=${songName}`;
    const response = await axios.get(lyricsUrl);

    // Log the raw result from the API
    console.log("Lyrics API Response:", response.data);

    // Use the results directly from logs (Accessing lyrics from logs)
    if (response.data && response.data.lyrics) {
      repondre(`Lyrics for "${songName}": \n${response.data.lyrics}`);
    } else {
      repondre('Error: Lyrics not found.');
    }
  } catch (e) {
    repondre('An error occurred while fetching lyrics: ' + e.message);
  }
});

// Link Shortener Command
adams({ nomCom: "shorten", categorie: "Utility" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  let longUrl = arg.join(' ');

  // Ensure the user provides a URL
  if (!longUrl) {
    repondre('Please provide a URL to shorten.');
    return;
  }

  try {
    const shortUrl = `${apiUrl}/tools/shorturl?apikey=${apikey}&url=${longUrl}`;
    const response = await axios.get(shortUrl);

    // Log the raw result from the API
    console.log("URL Shortener API Response:", response.data);

    // Use the results directly from logs (Accessing shortened URL from logs)
    if (response.data && response.data.shortened_url) {
      repondre(`Shortened URL: ${response.data.shortened_url}`);
    } else {
      repondre('Error: Could not shorten the URL.');
    }
  } catch (e) {
    repondre('An error occurred while shortening the URL: ' + e.message);
  }
});

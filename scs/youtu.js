const { adams } = require("../Ibrahim/adams");
const axios = require('axios');
const ytSearch = require('yt-search');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

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

    // Notify the user
    await zk.sendMessage(dest, {
      text: `*🎵 Bwm is downloading ${firstVideo.title}*`,
      contextInfo: {
        externalAdReply: {
          title: firstVideo.title,
          body: "Bwm xmd downloader",
          mediaType: 1,
          thumbnailUrl: firstVideo.thumbnail,
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

    // **Download and Compress Audio**
    const inputPath = path.join(__dirname, 'temp_audio.mp3');
    const outputPath = path.join(__dirname, 'compressed_audio.mp3');

    const writer = fs.createWriteStream(inputPath);
    const audioStream = await axios.get(downloadUrl, { responseType: 'stream' });
    audioStream.data.pipe(writer);

    writer.on('finish', () => {
      // Convert to lower bitrate (e.g., 64kbps)
      ffmpeg(inputPath)
        .audioBitrate(64) // Reduce bitrate for smaller size
        .save(outputPath)
        .on('end', async () => {
          console.log("Audio compression completed.");

          // Send the compressed audio
          await zk.sendMessage(dest, {
            audio: { url: outputPath },
            mimetype: 'audio/mp4',
            contextInfo: {
              externalAdReply: {
                title: firstVideo.title,
                body: `🎶 ${firstVideo.title} | Download complete`,
                mediaType: 1,
                sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                thumbnailUrl: firstVideo.thumbnail,
                renderLargerThumbnail: true,
                showAdAttribution: true,
              },
            },
          }, { quoted: ms });

          // Clean up files
          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
        })
        .on('error', (err) => {
          console.error("FFmpeg Error:", err);
          return repondre("Failed to compress the audio file.");
        });
    });

  } catch (error) {
    console.error('Error:', error.message);
    return repondre(`Download failed due to an error: ${error.message || error}`);
  }
});

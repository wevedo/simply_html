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
    const title = firstVideo.title;
    const duration = firstVideo.timestamp; // e.g., "3:45"
    const views = firstVideo.views.toLocaleString();
    const uploaded = firstVideo.ago;
    const channel = firstVideo.author.name;

    // Notify the user
    await zk.sendMessage(dest, {
      text: `🎶 *Downloading:* ${title}\n🕒 *Duration:* ${duration}\n👁 *Views:* ${views}\n📅 *Uploaded:* ${uploaded}\n🎭 *Channel:* ${channel}`,
      contextInfo: {
        externalAdReply: {
          title: title,
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
      const apiUrl = `https://p.oceansaver.in/ajax/download.php?format=mp3&url=${encodeURIComponent(videoUrl)}&api=8680fd586371ca03eeb722ce771790904ddda515`;
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
                title: title,
                body: `🎶 ${title} | Download complete`,
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






// Command for downloading audio (MP3)
adams({
  nomCom: "song",
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
    const title = firstVideo.title;
    const duration = firstVideo.timestamp; // e.g., "3:45"
    const views = firstVideo.views.toLocaleString();
    const uploaded = firstVideo.ago;
    const channel = firstVideo.author.name;

    // Notify the user
    await zk.sendMessage(dest, {
      text: `🎶 *Downloading:* ${title}\n🕒 *Duration:* ${duration}\n👁 *Views:* ${views}\n📅 *Uploaded:* ${uploaded}\n🎭 *Channel:* ${channel}`,
      contextInfo: {
        externalAdReply: {
          title: title,
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
      const apiUrl = `https://p.oceansaver.in/ajax/download.php?format=mp3&url=${encodeURIComponent(videoUrl)}&api=8680fd586371ca03eeb722ce771790904ddda515`;
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
                title: title,
                body: `🎶 ${title} | Download complete`,
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






// Command for downloading video (MP4)
adams(
  {
    nomCom: "video",
    aliases: ["vide", "mp4"],
    categorie: "Search",
    reaction: "🎬",
  },
  async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;

    if (!arg[0]) {
      return repondre("Please provide a video name.");
    }

    const query = arg.join(" ");

    try {
      // Search for the video on YouTube
      const searchResults = await ytSearch(query);
      if (!searchResults.videos.length) {
        return repondre("No video found for the specified query.");
      }

      const firstVideo = searchResults.videos[0];
      const videoUrl = firstVideo.url;
      const videoTitle = firstVideo.title;
      const videoDuration = firstVideo.timestamp;
      const videoThumbnail = firstVideo.thumbnail;
      const videoViews = firstVideo.views.toLocaleString();
      const videoUploaded = firstVideo.ago;
      const videoChannel = firstVideo.author.name;

      // Notify user about the ongoing download
      await zk.sendMessage(dest, {
        text: `🎬 *Downloading:* ${videoTitle}\n⏳ *Duration:* ${videoDuration}\n👁 *Views:* ${videoViews}\n📅 *Uploaded:* ${videoUploaded}\n🎭 *Channel:* ${videoChannel}`,
        contextInfo: {
          externalAdReply: {
            title: videoTitle,
            body: "Bwm xmd downloader",
            mediaType: 2,
            thumbnailUrl: videoThumbnail,
            sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      }, { quoted: ms });

      // List of APIs for MP4 download
      const apis = [
        `https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
        `https://www.dark-yasiya-api.site/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
        `https://api.giftedtech.web.id/api/download/dlmp4?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`,
        `https://api.dreaded.site/api/ytdl/video?url=${encodeURIComponent(videoUrl)}`,
      ];

      // Fetch results from all APIs concurrently
      const apiResponses = await Promise.allSettled(
        apis.map((api) =>
          axios.get(api).then((res) => res.data).catch(() => null)
        )
      );

      // Find the first successful API response
      let downloadData = null;
      for (const response of apiResponses) {
        if (
          response.status === "fulfilled" &&
          response.value &&
          response.value.success
        ) {
          downloadData = response.value.result;
          break;
        }
      }

      if (!downloadData || !downloadData.download_url) {
        return repondre("Failed to retrieve a download link. Please try again later.");
      }

      const downloadUrl = downloadData.download_url;
      const videoTitleFinal = downloadData.title || videoTitle;

      // **Download and Compress Video**
      const inputPath = path.join(__dirname, 'temp_video.mp4');
      const outputPath = path.join(__dirname, 'compressed_video.mp4');

      const writer = fs.createWriteStream(inputPath);
      const videoStream = await axios.get(downloadUrl, { responseType: 'stream' });
      videoStream.data.pipe(writer);

      writer.on('finish', () => {
        // Convert to 480p (lower bitrate for smaller size)
        ffmpeg(inputPath)
          .outputOptions([
            '-vf', 'scale=854:480',  // Resize to 480p
            '-b:v', '800k',          // Reduce bitrate
            '-b:a', '128k'           // Reduce audio bitrate
          ])
          .save(outputPath)
          .on('end', async () => {
            console.log("Video compression completed.");

            // Send the compressed video
            await zk.sendMessage(dest, {
              video: { url: outputPath },
              mimetype: "video/mp4",
              caption: "Video downloaded Successfully ✅,
              contextInfo: {
                externalAdReply: {
                  title: videoTitleFinal,
                  body: `🎬 ${videoTitleFinal} | Duration: ${videoDuration}`,
                  mediaType: 2, // MediaType 2 = video
                  sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                  thumbnailUrl: videoThumbnail,
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
            return repondre("Failed to compress the video file.");
          });
      });

    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`Download failed due to an error: ${error.message || error}`);
    }
  }
);

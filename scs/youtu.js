const { adams } = require("../Ibrahim/adams");
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

adams({
  nomCom: "play",
  aliases: ["song", "audio", "mp3"],
  categorie: "Search",
  reaction: "🎵"
}, async (dest, zk, { arg, ms, repondre }) => {
  if (!arg[0]) return repondre("*Please provide a song name!*");

  try {
    // Search for the video
    const search = await yts(arg.join(" "));
    if (!search || search.videos.length === 0) return repondre("*No video found for your search.*");

    const video = search.videos[0];
    const stream = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" });

    // Set file path
    const fileName = `${video.title.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`;
    const filePath = path.join(__dirname, fileName);

    // Create a write stream
    const writer = fs.createWriteStream(filePath);
    stream.pipe(writer);

    writer.on("finish", async () => {
      // Send the audio file
      await zk.sendMessage(dest, {
        audio: { url: filePath },
        mimetype: "audio/mpeg",
        fileName: fileName,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: `🎶 ${video.title} | Download complete`,
            mediaType: 1,
            sourceUrl: video.url,
            thumbnailUrl: video.thumbnail,
            renderLargerThumbnail: true,
            showAdAttribution: true,
          },
        },
      }, { quoted: ms });

      // Clean up file
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error("Play command error:", error);
    repondre(`*Error:* ${error.message}`);
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
            title: "©Sir Ibrahim Adams",
            body: "Bwm xmd downloader",
            mediaType: 2,
            thumbnailUrl: "https://bwm-xmd-files.vercel.app/bwmxmd_ijgrjr.webp",
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
              caption: "Video downloaded Successfully ✅",
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

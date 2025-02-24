const { adams } = require("../Ibrahim/adams");  
const axios = require("axios");  
const fs = require("fs");  
const ytSearch = require("yt-search");  
const path = require("path");  
  
adams(  
  {  
    nomCom: "play",  
    aliases: ["song", "audio", "mp3"],  
    categorie: "Search",  
    reaction: "🎵",  
  },  
  async (dest, zk, commandOptions) => {  
    const { arg, ms, repondre } = commandOptions;  
  
    if (!arg[0]) {  
      return repondre("Please provide a song name.");  
    }  
  
    const query = arg.join(" ");  
  
    try {  
      // Search for the song on YouTube  
      const searchResults = await ytSearch(query);  
      if (!searchResults.videos.length) {  
        return repondre("No video found for the specified query.");  
      }  
  
      const firstVideo = searchResults.videos[0];  
      const videoUrl = firstVideo.url;  
      const videoTitle = firstVideo.title;  
      const videoDuration = firstVideo.timestamp;  
      const videoThumbnail = firstVideo.thumbnail;  
      const videoChannel = firstVideo.author.name;  
  
      // Send song info immediately  
      await zk.sendMessage(  
        dest,  
        {  
          text: `♻️ 𝐁𝐖𝐌 𝐗𝐌𝐃 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑 ♻️\n📌 *Title:* ${videoTitle}\n🎭 *Channel:* ${videoChannel}\n⏳ *Duration:* ${videoDuration}\n\nᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ ʙᴇʟᴏᴡ ᴛᴏ ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ https://shorturl.at/z3b8v\n\n®2025 ʙᴡᴍ xᴍᴅ 🔥`,  
          contextInfo: {  
            externalAdReply: {  
              title: "©Sir Ibrahim Adams",  
              body: "Faster bot",  
              mediaType: 1,  
              thumbnailUrl: "https://files.catbox.moe/3ejs31.jpg",  
              sourceUrl: 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y',  
              renderLargerThumbnail: false,  
              showAdAttribution: true,  
            },  
          },  
        },  
        { quoted: ms }  
      );  
  
      // Inform user that processing is in progress  
      const processingMsg = await zk.sendMessage(  
        dest,  
        { text: "⏳ Your audio is being processed, just a moment..." },  
        { quoted: ms }  
      );  
  
      // Fetch result from the new API  
      const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`;  
      const response = await axios.get(apiUrl).then((res) => res.data).catch(() => null);  
  
      if (!response || !response.success || !response.result.download_url) {  
        await zk.sendMessage(dest, { text: "❌ Failed to download. Try again later.", edit: processingMsg.key });  
        return;  
      }  
  
      const downloadUrl = response.result.download_url;  
      const tempFile = path.join(__dirname, "audio.mp3");  
  
      // Download the audio  
      const writer = fs.createWriteStream(tempFile);  
      const audioStream = await axios({ url: downloadUrl, method: "GET", responseType: "stream" });  
      audioStream.data.pipe(writer);  
  
      await new Promise((resolve, reject) => {  
        writer.on("finish", resolve);  
        writer.on("error", reject);  
      });  
  
      // Delete the processing message before sending audio  
      await zk.sendMessage(dest, { delete: processingMsg.key });  
  
      // Send the audio file immediately  
      await zk.sendMessage(  
        dest,  
        {  
          audio: fs.readFileSync(tempFile),  
          mimetype: "audio/mp4",  
          contextInfo: {  
            externalAdReply: {  
              title: videoTitle,  
              body: `🎶 ${videoTitle} | Duration: ${videoDuration}`,  
              mediaType: 1,  
              sourceUrl: 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y',  
              thumbnailUrl: videoThumbnail,  
              renderLargerThumbnail: true,  
              showAdAttribution: true,  
            },  
          },  
        },  
        { quoted: ms }  
      );  
  
      // Delete temp file after sending  
      fs.unlinkSync(tempFile);  
    } catch (error) {  
      console.error("Error during download process:", error.message);  
      return repondre(`❌ Download failed: ${error.message || error}`);  
    }  
  }  
);

/*const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const { exec } = require("child_process");
const fs = require("fs");
const ytSearch = require("yt-search");
const path = require("path");

adams(
  {
    nomCom: "play",
    aliases: ["song", "audio", "mp3"],
    categorie: "Search",
    reaction: "🎵",
  },
  async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;

    if (!arg[0]) {
      return repondre("Please provide a song name.");
    }

    const query = arg.join(" ");

    try {
      // Search for the song on YouTube
      const searchResults = await ytSearch(query);
      if (!searchResults.videos.length) {
        return repondre("No video found for the specified query.");
      }

      const firstVideo = searchResults.videos[0];
      const videoUrl = firstVideo.url;
      const videoTitle = firstVideo.title;
      const videoDuration = firstVideo.timestamp;
      const videoThumbnail = firstVideo.thumbnail;
      const videoChannel = firstVideo.author.name;

      // Send song info immediately
      await zk.sendMessage(
        dest,
        {
          text: `♻️ 𝐁𝐖𝐌 𝐗𝐌𝐃 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑 ♻️\n📌 *Title:* ${videoTitle}\n🎭 *Channel:* ${videoChannel}\n⏳ *Duration:* ${videoDuration}\n\nᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ ʙᴇʟᴏᴡ ᴛᴏ ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ https://shorturl.at/z3b8v\n\n®2025 ʙᴡᴍ xᴍᴅ 🔥`,
          contextInfo: {
            externalAdReply: {
              title: "©Sir Ibrahim Adams",
              body: "Faster bot",
              mediaType: 1,
              thumbnailUrl: "https://files.catbox.moe/3ejs31.jpg",
              sourceUrl: 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y',
              renderLargerThumbnail: false,
              showAdAttribution: true,
            },
          },
        },
        { quoted: ms }
      );

      // Inform user that processing is in progress
      const processingMsg = await zk.sendMessage(
        dest,
        { text: "⏳ Your audio is being processed, just a minute..." },
        { quoted: ms }
      );

      // List of APIs for MP3 download
      const apis = [
        `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
        `https://api.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(videoUrl)}`,
        `https://api.giftedtech.web.id/api/download/dlmp3?url=${encodeURIComponent(videoUrl)}&apikey=_0x5aff35,_0x1876stqr`,
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
        await zk.sendMessage(dest, { text: "❌ Failed to download. Try again later.", edit: processingMsg.key });
        return;
      }

      const downloadUrl = downloadData.download_url;
      const tempFile = path.join(__dirname, "audio_high.mp3");
      const finalFile = path.join(__dirname, "audio_normal.mp3");

      // Download the high-quality audio
      const writer = fs.createWriteStream(tempFile);
      const response = await axios({ url: downloadUrl, method: "GET", responseType: "stream" });
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Convert to normal quality (96kbps for balance between quality & speed)
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${tempFile} -b:a 96k ${finalFile}`, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      // Delete the processing message before sending audio
      await zk.sendMessage(dest, { delete: processingMsg.key });

      // Send the compressed audio file
      await zk.sendMessage(
        dest,
        {
          audio: fs.readFileSync(finalFile),
          mimetype: "audio/mp4",
          contextInfo: {
            externalAdReply: {
              title: videoTitle,
              body: `🎶 ${videoTitle} | Duration: ${videoDuration}`,
              mediaType: 1,
              sourceUrl: 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y',
              thumbnailUrl: videoThumbnail,
              renderLargerThumbnail: true,
              showAdAttribution: true,
            },
          },
        },
        { quoted: ms }
      );

      // Delete temp files after sending
      fs.unlinkSync(tempFile);
      fs.unlinkSync(finalFile);
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`❌ Download failed: ${error.message || error}`);
    }
  }
);


adams(
  {
    nomCom: "song",
    aliases: ["song", "audio", "mp3"],
    categorie: "Search",
    reaction: "🎵",
  },
  async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;

    if (!arg[0]) {
      return repondre("Please provide a song name.");
    }

    const query = arg.join(" ");

    try {
      // Search for the song on YouTube
      const searchResults = await ytSearch(query);
      if (!searchResults.videos.length) {
        return repondre("No video found for the specified query.");
      }

      const firstVideo = searchResults.videos[0];
      const videoUrl = firstVideo.url;
      const videoTitle = firstVideo.title;
      const videoDuration = firstVideo.timestamp;
      const videoThumbnail = firstVideo.thumbnail;
      const videoChannel = firstVideo.author.name;

      // Send song info immediately
      await zk.sendMessage(
        dest,
        {
          text: `♻️ 𝐁𝐖𝐌 𝐗𝐌𝐃 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑 ♻️\n📌 *Title:* ${videoTitle}\n🎭 *Channel:* ${videoChannel}\n\n⏳ *Duration:* ${videoDuration}\nᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ ʙᴇʟᴏᴡ ᴛᴏ ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ https://shorturl.at/z3b8v\n\n®2025 ʙᴡᴍ xᴍᴅ 🔥`,
          contextInfo: {
            externalAdReply: {
              title: "©Sir Ibrahim Adams",
              body: "Faster bot",
              mediaType: 1,
              thumbnailUrl: "https://files.catbox.moe/3ejs31.jpg",
              sourceUrl: 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y',
              renderLargerThumbnail: false,
              showAdAttribution: true,
            },
          },
        },
        { quoted: ms }
      );

      // Inform user that processing is in progress
      const processingMsg = await zk.sendMessage(
        dest,
        { text: "⏳ Your audio is being processed, just a minute..." },
        { quoted: ms }
      );

      // List of APIs for MP3 download
      const apis = [
        `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
        `https://api.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(videoUrl)}`,
        `https://api.giftedtech.web.id/api/download/dlmp3?url=${encodeURIComponent(videoUrl)}&apikey=_0x5aff35,_0x1876stqr`,
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
        await zk.sendMessage(dest, { text: "❌ Failed to download. Try again later.", edit: processingMsg.key });
        return;
      }

      const downloadUrl = downloadData.download_url;
      const tempFile = path.join(__dirname, "audio_high.mp3");
      const finalFile = path.join(__dirname, "audio_normal.mp3");

      // Download the high-quality audio
      const writer = fs.createWriteStream(tempFile);
      const response = await axios({ url: downloadUrl, method: "GET", responseType: "stream" });
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Convert to normal quality (96kbps for balance between quality & speed)
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${tempFile} -b:a 96k ${finalFile}`, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      // Delete the processing message before sending audio
      await zk.sendMessage(dest, { delete: processingMsg.key });

      // Send the compressed audio file
      await zk.sendMessage(
        dest,
        {
          audio: fs.readFileSync(finalFile),
          mimetype: "audio/mp4",
          contextInfo: {
            externalAdReply: {
              title: videoTitle,
              body: `🎶 ${videoTitle} | Duration: ${videoDuration}`,
              mediaType: 1,
              sourceUrl: 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y',
              thumbnailUrl: videoThumbnail,
              renderLargerThumbnail: true,
              showAdAttribution: true,
            },
          },
        },
        { quoted: ms }
      );

      // Delete temp files after sending
      fs.unlinkSync(tempFile);
      fs.unlinkSync(finalFile);
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`❌ Download failed: ${error.message || error}`);
    }
  }
);


adams(
  {
    nomCom: "video",
    aliases: ["video", "mp4", "yt"],
    categorie: "Search",
    reaction: "📽️",
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
      const videoChannel = firstVideo.author.name;

      // Send video info immediately
      await zk.sendMessage(
        dest,
        {
          text: `♻️ 𝐁𝐖𝐌 𝐗𝐌𝐃 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑 ♻️\n📌 *Title:* ${videoTitle}\n🎭 *Channel:* ${videoChannel}\n\n⏳ *Duration:* ${videoDuration}\nᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ ʙᴇʟᴏᴡ ᴛᴏ ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ https://shorturl.at/z3b8v\n\n®2025 ʙᴡᴍ xᴍᴅ 🔥`,
          contextInfo: {
            externalAdReply: {
              title: "©Sir Ibrahim Adams",
              body: "Faster bot",
              mediaType: 1,
              thumbnailUrl: 'https://files.catbox.moe/3ejs31.jpg',
              sourceUrl: 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y',
              renderLargerThumbnail: false,
              showAdAttribution: true,
            },
          },
        },
        { quoted: ms }
      );

      // Inform user that processing is in progress
      const processingMsg = await zk.sendMessage(
        dest,
        { text: "⏳ Your video is being processed, just a minute..." },
        { quoted: ms }
      );

      // List of APIs for MP4 download
      const apis = [
        `https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
        `https://api.davidcyriltech.my.id/youtube/mp4?url=${encodeURIComponent(videoUrl)}`,
        `https://api.giftedtech.web.id/api/download/dlmp4?url=${encodeURIComponent(videoUrl)}&apikey=_0x5aff35,_0x1876stqr`,
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
        await zk.sendMessage(dest, { text: "❌ Failed to download. Try again later.", edit: processingMsg.key });
        return;
      }

      const downloadUrl = downloadData.download_url;
      const tempFile = path.join(__dirname, "video.mp4");
      const finalFile = path.join(__dirname, "video_compressed.mp4");

      // Download the video
      const writer = fs.createWriteStream(tempFile);
      const response = await axios({ url: downloadUrl, method: "GET", responseType: "stream" });
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Compress video to a reasonable size (480p)
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${tempFile} -vf "scale=854:480" -preset fast -crf 28 ${finalFile}`, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      // Delete the processing message before sending video
      await zk.sendMessage(dest, { delete: processingMsg.key });

      // Send the compressed video file
      await zk.sendMessage(
        dest,
        {
          video: fs.readFileSync(finalFile),
          mimetype: "video/mp4",
          caption: `🎬 *${videoTitle}*\n📺 *Channel:* ${videoChannel}\n⏳ *Duration:* ${videoDuration}`,
          contextInfo: {
            externalAdReply: {
              title: videoTitle,
              body: `🎥 ${videoTitle} | Duration: ${videoDuration}`,
              mediaType: 1,
              sourceUrl: 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y',
              thumbnailUrl: videoThumbnail,
              renderLargerThumbnail: true,
              showAdAttribution: true,
            },
          },
        },
        { quoted: ms }
      );

      // Delete temp files after sending
      fs.unlinkSync(tempFile);
      fs.unlinkSync(finalFile);
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`❌ Download failed: ${error.message || error}`);
    }
  }
);
*/

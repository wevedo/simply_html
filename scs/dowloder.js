const { adams } = require('../Ibrahim/adams');
const axios = require("axios");
const fs = require('fs');
const { igdl } = require("ruhend-scraper");
const { downloadTiktok } = require('@mrnima/tiktok-downloader');
const { facebook } = require('@mrnima/facebook-downloader');  
const ai = require('unlimited-ai');

adams({
  nomCom: "instagram",
  aliases: ["igdl", "ig", "insta"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  // Check if the argument (Instagram link) is provided
  if (!arg[0]) {
    return repondre('Please provide a valid public Instagram video link!');
  }

  // Validate the Instagram URL format
  if (!arg[0].includes('https://www.instagram.com/')) {
    return repondre("That is not a valid Instagram link.");
  }

  try {
    // Fetch the download data for the Instagram video
    let downloadData = await igdl(arg[0]);

    // Check if the data returned is valid
    if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
      return repondre("No video found at the provided Instagram link.");
    }

    let videoData = downloadData.data;

    // Process the first video (or more if necessary)
    for (let i = 0; i < Math.min(20, videoData.length); i++) {
      let video = videoData[i];

      // Ensure the video object and URL are defined
      if (!video || !video.url) {
        continue; // Skip if the video data is incomplete
      }

      let videoUrl = video.url;

      // Send the video to the chat
      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        mimetype: "video/mp4",
        caption: "*Instagram video by bwm xmd*"
      });
    }
  } catch (error) {
    // Catch and log any errors
    console.error(error);
    return repondre("An error occurred while processing the request. Please try again later.");
  }
});

adams({
  nomCom: "tiktok",
  aliases: ["tikdl", "tiktokdl"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  if (!arg) {
    return repondre('Please insert a public TikTok video link!');
  }

  if (!arg[0].includes('tiktok.com')) {
    return repondre("That is not a valid TikTok link.");
  }

  try {
    // Download the TikTok video data
    let tiktokData = await downloadTiktok(arg);

    const caption = `
╭───────────━⊷
║ 𝐁𝐖𝐌 𝐗𝐌𝐃 𝐃𝐎𝐖𝐋𝐎𝐃𝐄𝐑
╰───────────━⊷
╭───────────━⊷
   ᴛɪᴛʟᴇ
   ${tiktokData.result.title}
╰──────────━⊷
╭──────────━⊷
║ *ʀᴇᴘʟʏ ᴡɪᴛʜ ʙᴇʟᴏᴡ ɴᴜᴍʙᴇʀs* 
║  *1* sᴅ ǫᴜᴀʟɪᴛʏ
║  *2*  ʜᴅ ǫᴜᴀʟɪᴛʏ
║  *3*  ᴀᴜᴅɪᴏᴍᴏᴅᴇ: public
╰───────────━⊷
╭───────────━⊷
║  *ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ*
║  *ғᴏʀ ʙᴏᴛ ᴜᴘᴅᴀᴛᴇs*
║ ~ᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ~
║ https://shorturl.at/E0jGI
╰───────────━⊷
    `;

    // Send the image and caption with a reply
    const message = await zk.sendMessage(dest, {
      image: { url: tiktokData.result.image },
      caption: caption,
    });

    const messageId = message.key.id;

    // Event listener for reply messages
    zk.ev.on("messages.upsert", async (update) => {
      const messageContent = update.messages[0];
      if (!messageContent.message) return;

      const responseText = messageContent.message.conversation || messageContent.message.extendedTextMessage?.text;
      const keithdl = messageContent.key.remoteJid;

      // Check if the response is a reply to the message we sent
      const isReplyToMessage = messageContent.message.extendedTextMessage?.contextInfo.stanzaId === messageId;

      if (isReplyToMessage) {
        // React to the message
        await zk.sendMessage(keithdl, {
          react: { text: '⬇️', key: messageContent.key },
        });

        const tiktokLinks = tiktokData.result;

        await zk.sendMessage(keithdl, {
          react: { text: '⬆️', key: messageContent.key },
        });

        // Send the requested media based on the user's response
        if (responseText === '1') {
          await zk.sendMessage(keithdl, {
            video: { url: tiktokLinks.dl_link.download_mp4_1 },
            caption: "*𝐁𝐖𝐌 𝐗𝐌𝐃*",
          }, { quoted: messageContent });
        } else if (responseText === '2') {
          await zk.sendMessage(keithdl, {
            video: { url: tiktokLinks.dl_link.download_mp4_2 },
            caption: "*𝐁𝐖𝐌 𝐗𝐌𝐃*",
          }, { quoted: messageContent });
        } else if (responseText === '3') {
          await zk.sendMessage(keithdl, {
            audio: { url: tiktokLinks.dl_link.download_mp3 },
            mimetype: "audio/mpeg",
          }, { quoted: messageContent });
        }
      }
    });
  } catch (error) {
    console.error(error);
    repondre('An error occurred: ' + error.message);
  }
});


adams({
  nomCom: "spotify",
  aliases: ["spotifydl", "splay"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  // Check if there is a query in the arguments
  if (!arg[0]) {
    return repondre('Please provide a query!');
  }

  try {
    // Spotify track search API URL
    const searchApiUrl = `https://spotifyapi.caliphdev.com/api/search/tracks?q=${encodeURIComponent(arg[0])}`;
    const searchData = (await axios.get(searchApiUrl)).data;

    // Check if search data contains any tracks
    const trackData = searchData[0];
    if (!trackData) {
      return repondre("No Spotify track found for your query.");
    }

    // Track information to be displayed
    const trackInfo = `
╭──────────━⊷
║ 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 𝐃𝐎𝐖𝐋𝐎𝐃𝐄𝐑
╰──────────━⊷
╭──────────━⊷
║ *Title*   : ${trackData.title}
║ *Artist*  : ${trackData.artist}
╰──────────━⊷
╭──────────━⊷
  *URL*    
  ${trackData.url}
╰──────────━⊷
╭───────────━⊷
║  *ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ*
║  *ғᴏʀ ʙᴏᴛ ᴜᴘᴅᴀᴛᴇs*
║ ~ᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ~
║ https://shorturl.at/E0jGI
╰───────────━⊷`;

    // Send track info message
    await zk.sendMessage(
      dest,
      {
        text: trackInfo,
        contextInfo: {
          mentionedJid: [dest], // Replace m.sender with dest
          externalAdReply: {
            showAdAttribution: true,
            title: trackData.title,
            body: "𝐁𝐖𝐌 𝐗𝐌𝐃",
            thumbnailUrl: trackData.thumbnail,
            mediaType: 1,
            sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: ms }  // Assuming ms is the message being quoted
    );

    // Spotify download API URL
    const downloadApiUrl = `https://spotifyapi.caliphdev.com/api/download/track?url=${encodeURIComponent(trackData.url)}`;
    const response = await axios({
      url: downloadApiUrl,
      method: "GET",
      responseType: "stream",
    });

    // Check if the response is an audio stream
    if (response.headers["content-type"] === "audio/mpeg") {
      await zk.sendMessage(
        dest,
        { audio: { stream: response.data }, mimetype: "audio/mpeg" },
        { quoted: ms }
      );
    } else {
      repondre("Failed to fetch Spotify audio. Please try again later.");
    }
  } catch (error) {
    repondre(`Error: ${error.message}`);
    console.error(error);
  }
});


adams({
  nomCom: "facebook",
  aliases: ["fbdl", "facebookdl", "fb"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  // Check if there is a Facebook URL in the arguments
  if (!arg[0]) {
    return repondre('Please insert a public Facebook video link!');
  }

  // Validate that the argument contains "facebook.com"
  if (!arg[0].includes('https://')) {
    return repondre("That is not a valid Facebook link.");
  }

  try {
    // Download the Facebook video data
    const videoData = await facebook(arg[0]);

    // Prepare the message caption with video details
    const caption = `
╭───────────━⊷
║ 𝐁𝐖𝐌 𝐗𝐌𝐃 𝐃𝐎𝐖𝐋𝐎𝐃𝐄𝐑
╰───────────━⊷
╭───────────━⊷
   ᴛɪᴛʟᴇ: ${videoData.result.duration}
╰──────────━⊷
╭──────────━⊷
║ *ʀᴇᴘʟʏ ᴡɪᴛʜ ʙᴇʟᴏᴡ ɴᴜᴍʙᴇʀs* 
║  *1* sᴅ ǫᴜᴀʟɪᴛʏ
║  *2* ʜᴅ ǫᴜᴀʟɪᴛʏ
║  *3* ᴀᴜᴅɪᴏ
║  *4* ᴅᴏᴄᴜᴍᴇɴᴛ
║  *5* ᴘᴛᴛ(ᴠᴏɪᴄᴇ)
╰───────────━⊷
╭───────────━⊷
║  *ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ*
║  *ғᴏʀ ʙᴏᴛ ᴜᴘᴅᴀᴛᴇs*
║ ~ᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ~
║ https://shorturl.at/E0jGI
╰──────────━⊷
    `;

    // Send the image and caption with a reply
    const message = await zk.sendMessage(dest, {
      image: { url: videoData.result.thumbnail },
      caption: caption,
    });

    const messageId = message.key.id;

    // Event listener for reply messages
    zk.ev.on("messages.upsert", async (update) => {
      const messageContent = update.messages[0];
      if (!messageContent.message) return;

      // Get the response text (from the conversation or extended message)
      const responseText = messageContent.message.conversation || messageContent.message.extendedTextMessage?.text;

      // Check if the message is a reply to the initial message
      const isReplyToMessage = messageContent.message.extendedTextMessage?.contextInfo.stanzaId === messageId;

      if (isReplyToMessage) {
        // React to the message
        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        // Extract video details
        const videoDetails = videoData.result;

        // React with an upward arrow
        await zk.sendMessage(dest, {
          react: { text: '⬆️', key: messageContent.key },
        });

        // Send the requested media based on the user's response
        if (responseText === '1') {
          await zk.sendMessage(dest, {
            video: { url: videoDetails.links.SD },
            caption: "*𝐁𝐖𝐌 𝐗𝐌𝐃*",
          }, { quoted: messageContent });
        } else if (responseText === '2') {
          await zk.sendMessage(dest, {
            video: { url: videoDetails.links.HD },
            caption: "*𝐁𝐖𝐌 𝐗𝐌𝐃*",
          }, { quoted: messageContent });
        } else if (responseText === '3') {
          await zk.sendMessage(dest, {
            audio: { url: videoDetails.links.SD },
            mimetype: "audio/mpeg",
          }, { quoted: messageContent });
        } else if (responseText === '4') {
          await zk.sendMessage(dest, {
            document: {
              url: videoDetails.links.SD
            },
            mimetype: "audio/mpeg",
            fileName: "Bwm.mp3",
            caption: "*𝐁𝐖𝐌 𝐗𝐌𝐃*"
          }, {
            quoted: messageContent
          });
        } else if (responseText === '5') {
          await zk.sendMessage(dest, {
            audio: {
              url: videoDetails.links.SD
            },
            mimetype: 'audio/mp4',
            ptt: true
          }, {
            quoted: messageContent
          });
        } else {
          // If the response is invalid, inform the user
          await zk.sendMessage(dest, {
            text: "Invalid option. Please reply with a valid number (1-5).",
            quoted: messageContent
          });
        }
      }
    });
  } catch (error) {
    console.error(error);
    repondre('An error occurred: ' + error.message);
  }
});


adams({
  nomCom: "gpt",
  aliases: ["gpt4", "ai"],
  reaction: '⚔️',
  categorie: "search"
}, async (context, message, params) => {
  const { repondre, arg } = params;  
  const alpha = arg.join(" ").trim(); 

  if (!alpha) return repondre("Please provide text.");

  let conversationData = [];
  try {
      const rawData = fs.readFileSync('store.json', 'utf8');
      conversationData = JSON.parse(rawData);
  } catch (err) {
      console.log('No previous conversation found, starting new one.');
  }

  const model = 'gpt-4-turbo-2024-04-09';
  const userMessage = { role: 'user', content: alpha };  
  const systemMessage = { role: 'system', content: 'You are an assistant in WhatsApp. You are called Ibrahim Adams. You respond to user commands.' };

  conversationData.push(userMessage);
  conversationData.push(systemMessage);

  try {
    
      const aiResponse = await ai.generate(model, conversationData);

     
      conversationData.push({ role: 'assistant', content: aiResponse });

      fs.writeFileSync('store.json', JSON.stringify(conversationData, null, 2));

      await repondre(aiResponse);
  } catch (error) {
      console.error("Error with AI generation: ", error);
      await repondre("Sorry, there was an error generating the response.");
  }
});

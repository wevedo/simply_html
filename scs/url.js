/*const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
//const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { adams } = require("../Ibrahim/adams");
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
const { Catbox } = require('node-catbox');

const catbox = new Catbox();

async function uploadToCatbox(Path) {
    if (!fs.existsSync(Path)) {
        throw new Error("File does not exist");
    }

    try {
        const response = await catbox.uploadFile({
            path: Path // Provide the path to the file
        });

        if (response) {
            return response; // returns the uploaded file URL
        } else {
            throw new Error("Error retrieving the file link");
        }
    } catch (err) {
        throw new Error(String(err));
    }
}

async function convertToMp3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat("mp3")
            .on("error", (err) => reject(err))
            .on("end", () => resolve(outputPath))
            .save(outputPath);
    });
}

adams({ nomCom: "url", categorie: "General", reaction: "👨🏿‍💻" }, async (origineMessage, zk, commandeOptions) => {
    const { msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) {
        repondre('Please reply to an image, video, or audio file.');
        return;
    }

    let mediaPath, mediaType;

    if (msgRepondu.videoMessage) {
        const videoSize = msgRepondu.videoMessage.fileLength;

        if (videoSize > 50 * 1024 * 1024) {
            repondre('The video is too long. Please send a smaller video.');
            return;
        }

        mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
        mediaType = 'video';
    } else if (msgRepondu.imageMessage) {
        mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
        mediaType = 'image';
    } else if (msgRepondu.audioMessage) {
        mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
        mediaType = 'audio';

        const outputPath = `${mediaPath}.mp3`;

        try {
            // Convert audio to MP3 format
            await convertToMp3(mediaPath, outputPath);
            fs.unlinkSync(mediaPath); // Remove the original audio file
            mediaPath = outputPath; // Update the path to the converted MP3 file
        } catch (error) {
            console.error("Error converting audio to MP3:", error);
            repondre('Failed to process the audio file.');
            return;
        }
    } else {
        repondre('Unsupported media type. Reply with an image, video, or audio file.');
        return;
    }

    try {
        const catboxUrl = await uploadToCatbox(mediaPath);
        fs.unlinkSync(mediaPath); // Remove the local file after uploading

        // Respond with the URL based on media type
        switch (mediaType) {
            case 'image':
                repondre(`Here is your image URL:\n${catboxUrl}`);
                break;
            case 'video':
                repondre(`Here is your video URL:\n${catboxUrl}`);
                break;
            case 'audio':
                repondre(`Here is your audio URL (MP3):\n${catboxUrl}`);
                break;
            default:
                repondre('An unknown error occurred.');
                break;
        }
    } catch (error) {
        console.error('Error while creating your URL:', error);
        repondre('Oops, an error occurred.');
    }
});


adams({ nomCom: "phoneinfo", categorie: "General", reaction: "📱" }, async (origineMessage, zk, commandeOptions) => {
    const { msgRepondu, repondre, sender } = commandeOptions;

    if (!msgRepondu) {
        repondre('Please reply to any message (text, audio, image, or video).');
        return;
    }

    try {
        // Fetch device and sender information
        const deviceInfo = zk.store.contacts[sender] || {};
        const batteryInfo = zk.battery || {};
        const platformInfo = msgRepondu.key.fromMe ? "You" : (deviceInfo.platform || "Unknown");

        const phoneInfo = `
        📱 **Phone Information**
        • **Name**: ${deviceInfo.name || "Unknown"}
        • **JID**: ${sender}
        • **Phone Type**: ${platformInfo}
        • **Battery**: ${batteryInfo.percent || "Unknown"}% (${batteryInfo.plugged ? "Charging" : "Not Charging"})
        • **Device Status**: ${zk.online ? "Online" : "Offline"}
        `.trim();

        repondre(phoneInfo);

    } catch (error) {
        console.error('Error fetching phone information:', error);
        repondre('An error occurred while retrieving phone information.');
    }
});





/*

adams(
  { nomCom: "sticker", categorie: "Conversion", reaction: "👨🏿‍💻" },
  async (origineMessage, zk, commandeOptions) => {
    let { ms, mtype, arg, repondre, nomAuteurMessage } = commandeOptions;

    // Check if message type is valid for sticker conversion
    const isImage = mtype === "imageMessage";
    const isVideo = mtype === "videoMessage";
    const tagImage = mtype === "extendedTextMessage" && JSON.stringify(ms.message).includes("imageMessage");
    const tagVideo = mtype === "extendedTextMessage" && JSON.stringify(ms.message).includes("videoMessage");

    const generateFileName = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;
    const stickerFileName = generateFileName(".webp");

    try {
      let buffer = Buffer.from([]);
      let downloadFilePath;

      if (isImage || tagImage) {
        downloadFilePath = ms.message.imageMessage || 
          ms.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

        if (!downloadFilePath) {
          repondre("No image found to convert to sticker!");
          return;
        }

        const media = await downloadContentFromMessage(downloadFilePath, "image");
        for await (const chunk of media) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        const sticker = new Sticker(buffer, {
          pack: "Bwm xmd",
          author: nomAuteurMessage,
          type: arg.includes("crop") || arg.includes("c") ? StickerTypes.CROPPED : StickerTypes.FULL,
          quality: 100,
        });

        await sticker.toFile(stickerFileName);

      } else if (isVideo || tagVideo) {
        downloadFilePath = ms.message.videoMessage || 
          ms.message.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;

        if (!downloadFilePath) {
          repondre("No video found to convert to sticker!");
          return;
        }

        const stream = await downloadContentFromMessage(downloadFilePath, "video");
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        const sticker = new Sticker(buffer, {
          pack: "Bwm xmd",
          author: nomAuteurMessage,
          type: arg.includes("-r") || arg.includes("-c") ? StickerTypes.CROPPED : StickerTypes.FULL,
          quality: 40,
        });

        await sticker.toFile(stickerFileName);

      } else {
        repondre("Please mention an image or video!");
        return;
      }

      // Send the sticker
      await zk.sendMessage(
        origineMessage,
        { sticker: fs.readFileSync(stickerFileName) },
        { quoted: ms }
      );

    } catch (error) {
      console.error("Error converting to sticker:", error);
      repondre("An error occurred while converting to sticker. Please try again.");
    } finally {
      // Clean up temporary file
      try {
        if (fs.existsSync(stickerFileName)) {
          fs.unlinkSync(stickerFileName);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up sticker file:", cleanupError);
     }
});


            
adams({nomCom:"scrop",categorie: "Conversion", reaction: "👨🏿‍💻"},async(origineMessage,zk,commandeOptions)=>{
   const {ms , msgRepondu,arg,repondre,nomAuteurMessage} = commandeOptions ;

  if(!msgRepondu) { repondre( 'make sure to mention the media' ) ; return } ;
  if(!(arg[0])) {
       pack = nomAuteurMessage
  } else {
    pack = arg.join(' ')
  } ;
  if (msgRepondu.imageMessage) {
     mediamsg = msgRepondu.imageMessage
  } else if(msgRepondu.videoMessage) {
mediamsg = msgRepondu.videoMessage
  } 
  else if (msgRepondu.stickerMessage) {
    mediamsg = msgRepondu.stickerMessage ;
  } else {
    repondre('Uh media please'); return
  } ;

  var stick = await zk.downloadAndSaveMediaMessage(mediamsg)

     let stickerMess = new Sticker(stick, {
            pack: Bmw-Md,
            
            type: StickerTypes.CROPPED,
            categories: ["🤩", "🎉"],
            id: "12345",
            quality: 70,
            background: "transparent",
          });
          const stickerBuffer2 = await stickerMess.toBuffer();
          zk.sendMessage(origineMessage, { sticker: stickerBuffer2 }, { quoted: ms });

});

adams({nomCom:"take",categorie: "Conversion", reaction: "👨🏿‍💻"},async(origineMessage,zk,commandeOptions)=>{
   const {ms , msgRepondu,arg,repondre,nomAuteurMessage} = commandeOptions ;

  if(!msgRepondu) { repondre( 'make sure to mention the media' ) ; return } ;
  if(!(arg[0])) {
       pack = nomAuteurMessage
  } else {
    pack = arg.join(' ')
  } ;
  if (msgRepondu.imageMessage) {
     mediamsg = msgRepondu.imageMessage
  } else if(msgRepondu.videoMessage) {
mediamsg = msgRepondu.videoMessage
  } 
  else if (msgRepondu.stickerMessage) {
    mediamsg = msgRepondu.stickerMessage ;
  } else {
    repondre('Uh a media please'); return
  } ;

  var stick = await zk.downloadAndSaveMediaMessage(mediamsg)

     let stickerMess = new Sticker(stick, {
            pack: BMW-MD,
            
            type: StickerTypes.FULL,
            categories: ["🤩", "🎉"],
            id: "12345",
            quality: 70,
            background: "transparent",
          });
          const stickerBuffer2 = await stickerMess.toBuffer();
          zk.sendMessage(origineMessage, { sticker: stickerBuffer2 }, { quoted: ms });

});


*/
adams({ nomCom: "write", categorie: "Conversion", reaction: "👨🏿‍💻" }, async (origineMessage, zk, commandeOptions) => {
  const { ms, msgRepondu, arg, repondre, nomAuteurMessage } = commandeOptions;

  if (!msgRepondu) {
    repondre('Please mention an image');
    return;
  }

  if (!msgRepondu.imageMessage) {
    repondre('The command only works with images');
    return;
  } ;
  text = arg.join(' ') ;
  
  if(!text || text === null) {repondre('Make sure to insert text') ; return } ;
 
  
  const mediamsg = msgRepondu.imageMessage;
  const image = await zk.downloadAndSaveMediaMessage(mediamsg);

  //Create a FormData object
  const data = new FormData();
  data.append('image', fs.createReadStream(image));

  //Configure headers
  const clientId = 'b40a1820d63cd4e'; // Replace with your Imgur client ID
  const headers = {
    'Authorization': `Client-ID ${clientId}`,
    ...data.getHeaders()
  };

  // Configure the query
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.imgur.com/3/image',
    headers: headers,
    data: data
  };

  try {
    const response = await axios(config);
    const imageUrl = response.data.data.link;
    console.log(imageUrl)

    //Use imageUrl however you want (meme creation, etc.)
    const meme = `https://api.memegen.link/images/custom/-/${text}.png?background=${imageUrl}`;

    // Create the sticker
    const stickerMess = new Sticker(meme, {
      pack: nomAuteurMessage,
      author: 'BMW-MD',
      type: StickerTypes.FULL,
      categories: ["🤩", "🎉"],
      id: "12345",
      quality: 70,
      background: "transparent",
    });

    const stickerBuffer2 = await stickerMess.toBuffer();
    zk.sendMessage(
      origineMessage,
      { sticker: stickerBuffer2 },
      { quoted: ms }
    );

  } catch (error) {
    console.error('Error uploading to Imgur :', error);
    repondre('An error occurred while creating the meme.');
  }
});



adams({nomCom:"photo",categorie: "Conversion", reaction: "👨🏿‍💻"},async(dest,zk,commandeOptions)=>{
   const {ms , msgRepondu,arg,repondre,nomAuteurMessage} = commandeOptions ;

  if(!msgRepondu) { repondre( 'make sure to mention the media' ) ; return } ;
 
   if (!msgRepondu.stickerMessage) {
      repondre('Um mention a non-animated sticker'); return
  } ;

 let mediaMess = await zk.downloadAndSaveMediaMessage(msgRepondu.stickerMessage);

  const alea = (ext) => {
  return `${Math.floor(Math.random() * 10000)}${ext}`;};
  
  let ran = await alea(".png");

  
        exec(`ffmpeg -i ${mediaMess} ${ran}`, (err) => {
          fs.unlinkSync(mediaMess);
          if (err) {
            zk.sendMessage(
              dest,
              {
                text: 'A non-animated sticker please',
              },
              { quoted: ms }
            );
            return;
          }
          let buffer = fs.readFileSync(ran);
          zk.sendMessage(
            dest,
            { image: buffer },
            { quoted: ms }
          );
          fs.unlinkSync(ran);
        });
});

adams({ nomCom: "trt", categorie: "Conversion", reaction: "👨🏿‍💻" }, async (dest, zk, commandeOptions) => {

  const { msgRepondu, repondre , arg } = commandeOptions;

  
   if(msgRepondu) {
     try {
      
     

       if(!arg || !arg[0]) { repondre('(eg : trt en)') ; return }
   

         let texttraduit = await traduire(msgRepondu.conversation , {to : arg[0]}) ;

         repondre(texttraduit)

        } catch (error) {
          
          repondre('Mention a texte Message') ;
      
        }

   } else {
     
     repondre('Mention a texte Message')
   }



}) ;

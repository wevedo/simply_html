const { adams } = require('../Ibrahim/adams');
const { default: axios } = require('axios');
const pkg = require('@whiskeysockets/baileys');
const { generateWAMessageFromContent, prepareWAMessageMedia } = pkg;

// Rent Command with QR Code
adams({ nomCom: "scanqr", reaction: "🚘", categorie: "User" }, async (dest, zk, commandeOptions) => {
  const { repondre } = commandeOptions;

  try {
    await repondre('ɢᴇɴᴇʀᴀᴛɪɴɢ ʏᴏᴜʀ ǫʀ ᴄᴏᴅᴇ.........');

    // Fetch QR Code from API
    const response = await axios.get('https://bwm-xmd-scanner-s211.onrender.com/qr', { responseType: 'arraybuffer' });
    const qrImage = Buffer.from(response.data, 'binary');

    // Prepare image message
    const mediaMessage = await prepareWAMessageMedia({ image: qrImage }, { upload: zk.waUploadToServer });

    // First message: QR code image
    const imageMessage = generateWAMessageFromContent(dest, {
      imageMessage: {
        jpegThumbnail: qrImage, // Thumbnail to display in preview
        caption: '*Scan this QR code to link your WhatsApp!*\n\n*Bwm XMD*\n*Made by Ibrahim Adams*',
        ...mediaMessage.imageMessage,
      },
    }, {});

    await zk.relayMessage(dest, imageMessage.message, { messageId: imageMessage.key.id });

    // Second message: Informative text with additional image
    const captionMessage = generateWAMessageFromContent(dest, {
      extendedTextMessage: {
        text: '*Link your WhatsApp account by scanning the QR code above.*\n\n*Bwm XMD*\n\n*Made by Ibrahim Adams*',
      },
    }, {});

    await zk.relayMessage(dest, captionMessage.message, {
      messageId: captionMessage.key.id,
    });

    // Optional: Include additional image (static image from the URL provided)
    const staticImageResponse = await axios.get('https://i.ibb.co/Rym4hXB/1000071591.png', { responseType: 'arraybuffer' });
    const staticImageBuffer = Buffer.from(staticImageResponse.data, 'binary');

    const staticMediaMessage = await prepareWAMessageMedia({ image: staticImageBuffer }, { upload: zk.waUploadToServer });
    const staticImageMessage = generateWAMessageFromContent(dest, {
      imageMessage: {
        jpegThumbnail: staticImageBuffer, // Thumbnail
        caption: '*Bwm XMD - Powered by Ibrahim Adams!*',
        ...staticMediaMessage.imageMessage,
      },
    }, {});

    await zk.relayMessage(dest, staticImageMessage.message, { messageId: staticImageMessage.key.id });

  } catch (error) {
    console.error('Error fetching QR code:', error.message);
    repondre('Error generating your QR code. Please try again.');
  }
});



// Unified Rent/Code Command
const nomComList = ["rent", "code", "pair", "link"]; // Add your desired commands here

nomComList.forEach((nomCom) => {
  adams({ nomCom, reaction: "🚘", categorie: "User" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;

    try {
      if (!arg || arg.length === 0) {
        return repondre(`Example Usage: .${nomCom} 254xxxxxxxx.`);
      }

      await repondre('ɢᴇɴᴇʀᴀᴛɪɴɢ ʏᴏᴜʀ ᴄᴏᴅᴇ.........');
      const text = encodeURIComponent(arg.join(' '));
      const apiUrl = `https://bwm-xmd-scanner-s211.onrender.com/code?number=${text}`;

      const response = await axios.get(apiUrl);
      const result = response.data;

      if (result && result.code) {
        const getsess = result.code;

        // First message with just the code
        const codeMessage = generateWAMessageFromContent(dest, {
          extendedTextMessage: {
            text: `\`\`\`${getsess}\`\`\``
          }
        }, {});

        await zk.relayMessage(dest, codeMessage.message, {
          messageId: codeMessage.key.id
        });

        // Second message with additional information
        const captionMessage = generateWAMessageFromContent(dest, {
          extendedTextMessage: {
            text: '*ᴄᴏᴘʏ ᴛʜᴇ ᴀʙᴏᴠᴇ ᴄᴏᴅᴇ ᴀɴᴅ ʟɪɴᴋ ɪᴛ ᴛᴏ ʏᴏᴜʀ ᴡʜᴀᴛsᴀᴘᴘ*\n\n*ʙᴡᴍ xᴍᴅ*\n\n*ᴍᴀᴅᴇ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs*'
          }
        }, {});

        await zk.relayMessage(dest, captionMessage.message, {
          messageId: captionMessage.key.id
        });

      } else {
        throw new Error('Invalid response from API.');
      }
    } catch (error) {
      console.error('Error getting API response:', error.message);
      repondre('Error getting response from API.');
    }
  });
});
// Scan Command
adams({ nomCom: "scan", reaction: "🔍", categorie: "pair" }, async (dest, zk, commandeOptions) => {
  const { repondre } = commandeOptions;

  try {
    const instructions = `
*📖 HOW TO GET BWM XMD SESSION:*

1️⃣ **Open the link below**

> https://www.ibrahimadams.site/scanner

2️⃣ **Enter Your WhatsApp Number**  

   👉 Type your WhatsApp number with your country code without (+) (e.g., 254xxxxxxxx) and tap **Submit**.  

3️⃣ **Receive a Code**  

   👉 Ibrahim Tech will send a short code, Copy it to your keyboard.  

4️⃣ **Check WhatsApp Notification**  

   👉 WhatsApp will notify you. Tap on the notification and enter the code sent by Ibrahim Tech.  

5️⃣ **Wait for the Session**  

   👉 After loading, it will link then Ibrahim Tech will send a session to your WhatsApp number.  

6️⃣ **Copy and Share the Session**  

   👉 Copy the long session and send it to your deployer.  

*💻 Powered by bwm xmd*  


> Made by Ibrahim Adams
    `;

    const instructionMessage = generateWAMessageFromContent(dest, {
      extendedTextMessage: {
        text: instructions
      }
    }, {});

    await zk.relayMessage(dest, instructionMessage.message, {
      messageId: instructionMessage.key.id
    });
  } catch (error) {
    console.error('Error sending instructions:', error.message);
    repondre('Error sending instructions.');
  }
});

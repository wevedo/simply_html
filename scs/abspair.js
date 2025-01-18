const { adams } = require('../Ibrahim/adams');
const axios = require('axios');
const sharp = require('sharp');

adams({ nomCom: "scanqr", reaction: "🚘", categorie: "User" }, async (dest, zk, commandeOptions) => {
  const { repondre } = commandeOptions;

  try {
    await repondre('Generating QR code... Please wait.');

    // Base image and QR code URLs
    const baseImageUrl = 'https://i.ibb.co/Rym4hXB/1000071591.png';
    const qrApiUrl = 'https://bwm-xmd-scanner-s211.onrender.com/qr';

    // Fetch the base image and QR code
    const baseImageResponse = await axios.get(baseImageUrl, { responseType: 'arraybuffer' });
    const qrResponse = await axios.get(qrApiUrl, { responseType: 'arraybuffer' });

    // Ensure both images are fetched successfully
    if (!baseImageResponse.data || !qrResponse.data) {
      throw new Error('Failed to fetch images. Please check the URLs or API.');
    }

    // Generate the composite image
    const compositeImageBuffer = await sharp(Buffer.from(baseImageResponse.data))
      .composite([
        {
          input: Buffer.from(qrResponse.data), // Overlay QR code
          top: 200, // Adjust position on Y-axis
          left: 200, // Adjust position on X-axis
        },
      ])
      .png()
      .toBuffer();

    // Send the composite image to WhatsApp
    await zk.sendMessage(dest, {
      image: compositeImageBuffer,
      caption: `*Scan this QR code to link your WhatsApp to the bot*\n\n*Made with ❤️ by Ibrahim Adams*`,
    });

    console.log('QR code with base image sent successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    await repondre('Failed to generate or send the QR code. Please try again later.');
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

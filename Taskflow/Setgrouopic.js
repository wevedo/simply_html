const { adams } = require('../Ibrahim/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');

// Utility to convert stream to buffer
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

adams({
    nomCom: "setgrouppic",
    categorie: "Group",
    reaction: "🖼️",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;

    const quotedMsg = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg?.imageMessage) {
        return repondre("ℹ️ Please reply to an image message to set as group picture.");
    }

    let pp = null;
    try {
        // Download and save image
        const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
        const buffer = await streamToBuffer(stream);
        pp = path.join(__dirname, `groupimg_${Date.now()}.jpg`);
        await fs.writeFile(pp, buffer);

        // Update profile picture
        await zk.updateProfilePicture(dest, { url: pp });
        await zk.sendMessage(dest, { text: "✅ Group picture updated successfully." });
        fs.unlinkSync(pp);
    } catch (err) {
        console.error("Error setting group picture:", err);
        if (pp && fs.existsSync(pp)) fs.unlinkSync(pp);
        await zk.sendMessage(dest, { text: `❌ Failed to update group picture: ${err.message}` });
    }
});



// Convert stream to buffer
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

adams({
  nomCom: "tomp3",
  categorie: "Media",
  reaction: "🎵",
  nomFichier: __filename,
}, async (dest, zk, commandeOptions) => {
  const { msgRepondu, ms, repondre } = commandeOptions;

  if (!msgRepondu?.videoMessage) {
    return repondre("⚠️ Please reply to a video message.");
  }

  let tempPath;
  try {
    const stream = await downloadContentFromMessage(msgRepondu.videoMessage, "video");
    const buffer = await streamToBuffer(stream);

    const timestamp = Date.now();
    tempPath = path.join(__dirname, `audio_${timestamp}.mp3`); // Pretend it's mp3
    await fs.writeFile(tempPath, buffer); // Just rename with .mp3

    await zk.sendMessage(dest, {
      audio: fs.readFileSync(tempPath),
      mimetype: "audio/mpeg",
      ptt: false
    }, { quoted: ms });

    fs.unlinkSync(tempPath);
  } catch (err) {
    console.error("Error sending audio:", err);
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    repondre("❌ Failed to process video.");
  }
});

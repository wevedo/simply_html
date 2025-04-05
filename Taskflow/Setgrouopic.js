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

    // Get quoted image message
    const quotedMsg = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg?.imageMessage) {
        return repondre("ℹ️ Please reply to an image message to set as group picture.");
    }

    let tempPath;
    try {
        // Download image stream
        const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
        const buffer = await streamToBuffer(stream);

        // Save to temporary file
        tempPath = path.join(__dirname, `groupimg_${Date.now()}.jpg`);
        await fs.writeFile(tempPath, buffer);

        // Set group picture
        await zk.groupUpdatePicture(dest, buffer);

        // Clean up
        fs.unlinkSync(tempPath);
        repondre("✅ Group picture updated successfully");
    } catch (err) {
        console.error("Group pic error:", err);
        if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        repondre(`❌ Failed to update group picture: ${err.message}`);
    }
});

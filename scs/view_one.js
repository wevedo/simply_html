const { adams } = require("../Ibrahim/adams");

// Add this at the beginning to see raw message structure
adams({ nomCom: "vv", categorie: "General", reaction: "🤪" }, async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) return repondre("Reply to a view-once message");

    // Debug: Log complete message structure
    console.log("DEBUG - RAW MESSAGE STRUCTURE:\n", JSON.stringify(msgRepondu, null, 2));

    try {
        const viewOnce = deepExtractViewOnce(msgRepondu);
        if (!viewOnce) return repondre("Not a view-once message");
        
        await processAndSendMedia(zk, dest, viewOnce, ms);
        repondre("Successfully revealed view-once media!");
    } catch (error) {
        console.error("Reveal Error:", error);
        repondre("Error: Failed to process view-once message");
    }
});

// Deep extraction function
function deepExtractViewOnce(msg) {
    const scanPaths = [
        'message.viewOnceMessage.message',
        'message.ephemeralMessage.message.viewOnceMessage.message',
        'message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessage.message',
        'message.extendedTextMessage.contextInfo.quotedMessage.ephemeralMessage.message.viewOnceMessage.message',
        'viewOnceMessage.message',
        'ephemeralMessage.message.viewOnceMessage.message',
        'message.viewOnceMessageV2.message',
        'message.viewOnceMessageV3.message'
    ];

    for (const path of scanPaths) {
        const parts = path.split('.');
        let result = msg;
        for (const part of parts) {
            result = result?.[part];
            if (!result) break;
        }
        if (result) return result;
    }
    return null;
}

async function processAndSendMedia(zk, dest, mediaContent, originalMsg) {
    const mediaType = Object.keys(mediaContent)[0];
    const mediaData = mediaContent[mediaType];
    
    const buffer = await zk.downloadMediaMessage(mediaData);
    const caption = mediaData.caption || "";

    const sendParams = {
        quoted: originalMsg,
        mimetype: mediaData.mimetype,
        caption: caption
    };

    switch(mediaType) {
        case 'imageMessage':
            return zk.sendMessage(dest, { image: buffer, ...sendParams });
        case 'videoMessage':
            return zk.sendMessage(dest, { video: buffer, ...sendParams });
        case 'audioMessage':
            sendParams.ptt = true;
            return zk.sendMessage(dest, { audio: buffer, ...sendParams });
        default:
            throw new Error(`Unsupported media type: ${mediaType}`);
    }
}

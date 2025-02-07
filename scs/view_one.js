const { adams } = require("../Ibrahim/adams");

// For manual command ("vv")
adams({ nomCom: "vv", categorie: "General", reaction: "🤪" }, async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) return repondre("Reply to a view-once message");

    try {
        const viewOnce = extractViewOnce(msgRepondu);
        if (!viewOnce) return repondre("Not a view-once message");
        
        await processAndSendMedia(zk, dest, viewOnce, ms);
    } catch (error) {
        console.error("Command Error:", error);
        repondre("Error processing view-once message");
    }
});

// Auto-capture all incoming view-once messages
module.exports = (zk) => {
    zk.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            try {
                const viewOnce = extractViewOnce(msg);
                if (!viewOnce) continue;

                const sender = msg.key.remoteJid;
                const mediaData = await processAndSendMedia(zk, sender, viewOnce, msg);
                
                // Optional: Delete original view-once message
                // await zk.sendMessage(sender, { delete: msg.key });
            } catch (error) {
                console.error("Auto-Capture Error:", error);
            }
        }
    });
};

// Helper functions
function extractViewOnce(message) {
    return message?.message?.ephemeralMessage?.message?.viewOnceMessage?.message ||
           message?.message?.viewOnceMessage?.message ||
           message?.viewOnceMessage?.message;
}

async function processAndSendMedia(zk, dest, mediaContent, originalMsg) {
    const mediaType = Object.keys(mediaContent)[0];
    const mediaData = mediaContent[mediaType];
    
    const buffer = await zk.downloadMediaMessage(mediaData);
    const caption = mediaData.caption || "";
    
    const sendOptions = {
        image: { url: buffer },
        video: { url: buffer },
        audio: { url: buffer },
        caption: caption,
        mimetype: mediaData.mimetype,
        viewOnce: true // Convert to normal message
    };

    switch(mediaType) {
        case 'imageMessage':
            return zk.sendMessage(dest, { image: sendOptions.image, caption: sendOptions.caption }, { quoted: originalMsg });
        case 'videoMessage':
            return zk.sendMessage(dest, { video: sendOptions.video, caption: sendOptions.caption }, { quoted: originalMsg });
        case 'audioMessage':
            return zk.sendMessage(dest, { audio: sendOptions.audio, mimetype: 'audio/mpeg' }, { quoted: originalMsg });
        default:
            throw new Error("Unsupported media type");
    }
}

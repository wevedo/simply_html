const { adams } = require("../Ibrahim/adams");

adams({ nomCom: "vv", categorie: "General", reaction: "🤪" }, async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) return repondre("Reply to a media message");

    try {
        // Try to find media in any message format
        const mediaData = extractAnyMedia(msgRepondu);
        
        if (!mediaData) return repondre("No media found in this message");
        
        // Download media
        const buffer = await zk.downloadMediaMessage(mediaData);
        const caption = mediaData.caption || "";
        
        // Determine media type
        if (mediaData.mimetype?.startsWith('image/')) {
            await zk.sendMessage(dest, { 
                image: buffer, 
                caption: caption 
            }, { quoted: ms });
            
        } else if (mediaData.mimetype?.startsWith('video/')) {
            await zk.sendMessage(dest, { 
                video: buffer, 
                caption: caption 
            }, { quoted: ms });
            
        } else if (mediaData.mimetype?.startsWith('audio/')) {
            await zk.sendMessage(dest, { 
                audio: buffer,
                mimetype: 'audio/mpeg',
                ptt: true 
            }, { quoted: ms });
            
        } else {
            repondre("Unsupported media type");
        }
        
    } catch (error) {
        console.error("Media download error:", error);
        repondre("Failed to process media");
    }
});

// Universal media extractor
function extractAnyMedia(msg) {
    // Check for media in different message structures
    const mediaPaths = [
        'message.imageMessage',
        'message.videoMessage',
        'message.audioMessage',
        'message.viewOnceMessage.message.imageMessage',
        'message.viewOnceMessage.message.videoMessage',
        'message.ephemeralMessage.message.imageMessage',
        'message.ephemeralMessage.message.videoMessage',
        'message.extendedTextMessage.contextInfo.quotedMessage.imageMessage',
        'message.extendedTextMessage.contextInfo.quotedMessage.videoMessage',
        'message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessage.message.imageMessage',
        'message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessage.message.videoMessage'
    ];

    for (const path of mediaPaths) {
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

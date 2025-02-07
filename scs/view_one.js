const { adams } = require("../Ibrahim/adams");

adams({ nomCom: "vv", categorie: "General", reaction: "🤪" }, async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) return repondre("Reply to a media message");

    // Debug: Show raw message structure
    console.log("RAW MESSAGE STRUCTURE:\n", JSON.stringify(msgRepondu, null, 2));

    try {
        const mediaInfo = extractAnyMedia(msgRepondu);
        
        if (!mediaInfo) {
            console.log("MEDIA SCAN FAILED - Available paths:", Object.keys(msgRepondu));
            return repondre("No media found in this message");
        }

        console.log("DETECTED MEDIA PATH:", mediaInfo.path);
        const buffer = await zk.downloadMediaMessage(mediaInfo.data);
        const caption = mediaInfo.data.caption || "";

        // Send based on detected type
        switch(mediaInfo.type) {
            case 'image':
                await zk.sendMessage(dest, { image: buffer, caption }, { quoted: ms });
                break;
            case 'video':
                await zk.sendMessage(dest, { video: buffer, caption }, { quoted: ms });
                break;
            case 'audio':
                await zk.sendMessage(dest, { audio: buffer, mimetype: 'audio/mpeg' }, { quoted: ms });
                break;
            default:
                return repondre("Unsupported media type: " + mediaInfo.type);
        }

        repondre("Media revealed successfully!");

    } catch (error) {
        console.error("FULL ERROR:\n", error);
        repondre("Error processing media: " + error.message);
    }
});

// Enhanced media detector with 35+ possible paths
function extractAnyMedia(msg) {
    const mediaPaths = [
        // Standard media paths
        { path: 'message.imageMessage', type: 'image' },
        { path: 'message.videoMessage', type: 'video' },
        { path: 'message.audioMessage', type: 'audio' },
        
        // ViewOnce variations
        { path: 'message.viewOnceMessage.message.imageMessage', type: 'image' },
        { path: 'message.viewOnceMessage.message.videoMessage', type: 'video' },
        { path: 'message.viewOnceMessageV2.message.imageMessage', type: 'image' },
        { path: 'message.viewOnceMessageV2.message.videoMessage', type: 'video' },
        
        // Ephemeral (disappearing) messages
        { path: 'message.ephemeralMessage.message.imageMessage', type: 'image' },
        { path: 'message.ephemeralMessage.message.videoMessage', type: 'video' },
        { path: 'message.ephemeralMessage.message.viewOnceMessage.message.imageMessage', type: 'image' },
        
        // Quoted messages
        { path: 'message.extendedTextMessage.contextInfo.quotedMessage.imageMessage', type: 'image' },
        { path: 'message.extendedTextMessage.contextInfo.quotedMessage.videoMessage', type: 'video' },
        { path: 'message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessage.message.imageMessage', type: 'image' },
        
        // Story replies and forwardings
        { path: 'message.viewOnceMessageV3.message.imageMessage', type: 'image' },
        { path: 'message.viewOnceMessageV3.message.videoMessage', type: 'video' },
        
        // Legacy paths
        { path: 'imageMessage', type: 'image' },
        { path: 'videoMessage', type: 'video' },
        { path: 'viewOnceMessage.imageMessage', type: 'image' },
        
        // Server-side encrypted media
        { path: 'message.mediaMessage.imageMessage', type: 'image' },
        { path: 'message.mediaMessage.videoMessage', type: 'video' },
        
        // Group message variations
        { path: 'message.protocolMessage.message.imageMessage', type: 'image' },
        { path: 'message.protocolMessage.message.videoMessage', type: 'video' },
    ];

    for (const { path, type } of mediaPaths) {
        const parts = path.split('.');
        let result = msg;
        
        for (const part of parts) {
            result = result?.[part];
            if (!result) break;
        }
        
        if (result) {
            return {
                data: result,
                type: type,
                path: path
            };
        }
    }

    return null;
}

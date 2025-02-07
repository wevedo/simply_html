const { adams } = require("../Ibrahim/adams");
adams({ nomCom: "vv", categorie: "General", reaction: "🤪" }, async (dest, zk, commandeOptions) => {

    const { ms, msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) {
        return repondre("*Mentionne a view once media* .");
    }

    // New: Handle both direct and quoted view-once messages
    const viewOnceMessage = 
        msgRepondu.viewOnceMessage || 
        msgRepondu.message?.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessage;

    if (viewOnceMessage) {
        const mediaContent = viewOnceMessage.message;
        const mediaType = Object.keys(mediaContent)[0];

        try {
            const media = await zk.downloadAndSaveMediaMessage(mediaContent[mediaType]);
            const caption = mediaContent[mediaType]?.caption || "";

            switch(mediaType) {
                case 'imageMessage':
                    await zk.sendMessage(dest, { 
                        image: { url: media }, 
                        caption: caption 
                    }, { quoted: ms });
                    break;

                case 'videoMessage':
                    await zk.sendMessage(dest, { 
                        video: { url: media }, 
                        caption: caption 
                    }, { quoted: ms });
                    break;

                case 'audioMessage':
                    await zk.sendMessage(dest, { 
                        audio: { url: media }, 
                        mimetype: 'audio/mpeg',
                        ptt: true 
                    }, { quoted: ms });
                    break;

                default:
                    return repondre("Unsupported view-once media type");
            }
        } catch (error) {
            console.error("Error processing view-once message:", error);
            return repondre("Error processing media");
        }
    } else {
        return repondre("*This is not a view-once message*");
    }
});

const { adams } = require("../Ibrahim/adams")
const { getContentType } = require("@whiskeysockets/baileys")

adams({ nomCom: "vv", categorie: "General", reaction: "🤩" }, async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) return repondre("*Mentionne a view once media*.");

    try {
        // Check for view-once message structure
        const viewOnceMessage = msgRepondu.message?.viewOnceMessage?.message;
        
        if (viewOnceMessage) {
            if (viewOnceMessage.imageMessage) {
                const image = await zk.downloadAndSaveMediaMessage(viewOnceMessage.imageMessage);
                await zk.sendMessage(dest, { 
                    image: { url: image }, 
                    caption: viewOnceMessage.imageMessage.caption || ""
                }, { quoted: ms });
                
            } else if (viewOnceMessage.videoMessage) {
                const video = await zk.downloadAndSaveMediaMessage(viewOnceMessage.videoMessage);
                await zk.sendMessage(dest, { 
                    video: { url: video }, 
                    caption: viewOnceMessage.videoMessage.caption || ""
                }, { quoted: ms });
                
            } else {
                return repondre("Unsupported view-once media type.");
            }
        } else {
            return repondre("This message is not a view-once message.");
        }
    } catch (error) {
        console.error("Error processing view-once message:", error);
        repondre("Failed to process view-once media.");
    }
});

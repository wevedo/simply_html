const { adams } = require("../Ibrahim/adams");
adams({ nomCom: "vv", categorie: "General", reaction: "🤪" }, async (dest, zk, commandeOptions) => {

    const { ms, msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) {
        return repondre("*Mentionne a view once media* .");
    }

    if (msgRepondu.viewOnceMessage) {
        const viewOnceContent = msgRepondu.viewOnceMessage.message;
        
        if (viewOnceContent.imageMessage) {
            const image = await zk.downloadAndSaveMediaMessage(viewOnceContent.imageMessage);
            const texte = viewOnceContent.imageMessage.caption || "";
            await zk.sendMessage(dest, { image: { url: image }, caption: texte }, { quoted: ms });
            
        } else if (viewOnceContent.videoMessage) {
            const video = await zk.downloadAndSaveMediaMessage(viewOnceContent.videoMessage);
            const texte = viewOnceContent.videoMessage.caption || "";
            await zk.sendMessage(dest, { video: { url: video }, caption: texte }, { quoted: ms });
            
        } else if (viewOnceContent.audioMessage) {
            const audio = await zk.downloadAndSaveMediaMessage(viewOnceContent.audioMessage);
            await zk.sendMessage(dest, { 
                audio: { url: audio }, 
                mimetype: "audio/mpeg",
                ptt: true
            }, { quoted: ms });
            
        } else {
            return repondre("Unsupported view once content type.");
        }
    } else {
        return repondre("This message is not a view once message.");
    }
});

const { adams } = require("../Ibrahim/adams");

adams({nomCom: "ok", categorie: "General", reaction: "🤲🏿"}, async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) {
        return repondre("*Reply to a view-once media message.*");
    }

    // Check if the replied message is a view-once message
    if (msgRepondu.viewOnceMessageV2) {
        try {
            const sender = msgRepondu.key.participant || msgRepondu.key.remoteJid; // Get the sender's ID
            const senderName = (await zk.onWhatsApp(sender))[0]?.notify || sender.split("@")[0]; // Get sender name or fallback to number
            
            // Handle image messages
            if (msgRepondu.viewOnceMessageV2.message.imageMessage) {
                const image = await zk.downloadAndSaveMediaMessage(msgRepondu.viewOnceMessageV2.message.imageMessage);
                const caption = msgRepondu.viewOnceMessageV2.message.imageMessage.caption || "";

                await zk.sendMessage(conf.NUMERO_OWNER + "@s.whatsapp.net", {
                    image: { url: image },
                    caption: `*Forwarded View-Once Message*\n\n*From*: ${senderName}\n*Number*: ${sender.split("@")[0]}\n\n${caption}`
                });
            }
            // Handle video messages
            else if (msgRepondu.viewOnceMessageV2.message.videoMessage) {
                const video = await zk.downloadAndSaveMediaMessage(msgRepondu.viewOnceMessageV2.message.videoMessage);
                const caption = msgRepondu.viewOnceMessageV2.message.videoMessage.caption || "";

                await zk.sendMessage(conf.NUMERO_OWNER + "@s.whatsapp.net", {
                    video: { url: video },
                    caption: `*Forwarded View-Once Message*\n\n*From*: ${senderName}\n*Number*: ${sender.split("@")[0]}\n\n${caption}`
                });
            } else {
                return repondre("The media type is not supported.");
            }

            repondre("*View-once message forwarded successfully!*");
        } catch (err) {
            console.error("Error forwarding view-once message:", err);
            repondre("*Failed to forward the view-once message.*");
        }
    } else {
        return repondre("*The replied message is not a view-once message.*");
    }
});

adams({nomCom:"vv",categorie:"General",reaction:"🤪"},async(dest,zk,commandeOptions)=>{

const {ms,msgRepondu,repondre}=commandeOptions;


if(!msgRepondu){return repondre("*Mentionne a view once media* .");}


if(msgRepondu.viewOnceMessageV2)
{
      if(msgRepondu.viewOnceMessageV2.message.imageMessage)
       {
         var image =await zk.downloadAndSaveMediaMessage(msgRepondu.viewOnceMessageV2.message.imageMessage)
        var texte = msgRepondu.viewOnceMessageV2.message.imageMessage.caption
    
     await zk.sendMessage(dest,{image:{url:image},caption:texte},{quoted:ms})
      }else if(msgRepondu.viewOnceMessageV2.message.videoMessage){

    var video = await zk.downloadAndSaveMediaMessage(msgRepondu.viewOnceMessageV2.message.videoMessage)
var texte =msgRepondu.viewOnceMessageV2.message.videoMessage.caption


await zk.sendMessage(dest,{video:{url:video},caption:texte},{quoted:ms})

}
}else
{
   return repondre("this message is not on view once .")
}



})

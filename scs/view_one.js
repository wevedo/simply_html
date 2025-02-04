const { adams } = require("../Ibrahim/adams");
const { getContentType, downloadMediaMessage } = require("@whiskeysockets/baileys");

adams({ nomCom: "vv", categorie: "General", reaction: "🤩" }, async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) {
        return repondre("*Mention a view-once media message.*");
    }

    // Detecting if the message is a "view once" message
    const messageType = getContentType(msgRepondu.message);
    if (messageType !== "viewOnceMessage") {
        return repondre("This message is not a 'view once' media.");
    }

    // Extracting the actual media content inside the viewOnceMessage
    const viewOnceContent = msgRepondu.message.viewOnceMessage.message;
    const mediaKey = Object.keys(viewOnceContent)[0]; // Extract the key (imageMessage or videoMessage)

    if (mediaKey === "imageMessage" || mediaKey === "videoMessage") {
        const media = viewOnceContent[mediaKey];
        const mediaBuffer = await downloadMediaMessage(msgRepondu, "buffer");

        // Sending the media back as a normal message
        await zk.sendMessage(
            dest,
            { [mediaKey.split("Message")[0]]: mediaBuffer, caption: media.caption || "" },
            { quoted: ms }
        );
    } else {
        return repondre("Unsupported media type.");
    }
});

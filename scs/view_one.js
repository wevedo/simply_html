const { adams } = require("../Ibrahim/adams");

adams({ nomCom: "vv", categorie: "General", reaction: "😅" }, async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre } = commandeOptions;

    // Check if the user replied to a message
    if (!msgRepondu) {
        return repondre("*Mention a view-once media message to open it.*");
    }

    // Detect if the replied-to message is a view-once message
    const viewOnceMsg = msgRepondu.viewOnceMessageV2?.message || msgRepondu.viewOnceMessage?.message;

    if (!viewOnceMsg) {
        return repondre("*The mentioned message is not a view-once message.*");
    }

    try {
        // Handle view-once image messages
        if (viewOnceMsg.imageMessage) {
            const imagePath = await zk.downloadAndSaveMediaMessage(viewOnceMsg.imageMessage); // Download image
            const caption = viewOnceMsg.imageMessage.caption || ""; // Get the caption if available
            await zk.sendMessage(dest, {
                image: { url: imagePath },
                caption: caption,
            }, { quoted: ms });
            console.log("View-once image processed and sent successfully.");
        }
        // Handle view-once video messages
        else if (viewOnceMsg.videoMessage) {
            const videoPath = await zk.downloadAndSaveMediaMessage(viewOnceMsg.videoMessage); // Download video
            const caption = viewOnceMsg.videoMessage.caption || ""; // Get the caption if available
            await zk.sendMessage(dest, {
                video: { url: videoPath },
                caption: caption,
            }, { quoted: ms });
            console.log("View-once video processed and sent successfully.");
        }
        // Handle view-once audio messages
        else if (viewOnceMsg.audioMessage) {
            const audioPath = await zk.downloadAndSaveMediaMessage(viewOnceMsg.audioMessage); // Download audio
            await zk.sendMessage(dest, {
                audio: { url: audioPath },
                ptt: true, // Send as a voice message
            }, { quoted: ms });
            console.log("View-once audio processed and sent successfully.");
        } else {
            // If no supported media type is detected
            return repondre("*This view-once media type is not supported.*");
        }
    } catch (error) {
        console.error("Error processing view-once message:", error);
        return repondre("*Failed to process the view-once message. Please try again.*");
    }
});

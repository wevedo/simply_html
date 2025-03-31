module.exports = {
    setup: async (zk, { conf, store }) => {
        if (!zk || !conf || !store) return;

        console.log("Initializing Anti-Delete system...");

        zk.ev.on("messages.upsert", async (m) => {  
        if (conf.ANTIDELETE1 === "yes") { // Ensure antidelete is enabled  
        const { messages } = m;  
        const ms = messages[0];  
        if (!ms.message) return; // Skip messages with no content  

        const messageKey = ms.key;  
        const remoteJid = messageKey.remoteJid;  

        // **Ignore status updates** (status updates are stored under `status@broadcast`)  
        if (remoteJid === "status@broadcast") return;  

        // Initialize chat storage if it doesn't exist  
        if (!store.chats[remoteJid]) {  
            store.chats[remoteJid] = [];  
        }  

        // Save the received message to storage  
        store.chats[remoteJid].push(ms);  

        // Handle deleted messages  
        if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0) {  
            const deletedKey = ms.message.protocolMessage.key;  

            // Search for the deleted message in stored messages  
            const chatMessages = store.chats[remoteJid];  
            const deletedMessage = chatMessages.find(  
                (msg) => msg.key.id === deletedKey.id  
            );  

            if (deletedMessage) {  
                try {  
                    const participant = deletedMessage.key.participant || deletedMessage.key.remoteJid;  
                    const notification = `*🛑 This message was deleted by @${participant.split("@")[0]}*`;  

                    const botOwnerJid = `${conf.NUMERO_OWNER}@s.whatsapp.net`; // Bot owner's JID  

                    // Handle text messages  
                    if (deletedMessage.message.conversation) {  
                        await zk.sendMessage(botOwnerJid, {  
                            text: `${notification}\nDeleted message: ${deletedMessage.message.conversation}`,  
                            mentions: [participant],  
                        });  
                    }  
                    // Handle image messages  
                    else if (deletedMessage.message.imageMessage) {  
                        const caption = deletedMessage.message.imageMessage.caption || '';  
                        const imagePath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.imageMessage);  
                        await zk.sendMessage(botOwnerJid, {  
                            image: { url: imagePath },  
                            caption: `${notification}\n${caption}`,  
                            mentions: [participant],  
                        });  
                    }  
                    // Handle video messages  
                    else if (deletedMessage.message.videoMessage) {  
                        const caption = deletedMessage.message.videoMessage.caption || '';  
                        const videoPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.videoMessage);  
                        await zk.sendMessage(botOwnerJid, {  
                            video: { url: videoPath },  
                            caption: `${notification}\n${caption}`,  
                            mentions: [participant],  
                        });  
                    }  
                    // Handle audio messages  
                    else if (deletedMessage.message.audioMessage) {  
                        const audioPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.audioMessage);  
                        await zk.sendMessage(botOwnerJid, {  
                            audio: { url: audioPath },  
                            ptt: true, // Send as a voice message  
                            caption: notification,  
                            mentions: [participant],  
                        });  
                    }  
                    // Handle sticker messages  
                    else if (deletedMessage.message.stickerMessage) {  
                        const stickerPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.stickerMessage);  
                        await zk.sendMessage(botOwnerJid, {  
                            sticker: { url: stickerPath },  
                            caption: notification,  
                            mentions: [participant],  
                        });  
                    }  
                } catch (error) {  
                    console.error('Error handling deleted message:', error);  
                }  
            }  
        }  
    }  
});

        console.log("✅ Anti-Delete system activated!");
    }
};

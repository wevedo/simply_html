module.exports = (zk, conf, store, getGroupMetadata) => {
    // Silent Group Updates
    zk.ev.on("groups.update", async (updates) => {
        for (const update of updates) {
            const { id } = update;
            if (!id.endsWith("@g.us")) continue;
            await getGroupMetadata(zk, id);
        }
    });

    zk.ev.on("messages.upsert", async (m) => {  
        if (conf.ANTIDELETE1 === "yes") {
            const { messages } = m;  
            const ms = messages[0];  
            if (!ms.message) return;

            const messageKey = ms.key;  
            const remoteJid = messageKey.remoteJid;  

            if (remoteJid === "status@broadcast") return;

            if (!store.chats[remoteJid]) {  
                store.chats[remoteJid] = [];  
            }  

            store.chats[remoteJid].push(ms);  

            if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0) {  
                const deletedKey = ms.message.protocolMessage.key;  
                const chatMessages = store.chats[remoteJid];  
                const deletedMessage = chatMessages.find(
                    (msg) => msg.key.id === deletedKey.id  
                );  

                if (deletedMessage) {  
                    try {  
                        const participant = deletedMessage.key.participant || deletedMessage.key.remoteJid;  
                        const notification = `*🛑 This message was deleted by @${participant.split("@")[0]}*`;
                        const botOwnerJid = `${conf.NUMERO_OWNER}@s.whatsapp.net`;

                        // Text messages
                        if (deletedMessage.message.conversation) {  
                            await zk.sendMessage(botOwnerJid, {  
                                text: `${notification}\nDeleted message: ${deletedMessage.message.conversation}`,  
                                mentions: [participant],  
                            });  
                        }
                        // Image messages
                        else if (deletedMessage.message.imageMessage) {  
                            const caption = deletedMessage.message.imageMessage.caption || '';  
                            const imagePath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.imageMessage);  
                            await zk.sendMessage(botOwnerJid, {  
                                image: { url: imagePath },  
                                caption: `${notification}\n${caption}`,  
                                mentions: [participant],  
                            });  
                        }
                        // Video messages
                        else if (deletedMessage.message.videoMessage) {  
                            const caption = deletedMessage.message.videoMessage.caption || '';  
                            const videoPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.videoMessage);  
                            await zk.sendMessage(botOwnerJid, {  
                                video: { url: videoPath },  
                                caption: `${notification}\n${caption}`,  
                                mentions: [participant],  
                            });  
                        }
                        // Audio messages
                        else if (deletedMessage.message.audioMessage) {  
                            const audioPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.audioMessage);  
                            await zk.sendMessage(botOwnerJid, {  
                                audio: { url: audioPath },  
                                ptt: true,  
                                caption: notification,  
                                mentions: [participant],  
                            });  
                        }
                        // Sticker messages
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
};

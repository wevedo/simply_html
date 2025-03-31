module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) return;

        console.log("Initializing Anti-Delete System...");

        let store = { chats: {} };

        adams.ev.on("messages.upsert", async (m) => {
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

            if (ms.message.protocolMessage?.type === 0) {
                const deletedKey = ms.message.protocolMessage.key;
                const chatMessages = store.chats[remoteJid];
                const deletedMessage = chatMessages.find(msg => msg.key.id === deletedKey.id);

                if (deletedMessage) {
                    try {
                        const participant = deletedMessage.key.participant || deletedMessage.key.remoteJid;
                        const notification = `*🛑 This message was deleted by @${participant.split("@")[0]}*`;
                        const botOwnerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`;

                        const sendMessage = async (jid, content) => {
                            await adams.sendMessage(jid, content);
                        };

                        let messageContent = { text: notification, mentions: [participant] };

                        // Handle different message types
                        if (deletedMessage.message.conversation) {
                            // Text message
                            messageContent.text += `\nDeleted message: ${deletedMessage.message.conversation}`;
                        } else if (deletedMessage.message.extendedTextMessage) {
                            // Extended text message (with links, etc)
                            const text = deletedMessage.message.extendedTextMessage.text;
                            messageContent.text += `\nDeleted message: ${text}`;
                        } else {
                            // Media messages
                            let mediaType = null;
                            let mediaKey = null;
                            let caption = '';
                            
                            if (deletedMessage.message.imageMessage) {
                                mediaType = 'image';
                                mediaKey = deletedMessage.message.imageMessage;
                                caption = mediaKey.caption || '';
                            } else if (deletedMessage.message.videoMessage) {
                                mediaType = 'video';
                                mediaKey = deletedMessage.message.videoMessage;
                                caption = mediaKey.caption || '';
                            } else if (deletedMessage.message.audioMessage) {
                                mediaType = 'audio';
                                mediaKey = deletedMessage.message.audioMessage;
                            } else if (deletedMessage.message.stickerMessage) {
                                mediaType = 'sticker';
                                mediaKey = deletedMessage.message.stickerMessage;
                            }

                            if (mediaType) {
                                try {
                                    const mediaPath = await adams.downloadAndSaveMediaMessage(deletedMessage, mediaType);
                                    
                                    switch (mediaType) {
                                        case 'image':
                                            messageContent = { 
                                                image: { url: mediaPath }, 
                                                caption: `${notification}\n${caption}`,
                                                mentions: [participant] 
                                            };
                                            break;
                                        case 'video':
                                            messageContent = { 
                                                video: { url: mediaPath }, 
                                                caption: `${notification}\n${caption}`,
                                                mentions: [participant] 
                                            };
                                            break;
                                        case 'audio':
                                            messageContent = { 
                                                audio: { url: mediaPath }, 
                                                ptt: mediaKey.ptt || false,
                                                caption: notification,
                                                mentions: [participant] 
                                            };
                                            break;
                                        case 'sticker':
                                            messageContent = { 
                                                sticker: { url: mediaPath },
                                                mentions: [participant] 
                                            };
                                            break;
                                    }
                                } catch (downloadError) {
                                    logger.error('Error downloading media:', downloadError);
                                    messageContent.text += `\n[Failed to recover deleted ${mediaType} message]`;
                                    if (caption) {
                                        messageContent.text += `\nCaption: ${caption}`;
                                    }
                                }
                            }
                        }

                        // Send notifications based on config
                        if (config.ANTIDELETE1 === "yes") {
                            await sendMessage(botOwnerJid, messageContent);
                        }

                        if (config.ANTIDELETE2 === "yes") {
                            await sendMessage(remoteJid, messageContent);
                        }

                    } catch (error) {
                        logger.error('Error handling deleted message:', error);
                    }
                }
            }
        });

        console.log("✅ Anti-Delete System operational");
    }
};

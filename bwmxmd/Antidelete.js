const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
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

            if (remoteJid === "status@broadcast") return; // Ignore status updates

            if (!store.chats[remoteJid]) {
                store.chats[remoteJid] = [];
            }

            store.chats[remoteJid].push(ms);

            if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0) {
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

                        let messageContent = { text: `${notification}`, mentions: [participant] };

                        if (deletedMessage.message.conversation) {
                            // Handle text message
                            messageContent.text += `\nDeleted message: ${deletedMessage.message.conversation}`;
                        } else if (deletedMessage.message.extendedTextMessage) {
                            // Handle extended text message (with links, etc)
                            messageContent.text += `\nDeleted message: ${deletedMessage.message.extendedTextMessage.text}`;
                        } else if (deletedMessage.message.imageMessage) {
                            // Handle image message
                            const imageBuffer = await adams.downloadMediaMessage(deletedMessage);
                            const caption = deletedMessage.message.imageMessage.caption || '';
                            messageContent = { 
                                image: imageBuffer, 
                                caption: `${notification}\n${caption}`.trim(), 
                                mentions: [participant] 
                            };
                        } else if (deletedMessage.message.videoMessage) {
                            // Handle video message
                            const videoBuffer = await adams.downloadMediaMessage(deletedMessage);
                            const caption = deletedMessage.message.videoMessage.caption || '';
                            messageContent = { 
                                video: videoBuffer, 
                                caption: `${notification}\n${caption}`.trim(), 
                                mentions: [participant] 
                            };
                        } else if (deletedMessage.message.audioMessage) {
                            // Handle audio message
                            const audioBuffer = await adams.downloadMediaMessage(deletedMessage);
                            messageContent = { 
                                audio: audioBuffer, 
                                mimetype: 'audio/mp4', // WhatsApp audio format
                                ptt: deletedMessage.message.audioMessage.ptt, // Whether it's voice note
                                caption: notification, 
                                mentions: [participant] 
                            };
                        } else if (deletedMessage.message.stickerMessage) {
                            // Handle sticker message
                            const stickerBuffer = await adams.downloadMediaMessage(deletedMessage);
                            messageContent = { 
                                sticker: stickerBuffer,
                                caption: notification, 
                                mentions: [participant] 
                            };
                        } else if (deletedMessage.message.documentMessage) {
                            // Handle document message
                            const documentBuffer = await adams.downloadMediaMessage(deletedMessage);
                            const filename = deletedMessage.message.documentMessage.fileName || 'document';
                            messageContent = { 
                                document: documentBuffer,
                                mimetype: deletedMessage.message.documentMessage.mimetype,
                                fileName: filename,
                                caption: notification, 
                                mentions: [participant] 
                            };
                        }

                        if (config.ANTIDELETE1 === "yes") {
                            await sendMessage(botOwnerJid, messageContent);
                        }

                        if (config.ANTIDELETE2 === "yes") {
                            await sendMessage(remoteJid, messageContent);
                        }

                    } catch (error) {
                        logger.error('Error handling deleted message:', error);
                        // Fallback to text if media fails
                        try {
                            const fallbackContent = {
                                text: `${notification}\n[Media could not be recovered]`,
                                mentions: [participant]
                            };
                            if (config.ANTIDELETE1 === "yes") {
                                await sendMessage(botOwnerJid, fallbackContent);
                            }
                            if (config.ANTIDELETE2 === "yes") {
                                await sendMessage(remoteJid, fallbackContent);
                            }
                        } catch (err) {
                            logger.error('Fallback error:', err);
                        }
                    }
                }
            }
        });

        console.log("✅ Anti-Delete System operational");
    }
};

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { createContext } = require('../utils/helper');
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const util = require('util');
const pipeline = util.promisify(stream.pipeline);

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) {
            logger.error('Anti-Delete: Missing adams or config');
            return;
        }

        const botJid = `${adams.user?.id.split(':')[0]}@s.whatsapp.net`;
        const botOwnerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`;
        let store = { chats: {} };

        // Function to process media messages
        const processMediaMessage = async (deletedMessage, participant) => {
            let mediaType, mediaInfo;
            
            if (deletedMessage.message?.imageMessage) {
                mediaType = 'image';
                mediaInfo = deletedMessage.message.imageMessage;
            } else if (deletedMessage.message?.videoMessage) {
                mediaType = 'video';
                mediaInfo = deletedMessage.message.videoMessage;
            } else if (deletedMessage.message?.audioMessage) {
                mediaType = 'audio';
                mediaInfo = deletedMessage.message.audioMessage;
            } else if (deletedMessage.message?.stickerMessage) {
                mediaType = 'sticker';
                mediaInfo = deletedMessage.message.stickerMessage;
            } else if (deletedMessage.message?.documentMessage) {
                mediaType = 'document';
                mediaInfo = deletedMessage.message.documentMessage;
            }

            if (!mediaType || !mediaInfo) return null;

            try {
                const mediaStream = await downloadMediaMessage(deletedMessage, { logger });
                
                let ext;
                switch (mediaType) {
                    case 'image': ext = 'jpg'; break;
                    case 'video': ext = 'mp4'; break;
                    case 'audio': ext = 'ogg'; break;
                    case 'sticker': ext = 'webp'; break;
                    case 'document': 
                        ext = mediaInfo.fileName?.split('.').pop() || 'bin';
                        break;
                    default: ext = 'bin';
                }
                
                const tempPath = path.join(__dirname, `temp_media_${Date.now()}.${ext}`);
                const writeStream = fs.createWriteStream(tempPath);
                
                await pipeline(mediaStream, writeStream);
                
                return {
                    path: tempPath,
                    type: mediaType,
                    caption: mediaInfo.caption || '',
                    mimetype: mediaInfo.mimetype,
                    fileName: mediaInfo.fileName,
                    ptt: mediaInfo.ptt
                };
            } catch (mediaError) {
                logger.error(`Failed to process ${mediaType}:`, mediaError);
                return null;
            }
        };

        // Function to send messages with error handling
        const sendMessage = async (jid, content) => {
            try {
                await adams.sendMessage(jid, content);
                return true;
            } catch (sendError) {
                logger.error('Failed to send message:', sendError);
                return false;
            }
        };

        adams.ev.on("messages.upsert", async ({ messages }) => {
            try {
                const ms = messages[0];
                if (!ms?.message) return;

                const messageKey = ms.key;
                if (!messageKey?.remoteJid) return;

                const remoteJid = messageKey.remoteJid;
                const senderJid = messageKey.participant || messageKey.remoteJid;

                // Skip status updates, messages from self, and messages from owner
                if (remoteJid === "status@broadcast" || 
                    senderJid === botJid || 
                    senderJid === botOwnerJid || 
                    messageKey.fromMe) {
                    return;
                }

                // Store the message for potential deletion tracking
                if (!store.chats[remoteJid]) {
                    store.chats[remoteJid] = [];
                }
                store.chats[remoteJid].push(ms);

                // Check if this is a deletion notification
                if (ms.message?.protocolMessage?.type === 0) {
                    const protocolMsg = ms.message.protocolMessage;
                    if (!protocolMsg?.key?.id) return;

                    const deletedKey = protocolMsg.key;
                    const chatMessages = store.chats[remoteJid] || [];
                    const deletedMessage = chatMessages.find(msg => msg?.key?.id === deletedKey.id);

                    if (!deletedMessage?.message) return;

                    const participant = deletedMessage.key?.participant || deletedMessage.key?.remoteJid;
                    if (!participant) return;

                    // Skip if the deleted message was from bot or owner
                    if (participant === botJid || participant === botOwnerJid) {
                        return;
                    }

                    const context = createContext(participant, {
                        title: "Anti-Delete Protection",
                        body: "Deleted message recovered",
                        thumbnail: "https://files.catbox.moe/sd49da.jpg"
                    });

                    const baseNotification = `♻️ *Anti-Delete Alert* ♻️\n\n` +
                                          `🛑 Message deleted by @${participant.split("@")[0]}\n` +
                                          `💬 In: ${remoteJid.endsWith('@g.us') ? 'Group' : 'Private Chat'}`;

                    try {
                        // Handle text messages
                        if (deletedMessage.message?.conversation || deletedMessage.message?.extendedTextMessage?.text) {
                            const textContent = deletedMessage.message?.conversation || 
                                              deletedMessage.message?.extendedTextMessage?.text;
                            
                            const chatMessage = {
                                text: `${baseNotification}\n\n📝 *Content:* ${textContent}`,
                                mentions: [participant],
                                ...context
                            };

                            // ANTIDELETE1: Send to original chat
                            if (config.ANTIDELETE1 === "yes") {
                                await sendMessage(remoteJid, chatMessage);
                            }

                            // ANTIDELETE2: Send to bot owner with additional context
                            if (config.ANTIDELETE2 === "yes") {
                                const ownerMessage = {
                                    text: `${baseNotification}\n\n📝 *Content:* ${textContent}\n\n💬 *Chat:* ${remoteJid}`,
                                    ...context
                                };
                                await sendMessage(botOwnerJid, ownerMessage);
                            }
                        } 
                        // Handle media messages
                        else {
                            const mediaData = await processMediaMessage(deletedMessage, participant);
                            if (mediaData) {
                                const mediaNotification = `${baseNotification}\n${mediaData.caption ? `\n📝 *Caption:* ${mediaData.caption}` : ''}`;

                                // ANTIDELETE1: Send to original chat
                                if (config.ANTIDELETE1 === "yes") {
                                    const chatMedia = {
                                        [mediaData.type]: { url: mediaData.path },
                                        ...(mediaData.type !== 'audio' && mediaData.type !== 'sticker' ? { 
                                            caption: mediaNotification
                                        } : {}),
                                        mentions: [participant],
                                        ...context,
                                        ...(mediaData.type === 'document' ? {
                                            mimetype: mediaData.mimetype,
                                            fileName: mediaData.fileName
                                        } : {}),
                                        ...(mediaData.type === 'audio' ? {
                                            ptt: mediaData.ptt,
                                            mimetype: 'audio/ogg; codecs=opus'
                                        } : {})
                                    };
                                    await sendMessage(remoteJid, chatMedia);
                                }

                                // ANTIDELETE2: Send to bot owner
                                if (config.ANTIDELETE2 === "yes") {
                                    const ownerMedia = {
                                        [mediaData.type]: { url: mediaData.path },
                                        caption: `${baseNotification}\n\n💬 *Chat:* ${remoteJid}${mediaData.caption ? `\n\n📝 *Caption:* ${mediaData.caption}` : ''}`,
                                        ...context,
                                        ...(mediaData.type === 'document' ? {
                                            mimetype: mediaData.mimetype,
                                            fileName: mediaData.fileName
                                        } : {}),
                                        ...(mediaData.type === 'audio' ? {
                                            ptt: mediaData.ptt,
                                            mimetype: 'audio/ogg; codecs=opus'
                                        } : {})
                                    };
                                    await sendMessage(botOwnerJid, ownerMedia);
                                }

                                // Clean up temp file
                                setTimeout(() => {
                                    if (fs.existsSync(mediaData.path)) {
                                        fs.unlink(mediaData.path, (err) => {
                                            if (err) logger.error('Error deleting temp file:', err);
                                        });
                                    }
                                }, 30000);
                            }
                        }
                    } catch (error) {
                        logger.error('Error handling deleted message:', error);
                        if (config.ANTIDELETE2 === "yes") {
                            await sendMessage(botOwnerJid, {
                                text: `⚠️ A message was deleted in ${remoteJid} but couldn't be recovered\n\nError: ${error.message}`,
                                ...context
                            });
                        }
                    }
                }
            } catch (outerError) {
                logger.error('Outer error in message processing:', outerError);
            }
        });
    }
};

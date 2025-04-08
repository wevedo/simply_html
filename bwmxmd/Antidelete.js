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

        // Function to process and send media messages
        const processMediaMessage = async (deletedMessage, participant, notification, remoteJid) => {
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
                
                const caption = mediaInfo.caption || '';
                const messageContent = {
                    [mediaType]: { url: tempPath },
                    ...(mediaType !== 'audio' && mediaType !== 'sticker' ? { 
                        caption: `${notification}\n${caption}`.trim() 
                    } : {}),
                    mentions: [participant],
                    ...createContext(participant, {
                        title: "Anti-Delete Protection",
                        body: "Deleted media recovered",
                        thumbnail: "https://files.catbox.moe/sd49da.jpg"
                    }),
                    ...(mediaType === 'document' ? {
                        mimetype: mediaInfo.mimetype,
                        fileName: mediaInfo.fileName || `file.${ext}`
                    } : {}),
                    ...(mediaType === 'audio' ? {
                        ptt: mediaInfo.ptt,
                        mimetype: 'audio/ogg; codecs=opus'
                    } : {})
                };
                
                // Clean up the temp file after sending
                setTimeout(() => {
                    if (fs.existsSync(tempPath)) {
                        fs.unlink(tempPath, (err) => {
                            if (err) logger.error('Error deleting temp file:', err);
                        });
                    }
                }, 30000); // 30 seconds delay for cleanup
                
                return messageContent;
                
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
                logger.error('Failed to send message to', jid, ':', sendError);
                return false;
            }
        };

        // Function to notify owner about deleted message
        const notifyOwner = async (deletedMessage, participant, remoteJid) => {
            try {
                const isGroup = remoteJid.endsWith('@g.us');
                const notification = `♻️ *Anti-Delete Alert* ♻️\n\n` +
                                   `🛑 Message deleted by @${participant.split("@")[0]}\n` +
                                   `💬 In: ${isGroup ? 'Group' : 'Private Chat'}\n` +
                                   `📌 Chat: ${remoteJid}`;

                let ownerContent;
                
                // Handle text messages
                if (deletedMessage.message?.conversation) {
                    ownerContent = { 
                        text: `${notification}\n\n📝 *Content:* ${deletedMessage.message.conversation}`,
                        ...createContext(participant, {
                            title: "Anti-Delete Protection",
                            body: "Deleted message recovered",
                            thumbnail: "https://files.catbox.moe/sd49da.jpg"
                        })
                    };
                } 
                else if (deletedMessage.message?.extendedTextMessage?.text) {
                    ownerContent = { 
                        text: `${notification}\n\n📝 *Content:* ${deletedMessage.message.extendedTextMessage.text}`,
                        ...createContext(participant, {
                            title: "Anti-Delete Protection",
                            body: "Deleted message recovered",
                            thumbnail: "https://files.catbox.moe/sd49da.jpg"
                        })
                    };
                } 
                else {
                    // Handle media messages
                    const mediaContent = await processMediaMessage(deletedMessage, participant, notification, remoteJid);
                    if (mediaContent) {
                        ownerContent = {
                            ...mediaContent,
                            text: notification,
                            mentions: undefined // Remove mentions for owner
                        };
                    } else {
                        ownerContent = {
                            text: `${notification}\n\n⚠️ Could not recover media content`,
                            ...createContext(participant, {
                                title: "Anti-Delete Protection",
                                body: "Deleted media detected but not recovered",
                                thumbnail: "https://files.catbox.moe/sd49da.jpg"
                            })
                        };
                    }
                }

                // Send to bot owner
                await sendMessage(botOwnerJid, ownerContent);
                
            } catch (error) {
                logger.error('Error notifying owner:', error);
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

                    const notification = `♻️ *Anti-Delete Alert* ♻️\n\n` +
                                     `🛑 Message deleted by @${participant.split("@")[0]}`;

                    const context = createContext(participant, {
                        title: "Anti-Delete Protection",
                        body: "Deleted message recovered",
                        thumbnail: "https://files.catbox.moe/sd49da.jpg"
                    });

                    try {
                        // ANTIDELETE1: Always send to owner (regardless of config)
                        await notifyOwner(deletedMessage, participant, remoteJid);

                        // ANTIDELETE2: Send to original chat if enabled
                        if (config.ANTIDELETE2 === "yes") {
                            let messageContent;
                            
                            // Handle text messages
                            if (deletedMessage.message?.conversation) {
                                messageContent = { 
                                    text: `${notification}\n\n📝 *Content:* ${deletedMessage.message.conversation}`,
                                    mentions: [participant],
                                    ...context
                                };
                            } 
                            else if (deletedMessage.message?.extendedTextMessage?.text) {
                                messageContent = { 
                                    text: `${notification}\n\n📝 *Content:* ${deletedMessage.message.extendedTextMessage.text}`,
                                    mentions: [participant],
                                    ...context
                                };
                            } 
                            else {
                                // Handle media messages
                                const mediaContent = await processMediaMessage(deletedMessage, participant, notification, remoteJid);
                                if (mediaContent) {
                                    messageContent = mediaContent;
                                } else {
                                    messageContent = {
                                        text: `${notification}\n\n⚠️ Could not recover media content`,
                                        mentions: [participant],
                                        ...context
                                    };
                                }
                            }

                            await sendMessage(remoteJid, messageContent);
                        }

                    } catch (error) {
                        logger.error('Error handling deleted message:', error);
                        const fallbackContent = {
                            text: `⚠️ A message was deleted but couldn't be recovered\n\n💬 Chat: ${remoteJid}`,
                            ...context
                        };
                        await sendMessage(botOwnerJid, fallbackContent);
                    }
                }
            } catch (outerError) {
                logger.error('Outer error in message processing:', outerError);
            }
        });
    }
};

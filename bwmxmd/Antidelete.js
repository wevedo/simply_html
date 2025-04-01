const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) {
            console.error('❌ Anti-Delete: Missing adams or config');
            return;
        }

        console.log('Initializing Anti-Delete System...');

        let store = { chats: {} };

        adams.ev.on("messages.upsert", async (m) => {
            try {
                console.log('📩 New message upsert event received');
                const { messages } = m;
                const ms = messages[0];
                
                if (!ms.message) {
                    console.log('⚠️ No message content found, skipping');
                    return;
                }

                const messageKey = ms.key;
                const remoteJid = messageKey.remoteJid;
                console.log(`💬 Message in: ${remoteJid}`);

                if (remoteJid === "status@broadcast") {
                    console.log('⏭️ Status update, skipping');
                    return;
                }

                if (!store.chats[remoteJid]) {
                    console.log(`➕ New chat added to store: ${remoteJid}`);
                    store.chats[remoteJid] = [];
                }

                store.chats[remoteJid].push(ms);
                console.log(`📥 Stored message (Total in chat: ${store.chats[remoteJid].length})`);

                if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0) {
                    console.log('🔍 Detected protocol message (possible delete)');
                    const deletedKey = ms.message.protocolMessage.key;
                    console.log(`🗑️ Delete target ID: ${deletedKey.id}`);

                    const chatMessages = store.chats[remoteJid];
                    const deletedMessage = chatMessages.find(msg => msg.key.id === deletedKey.id);

                    if (deletedMessage) {
                        console.log('✅ Found deleted message in store');
                        try {
                            const participant = deletedMessage.key.participant || deletedMessage.key.remoteJid;
                            console.log(`👤 Deleted by: ${participant}`);
                            const notification = `*🛑 This message was deleted by @${participant.split("@")[0]}*`;
                            const botOwnerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`;

                            const sendMessage = async (jid, content) => {
                                console.log(`✉️ Attempting to send to ${jid}`);
                                try {
                                    await adams.sendMessage(jid, content);
                                    console.log('✅ Message sent successfully');
                                } catch (sendError) {
                                    console.error('❌ Failed to send message:', sendError);
                                    throw sendError;
                                }
                            };

                            let messageContent = { text: notification, mentions: [participant] };

                            // Text message handling
                            if (deletedMessage.message.conversation) {
                                console.log('📝 Handling text message');
                                messageContent.text += `\nDeleted message: ${deletedMessage.message.conversation}`;
                            } 
                            // Extended text (links, etc)
                            else if (deletedMessage.message.extendedTextMessage) {
                                console.log('📝 Handling extended text message');
                                messageContent.text += `\nDeleted message: ${deletedMessage.message.extendedTextMessage.text}`;
                            } 
                            // Image handling
                            else if (deletedMessage.message.imageMessage) {
                                console.log('🖼️ Handling image message');
                                try {
                                    const media = await downloadMediaMessage(deletedMessage, { logger });
                                    console.log('📥 Downloaded image media');
                                    const tempPath = path.join(__dirname, 'temp_img.jpg');
                                    fs.writeFileSync(tempPath, media);
                                    console.log('💾 Saved image to temp file');
                                    const caption = deletedMessage.message.imageMessage.caption || '';
                                    messageContent = {
                                        image: { url: tempPath },
                                        caption: `${notification}\n${caption}`.trim(),
                                        mentions: [participant]
                                    };
                                    console.log('🖼️ Prepared image message content');
                                } catch (mediaError) {
                                    console.error('❌ Failed to process image:', mediaError);
                                    throw mediaError;
                                }
                            }
                            // Video handling
                            else if (deletedMessage.message.videoMessage) {
                                console.log('🎥 Handling video message');
                                try {
                                    const media = await downloadMediaMessage(deletedMessage, { logger });
                                    console.log('📥 Downloaded video media');
                                    const tempPath = path.join(__dirname, 'temp_vid.mp4');
                                    fs.writeFileSync(tempPath, media);
                                    console.log('💾 Saved video to temp file');
                                    const caption = deletedMessage.message.videoMessage.caption || '';
                                    messageContent = {
                                        video: { url: tempPath },
                                        caption: `${notification}\n${caption}`.trim(),
                                        mentions: [participant]
                                    };
                                    console.log('🎬 Prepared video message content');
                                } catch (mediaError) {
                                    console.error('❌ Failed to process video:', mediaError);
                                    throw mediaError;
                                }
                            }
                            // Audio handling
                            else if (deletedMessage.message.audioMessage) {
                                console.log('🔊 Handling audio message');
                                try {
                                    const media = await downloadMediaMessage(deletedMessage, { logger });
                                    console.log('📥 Downloaded audio media');
                                    const tempPath = path.join(__dirname, 'temp_audio.ogg');
                                    fs.writeFileSync(tempPath, media);
                                    console.log('💾 Saved audio to temp file');
                                    messageContent = {
                                        audio: { url: tempPath },
                                        mimetype: 'audio/ogg; codecs=opus',
                                        ptt: deletedMessage.message.audioMessage.ptt,
                                        caption: notification,
                                        mentions: [participant]
                                    };
                                    console.log('🎧 Prepared audio message content');
                                } catch (mediaError) {
                                    console.error('❌ Failed to process audio:', mediaError);
                                    throw mediaError;
                                }
                            }
                            // Sticker handling
                            else if (deletedMessage.message.stickerMessage) {
                                console.log('🏷️ Handling sticker message');
                                try {
                                    const media = await downloadMediaMessage(deletedMessage, { logger });
                                    console.log('📥 Downloaded sticker media');
                                    const tempPath = path.join(__dirname, 'temp_sticker.webp');
                                    fs.writeFileSync(tempPath, media);
                                    console.log('💾 Saved sticker to temp file');
                                    messageContent = {
                                        sticker: { url: tempPath },
                                        mentions: [participant]
                                    };
                                    console.log('🖼️ Prepared sticker message content');
                                } catch (mediaError) {
                                    console.error('❌ Failed to process sticker:', mediaError);
                                    throw mediaError;
                                }
                            }
                            // Document handling
                            else if (deletedMessage.message.documentMessage) {
                                console.log('📄 Handling document message');
                                try {
                                    const media = await downloadMediaMessage(deletedMessage, { logger });
                                    console.log('📥 Downloaded document media');
                                    const ext = deletedMessage.message.documentMessage.mimetype.split('/')[1] || 'bin';
                                    const tempPath = path.join(__dirname, `temp_doc.${ext}`);
                                    fs.writeFileSync(tempPath, media);
                                    console.log('💾 Saved document to temp file');
                                    const filename = deletedMessage.message.documentMessage.fileName || 'document';
                                    messageContent = {
                                        document: { url: tempPath },
                                        fileName: filename,
                                        mimetype: deletedMessage.message.documentMessage.mimetype,
                                        caption: notification,
                                        mentions: [participant]
                                    };
                                    console.log('📋 Prepared document message content');
                                } catch (mediaError) {
                                    console.error('❌ Failed to process document:', mediaError);
                                    throw mediaError;
                                }
                            } else {
                                console.log('⚠️ Unsupported message type:', Object.keys(deletedMessage.message)[0]);
                            }

                            // Send notifications
                            if (config.ANTIDELETE1 === "yes") {
                                console.log('👑 Sending to owner');
                                await sendMessage(botOwnerJid, messageContent);
                            }

                            if (config.ANTIDELETE2 === "yes") {
                                console.log('💬 Sending to chat');
                                await sendMessage(remoteJid, messageContent);
                            }

                            // Clean up temp files
                            if (messageContent.image || messageContent.video || messageContent.audio || messageContent.sticker || messageContent.document) {
                                console.log('🧹 Cleaning up temp files');
                                const tempPath = messageContent.image?.url || 
                                                messageContent.video?.url || 
                                                messageContent.audio?.url || 
                                                messageContent.sticker?.url || 
                                                messageContent.document?.url;
                                if (tempPath && fs.existsSync(tempPath)) {
                                    fs.unlinkSync(tempPath);
                                    console.log('🗑️ Temp file deleted');
                                }
                            }

                        } catch (error) {
                            console.error('❌ Error handling deleted message:', error);
                            try {
                                const fallbackContent = {
                                    text: `*🛑 A message was deleted but couldn't be recovered*\nError: ${error.message}`,
                                    mentions: [participant]
                                };
                                if (config.ANTIDELETE1 === "yes") {
                                    await adams.sendMessage(botOwnerJid, fallbackContent);
                                }
                                if (config.ANTIDELETE2 === "yes") {
                                    await adams.sendMessage(remoteJid, fallbackContent);
                                }
                            } catch (err) {
                                console.error('❌ Fallback message failed:', err);
                            }
                        }
                    } else {
                        console.log('⚠️ Deleted message not found in store');
                    }
                }
            } catch (outerError) {
                console.error('❌ Outer error in message processing:', outerError);
            }
        });

        console.log('✅ Anti-Delete System operational');
    }
};

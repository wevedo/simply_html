const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const util = require('util');
const pipeline = util.promisify(stream.pipeline);

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

                        try {
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
                            // Media handling
                            else if (deletedMessage.message.imageMessage || 
                                    deletedMessage.message.videoMessage || 
                                    deletedMessage.message.audioMessage || 
                                    deletedMessage.message.stickerMessage || 
                                    deletedMessage.message.documentMessage) {
                                
                                console.log('🖼️ Handling media message');
                                try {
                                    const mediaStream = await downloadMediaMessage(deletedMessage, { logger });
                                    
                                    // Determine file extension and path
                                    let ext, type;
                                    if (deletedMessage.message.imageMessage) {
                                        ext = 'jpg';
                                        type = 'image';
                                    } else if (deletedMessage.message.videoMessage) {
                                        ext = 'mp4';
                                        type = 'video';
                                    } else if (deletedMessage.message.audioMessage) {
                                        ext = 'ogg';
                                        type = 'audio';
                                    } else if (deletedMessage.message.stickerMessage) {
                                        ext = 'webp';
                                        type = 'sticker';
                                    } else if (deletedMessage.message.documentMessage) {
                                        ext = deletedMessage.message.documentMessage.fileName.split('.').pop() || 'bin';
                                        type = 'document';
                                    }
                                    
                                    const tempPath = path.join(__dirname, `temp_media.${ext}`);
                                    const writeStream = fs.createWriteStream(tempPath);
                                    
                                    console.log(`📥 Downloading ${type} to ${tempPath}`);
                                    await pipeline(mediaStream, writeStream);
                                    console.log('💾 Media saved successfully');
                                    
                                    // Prepare message content
                                    const caption = deletedMessage.message.imageMessage?.caption || 
                                                  deletedMessage.message.videoMessage?.caption || '';
                                    
                                    messageContent = {
                                        [type]: { url: tempPath },
                                        caption: type !== 'audio' ? `${notification}\n${caption}`.trim() : notification,
                                        mentions: [participant],
                                        mimetype: deletedMessage.message.documentMessage?.mimetype,
                                        fileName: deletedMessage.message.documentMessage?.fileName
                                    };
                                    
                                    console.log(`🖼️ Prepared ${type} message content`);
                                    
                                    // Send notifications
                                    if (config.ANTIDELETE1 === "yes") {
                                        console.log('👑 Sending to owner');
                                        await sendMessage(botOwnerJid, messageContent);
                                    }

                                    if (config.ANTIDELETE2 === "yes") {
                                        console.log('💬 Sending to chat');
                                        await sendMessage(remoteJid, messageContent);
                                    }
                                    
                                    // Clean up
                                    console.log('🧹 Cleaning up temp file');
                                    fs.unlinkSync(tempPath);
                                    console.log('🗑️ Temp file deleted');
                                    return;
                                    
                                } catch (mediaError) {
                                    console.error('❌ Failed to process media:', mediaError);
                                    throw mediaError;
                                }
                            } else {
                                console.log('⚠️ Unsupported message type:', Object.keys(deletedMessage.message)[0]);
                            }

                            // Send notifications for non-media messages
                            if (config.ANTIDELETE1 === "yes") {
                                console.log('👑 Sending to owner');
                                await sendMessage(botOwnerJid, messageContent);
                            }

                            if (config.ANTIDELETE2 === "yes") {
                                console.log('💬 Sending to chat');
                                await sendMessage(remoteJid, messageContent);
                            }

                        } catch (error) {
                            console.error('❌ Error handling deleted message:', error);
                            try {
                                const fallbackContent = {
                                    text: `*🛑 A message was deleted but couldn't be recovered*\nError: ${error.message}`,
                                    mentions: [participant] // Now properly in scope
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

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
                
                if (!ms?.message) {
                    console.log('⚠️ No message content found, skipping');
                    return;
                }

                const messageKey = ms.key;
                if (!messageKey?.remoteJid) {
                    console.log('⚠️ No remoteJid found, skipping');
                    return;
                }

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

                if (ms.message?.protocolMessage?.type === 0) {
                    console.log('🔍 Detected protocol message (possible delete)');
                    const protocolMsg = ms.message.protocolMessage;
                    
                    if (!protocolMsg?.key?.id) {
                        console.log('⚠️ No key.id in protocol message, skipping');
                        return;
                    }

                    const deletedKey = protocolMsg.key;
                    console.log(`🗑️ Delete target ID: ${deletedKey.id}`);

                    const chatMessages = store.chats[remoteJid] || [];
                    const deletedMessage = chatMessages.find(msg => msg?.key?.id === deletedKey.id);

                    if (!deletedMessage?.message) {
                        console.log('⚠️ Deleted message not found in store or has no content');
                        return;
                    }

                    console.log('✅ Found deleted message in store');
                    const participant = deletedMessage.key?.participant || deletedMessage.key?.remoteJid;
                    if (!participant) {
                        console.log('⚠️ Could not identify participant');
                        return;
                    }

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
                        if (deletedMessage.message?.conversation) {
                            console.log('📝 Handling text message');
                            messageContent.text += `\nDeleted message: ${deletedMessage.message.conversation}`;
                        } 
                        // Extended text (links, etc)
                        else if (deletedMessage.message?.extendedTextMessage?.text) {
                            console.log('📝 Handling extended text message');
                            messageContent.text += `\nDeleted message: ${deletedMessage.message.extendedTextMessage.text}`;
                        } 
                        // Media handling
                        else {
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

                            if (mediaType && mediaInfo) {
                                console.log(`🖼️ Handling ${mediaType} message`);
                                try {
                                    const mediaStream = await downloadMediaMessage(deletedMessage, { logger });
                                    
                                    // Determine file extension
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
                                    
                                    const tempPath = path.join(__dirname, `temp_media.${ext}`);
                                    const writeStream = fs.createWriteStream(tempPath);
                                    
                                    console.log(`📥 Downloading ${mediaType} to ${tempPath}`);
                                    await pipeline(mediaStream, writeStream);
                                    console.log('💾 Media saved successfully');
                                    
                                    // Prepare message content
                                    const caption = mediaInfo.caption || '';
                                    messageContent = {
                                        [mediaType]: { url: tempPath },
                                        ...(mediaType !== 'audio' && mediaType !== 'sticker' ? { 
                                            caption: `${notification}\n${caption}`.trim() 
                                        } : {}),
                                        mentions: [participant],
                                        ...(mediaType === 'document' ? {
                                            mimetype: mediaInfo.mimetype,
                                            fileName: mediaInfo.fileName
                                        } : {}),
                                        ...(mediaType === 'audio' ? {
                                            ptt: mediaInfo.ptt,
                                            mimetype: 'audio/ogg; codecs=opus'
                                        } : {})
                                    };
                                    
                                    console.log(`🖼️ Prepared ${mediaType} message content`);
                                    
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
                                    console.error(`❌ Failed to process ${mediaType}:`, mediaError);
                                    throw new Error(`Failed to process ${mediaType}: ${mediaError.message}`);
                                }
                            } else {
                                console.log('⚠️ Unsupported message type:', Object.keys(deletedMessage.message)[0]);
                                throw new Error('Unsupported message type');
                            }
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
                                text: `*🛑 A message was deleted but couldn't be recovered*\n${error.message}`,
                                mentions: participant ? [participant] : []
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
                }
            } catch (outerError) {
                console.error('❌ Outer error in message processing:', outerError);
            }
        });

        console.log('✅ Anti-Delete System operational');
    }
};

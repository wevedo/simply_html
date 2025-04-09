const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { createContext } = require('../Ibrahim/helper');
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

        // Improved media processing function
        const processMediaMessage = async (deletedMessage) => {
            let mediaType, mediaInfo;
            
            const mediaTypes = {
                imageMessage: 'image',
                videoMessage: 'video',
                audioMessage: 'audio',
                stickerMessage: 'sticker',
                documentMessage: 'document'
            };

            for (const [key, type] of Object.entries(mediaTypes)) {
                if (deletedMessage.message?.[key]) {
                    mediaType = type;
                    mediaInfo = deletedMessage.message[key];
                    break;
                }
            }

            if (!mediaType || !mediaInfo) return null;

            try {
                const mediaStream = await downloadMediaMessage(deletedMessage, { logger });
                
                const extensions = {
                    image: 'jpg',
                    video: 'mp4',
                    audio: mediaInfo.mimetype?.includes('mpeg') ? 'mp3' : 'ogg',
                    sticker: 'webp',
                    document: mediaInfo.fileName?.split('.').pop() || 'bin'
                };
                
                const tempPath = path.join(__dirname, `temp_media_${Date.now()}.${extensions[mediaType]}`);
                await pipeline(mediaStream, fs.createWriteStream(tempPath));
                
                return {
                    path: tempPath,
                    type: mediaType,
                    caption: mediaInfo.caption || '',
                    mimetype: mediaInfo.mimetype,
                    fileName: mediaInfo.fileName || `${mediaType}_${Date.now()}.${extensions[mediaType]}`,
                    ptt: mediaInfo.ptt
                };
            } catch (error) {
                logger.error(`Media processing failed:`, error);
                return null;
            }
        };

        // Enhanced message sending function with retry logic
        const sendTo = async (jid, content) => {
            const maxRetries = 3;
            let attempts = 0;
            
            while (attempts < maxRetries) {
                try {
                    await adams.sendMessage(jid, content);
                    return true;
                } catch (error) {
                    attempts++;
                    if (attempts === maxRetries) {
                        logger.error(`Failed to send to ${jid} after ${maxRetries} attempts:`, error);
                        return false;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
                }
            }
        };

        adams.ev.on("messages.upsert", async ({ messages }) => {
            try {
                const ms = messages[0];
                if (!ms?.message) return;

                const { key } = ms;
                if (!key?.remoteJid) return;

                const sender = key.participant || key.remoteJid;
                if (sender === botJid || sender === botOwnerJid || key.fromMe) return;

                // Store message
                if (!store.chats[key.remoteJid]) store.chats[key.remoteJid] = [];
                store.chats[key.remoteJid].push(ms);

                // Check for deletion
                if (ms.message?.protocolMessage?.type === 0) {
                    const deletedId = ms.message.protocolMessage.key.id;
                    const deletedMsg = store.chats[key.remoteJid].find(m => m.key.id === deletedId);
                    if (!deletedMsg?.message) return;

                    const deleter = deletedMsg.key.participant || deletedMsg.key.remoteJid;
                    if (deleter === botJid || deleter === botOwnerJid) return;

                    const context = createContext(deleter, {
                        title: "Anti-Delete Protection",
                        body: "Deleted message recovered",
                        thumbnail: "https://files.catbox.moe/sd49da.jpg"
                    });

                    const baseAlert = `♻️ *Anti-Delete Alert* ♻️\n\n` +
                                    `🛑 Deleted by @${deleter.split('@')[0]}\n` +
                                    `💬 In: ${key.remoteJid.includes('@g.us') ? 'Group' : 'DM'}`;

                    try {
                        // Text message handling
                        if (deletedMsg.message.conversation || deletedMsg.message.extendedTextMessage?.text) {
                            const text = deletedMsg.message.conversation || 
                                       deletedMsg.message.extendedTextMessage.text;
                            
                            const messageContent = {
                                text: `${baseAlert}\n\n📝 *Content:* ${text}`,
                                mentions: [deleter],
                                ...context
                            };

                            // Send to original chat if enabled
                            if (config.ANTIDELETE1 === "yes") {
                                await sendTo(key.remoteJid, messageContent);
                            }

                            // Send to owner if enabled
                            if (config.ANTIDELETE2 === "yes") {
                                const ownerContent = {
                                    text: `${baseAlert}\n\n📝 *Content:* ${text}\n\n👤 *Sender:* ${deleter}`,
                                    ...context
                                };
                                await sendTo(botOwnerJid, ownerContent);
                            }
                        } 
                        // Media message handling
                        else {
                            const media = await processMediaMessage(deletedMsg);
                            if (media) {
                                const mediaAlert = `${baseAlert}${media.caption ? `\n\n📝 *Caption:* ${media.caption}` : ''}`;

                                // Prepare media message for original chat
                                if (config.ANTIDELETE1 === "yes") {
                                    const chatMediaMessage = {
                                        [media.type]: { url: media.path },
                                        ...(media.type !== 'audio' && media.type !== 'sticker' ? { 
                                            caption: mediaAlert,
                                            mentions: [deleter]
                                        } : {}),
                                        ...context,
                                        ...(media.type === 'document' ? {
                                            mimetype: media.mimetype,
                                            fileName: media.fileName
                                        } : {}),
                                        ...(media.type === 'audio' ? {
                                            ptt: media.ptt,
                                            mimetype: media.mimetype
                                        } : {})
                                    };
                                    await sendTo(key.remoteJid, chatMediaMessage);
                                }

                                // Prepare media message for owner
                                if (config.ANTIDELETE2 === "yes") {
                                    const ownerMediaMessage = {
                                        [media.type]: { url: media.path },
                                        caption: `${baseAlert}\n\n👤 *Sender:* ${deleter}${media.caption ? `\n\n📝 *Caption:* ${media.caption}` : ''}`,
                                        ...context,
                                        ...(media.type === 'document' ? {
                                            mimetype: media.mimetype,
                                            fileName: media.fileName
                                        } : {}),
                                        ...(media.type === 'audio' ? {
                                            ptt: media.ptt,
                                            mimetype: media.mimetype
                                        } : {})
                                    };
                                    await sendTo(botOwnerJid, ownerMediaMessage);
                                }

                                // Cleanup temp file
                                setTimeout(() => {
                                    if (fs.existsSync(media.path)) {
                                        fs.unlink(media.path, (err) => {
                                            if (err) logger.error('Cleanup failed:', err);
                                        });
                                    }
                                }, 30000);
                            }
                        }
                    } catch (error) {
                        logger.error('Anti-delete failed:', error);
                        if (config.ANTIDELETE2 === "yes") {
                            await sendTo(botOwnerJid, {
                                text: `⚠️ Failed to recover deleted message in ${key.remoteJid}\n\nError: ${error.message}`,
                                ...context
                            });
                        }
                    }
                }
            } catch (error) {
                logger.error('Anti-delete system error:', error);
            }
        });
    }
};

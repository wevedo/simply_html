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

        const botJid = adams.user?.id ? `${adams.user.id.split(':')[0]}@s.whatsapp.net` : null;
        const botOwnerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`;
        let store = { chats: {} };

        // Simplified media processor for owner only
        const getMediaForOwner = async (msg) => {
            try {
                const stream = await downloadMediaMessage(msg, { logger });
                let type, ext;
                
                if (msg.message?.imageMessage) {
                    type = 'image';
                    ext = 'jpg';
                } else if (msg.message?.videoMessage) {
                    type = 'video';
                    ext = 'mp4';
                } else if (msg.message?.audioMessage) {
                    type = 'audio';
                    ext = 'ogg';
                } else if (msg.message?.stickerMessage) {
                    type = 'sticker';
                    ext = 'webp';
                } else if (msg.message?.documentMessage) {
                    type = 'document';
                    ext = msg.message.documentMessage.fileName?.split('.').pop() || 'bin';
                } else {
                    return null;
                }

                const tempPath = path.join(__dirname, `owner_media_${Date.now()}.${ext}`);
                await pipeline(stream, fs.createWriteStream(tempPath));
                return { path: tempPath, type };
            } catch (error) {
                logger.error('Media download for owner failed:', error);
                return null;
            }
        };

        // Dedicated function to send to owner
        const alertOwner = async (content) => {
            try {
                await adams.sendMessage(botOwnerJid, content);
                return true;
            } catch (error) {
                logger.error('Failed to alert owner:', error);
                return false;
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

                // Store message (for deletion detection only)
                if (!store.chats[key.remoteJid]) store.chats[key.remoteJid] = [];
                store.chats[key.remoteJid].push(ms);

                // Check for deletion
                if (ms.message?.protocolMessage?.type === 0) {
                    const deletedId = ms.message.protocolMessage.key.id;
                    const deletedMsg = store.chats[key.remoteJid].find(m => m.key.id === deletedId);
                    if (!deletedMsg?.message) return;

                    const deleter = deletedMsg.key.participant || deletedMsg.key.remoteJid;
                    if (deleter === botJid || deleter === botOwnerJid) return;

                    // Prepare base alert for owner
                    const baseAlert = `⚠️ *DELETED MESSAGE ALERT* ⚠️\n\n` +
                                    `🗑️ Deleted by: @${deleter.split('@')[0]}\n` +
                                    `💬 In chat: ${key.remoteJid}\n` +
                                    `⏰ At: ${new Date().toLocaleString()}`;

                    try {
                        // Handle text messages for owner
                        if (deletedMsg.message.conversation || deletedMsg.message.extendedTextMessage?.text) {
                            const text = deletedMsg.message.conversation || 
                                       deletedMsg.message.extendedTextMessage.text;
                            
                            await alertOwner({
                                text: `${baseAlert}\n\n📄 Content:\n${text}`,
                                ...createContext(deleter, {
                                    title: "Deleted Message Detected",
                                    body: "A message was deleted",
                                    thumbnail: "https://files.catbox.moe/sd49da.jpg"
                                })
                            });
                        } 
                        // Handle media messages for owner
                        else {
                            const media = await getMediaForOwner(deletedMsg);
                            if (media) {
                                const caption = deletedMsg.message[`${media.type}Message`]?.caption || '';
                                
                                await alertOwner({
                                    [media.type]: { url: media.path },
                                    caption: `${baseAlert}${caption ? `\n\n✏️ Caption: ${caption}` : ''}`,
                                    ...createContext(deleter, {
                                        title: "Deleted Media Detected",
                                        body: "A media message was deleted",
                                        thumbnail: "https://files.catbox.moe/sd49da.jpg"
                                    })
                                });

                                // Cleanup temp file
                                setTimeout(() => {
                                    if (fs.existsSync(media.path)) {
                                        fs.unlink(media.path, (err) => {
                                            if (err) logger.error('Cleanup failed:', err);
                                        });
                                    }
                                }, 30000);
                            } else {
                                await alertOwner({
                                    text: `${baseAlert}\n\n❌ Could not recover media content`,
                                    ...createContext(deleter, {
                                        title: "Deleted Media Detected",
                                        body: "But couldn't recover it",
                                        thumbnail: "https://files.catbox.moe/sd49da.jpg"
                                    })
                                });
                            }
                        }
                    } catch (error) {
                        logger.error('Owner alert failed:', error);
                        try {
                            await adams.sendMessage(
                                botOwnerJid, 
                                { 
                                    text: `❌ Failed to process deleted message in ${key.remoteJid}\n\nError: ${error.message}` 
                                }
                            );
                        } catch (fallbackError) {
                            logger.error('Fallback alert failed:', fallbackError);
                        }
                    }
                }
            } catch (error) {
                logger.error('Anti-delete system error:', error);
            }
        });
    }
};

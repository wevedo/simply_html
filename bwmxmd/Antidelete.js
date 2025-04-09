const { downloadMediaMessage } = require('@whiskeysockets/baileys');
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

        let store = { chats: {} };

        const processMedia = async (msg) => {
            let type, content;
            if (msg.message?.imageMessage) {
                type = 'image';
                content = msg.message.imageMessage;
            } else if (msg.message?.videoMessage) {
                type = 'video';
                content = msg.message.videoMessage;
            } else if (msg.message?.audioMessage) {
                type = 'audio';
                content = msg.message.audioMessage;
            } else if (msg.message?.stickerMessage) {
                type = 'sticker';
                content = msg.message.stickerMessage;
            } else if (msg.message?.documentMessage) {
                type = 'document';
                content = msg.message.documentMessage;
            }

            if (!type) return null;

            try {
                const stream = await downloadMediaMessage(msg, { logger });
                const ext = type === 'document' ? 
                    (content.fileName?.split('.').pop() || 'bin') :
                    { image: 'jpg', video: 'mp4', audio: 'ogg', sticker: 'webp' }[type];
                
                const filePath = path.join(__dirname, `temp_${Date.now()}.${ext}`);
                await pipeline(stream, fs.createWriteStream(filePath));
                
                return {
                    type,
                    path: filePath,
                    caption: content.caption || '',
                    mimetype: content.mimetype,
                    fileName: content.fileName,
                    ptt: content.ptt
                };
            } catch (error) {
                logger.error('Media download failed:', error);
                return null;
            }
        };

        adams.ev.on("messages.upsert", async ({ messages }) => {
            try {
                const msg = messages[0];
                if (!msg?.message) return;

                const { key } = msg;
                if (!key?.remoteJid) return;

                // Store message
                if (!store.chats[key.remoteJid]) store.chats[key.remoteJid] = [];
                store.chats[key.remoteJid].push(msg);

                // Check for deletion
                if (msg.message?.protocolMessage?.type === 0) {
                    const deletedId = msg.message.protocolMessage.key.id;
                    const deletedMsg = store.chats[key.remoteJid].find(m => m.key.id === deletedId);
                    if (!deletedMsg?.message) return;

                    const deleter = deletedMsg.key.participant || deletedMsg.key.remoteJid;
                    const chatJid = key.remoteJid;

                    const baseAlert = `♻️ *Anti-Delete Alert* ♻️\n\n` +
                                    `🛑 Deleted by: ${deleter}\n` +
                                    `💬 In chat: ${chatJid}`;

                    try {
                        // Text message handling
                        if (deletedMsg.message.conversation || deletedMsg.message.extendedTextMessage?.text) {
                            const text = deletedMsg.message.conversation || 
                                       deletedMsg.message.extendedTextMessage.text;
                            
                            await adams.sendMessage(config.OWNER_NUMBER + "@s.whatsapp.net", {
                                text: `${baseAlert}\n\n📝 Content:\n${text}`
                            });
                        } 
                        // Media message handling
                        else {
                            const media = await processMedia(deletedMsg);
                            if (media) {
                                const mediaAlert = `${baseAlert}${media.caption ? `\n\n📝 Caption: ${media.caption}` : ''}`;

                                await adams.sendMessage(config.OWNER_NUMBER + "@s.whatsapp.net", {
                                    [media.type]: { url: media.path },
                                    caption: mediaAlert,
                                    ...(media.type === 'document' ? {
                                        mimetype: media.mimetype,
                                        fileName: media.fileName
                                    } : {}),
                                    ...(media.type === 'audio' ? {
                                        ptt: media.ptt,
                                        mimetype: 'audio/ogg; codecs=opus'
                                    } : {})
                                });

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
                        logger.error('Failed to send to owner:', error);
                        await adams.sendMessage(config.OWNER_NUMBER + "@s.whatsapp.net", {
                            text: `⚠️ Failed to process deleted message from ${chatJid}\nError: ${error.message}`
                        });
                    }
                }
            } catch (error) {
                logger.error('Anti-delete system error:', error);
            }
        });
    }
};

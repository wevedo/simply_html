const axios = require("axios");

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

                        // ✅ Handle Text Messages
                        if (deletedMessage.message.conversation) {
                            messageContent.text += `\nDeleted message: ${deletedMessage.message.conversation}`;
                        } 

                        // ✅ Handle Media Messages (Images, Videos, Audio, Stickers)
                        const mediaTypes = ["imageMessage", "videoMessage", "audioMessage", "stickerMessage"];
                        for (const mediaType of mediaTypes) {
                            if (deletedMessage.message[mediaType]) {
                                const media = deletedMessage.message[mediaType];
                                const caption = media.caption || '';
                                const mimeType = media.mimetype || '';

                                // Fetch media buffer
                                const mediaBuffer = await adams.downloadMediaMessage(deletedMessage);
                                if (!mediaBuffer) continue;

                                if (mediaType === "audioMessage") {
                                    messageContent = {
                                        audio: mediaBuffer,
                                        mimetype: "audio/mpeg",
                                        ptt: true,
                                        fileName: `recovered_audio.mp3`,
                                        fileLength: media.fileLength || mediaBuffer.length,
                                        waveform: new Uint8Array(100).fill(128),
                                        text: notification,
                                        mentions: [participant]
                                    };
                                } else if (mediaType === "stickerMessage") {
                                    messageContent = {
                                        sticker: mediaBuffer,
                                        mentions: [participant]
                                    };
                                } else {
                                    messageContent = {
                                        caption: `${notification}\n${caption}`,
                                        mentions: [participant],
                                        mimetype: mimeType,
                                        [mediaType.includes("image") ? "image" : "video"]: mediaBuffer
                                    };
                                }
                                break; // Stop loop after finding the first media type
                            }
                        }

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

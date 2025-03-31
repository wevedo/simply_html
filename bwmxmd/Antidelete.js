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
                        const botOwnerJid = `${config.NUMERO_OWNER}@s.whatsapp.net`;

                        const sendMessage = async (jid, content) => {
                            await adams.sendMessage(jid, content);
                        };

                        let messageContent = { text: `${notification}`, mentions: [participant] };

                        if (deletedMessage.message.conversation) {
                            messageContent.text += `\nDeleted message: ${deletedMessage.message.conversation}`;
                        } else if (deletedMessage.message.imageMessage) {
                            const caption = deletedMessage.message.imageMessage.caption || '';
                            const imagePath = await adams.downloadAndSaveMediaMessage(deletedMessage);
                            messageContent = { image: { url: imagePath }, caption: `${notification}\n${caption}`, mentions: [participant] };
                        } else if (deletedMessage.message.videoMessage) {
                            const caption = deletedMessage.message.videoMessage.caption || '';
                            const videoPath = await adams.downloadAndSaveMediaMessage(deletedMessage);
                            messageContent = { video: { url: videoPath }, caption: `${notification}\n${caption}`, mentions: [participant] };
                        } else if (deletedMessage.message.audioMessage) {
                            const audioPath = await adams.downloadAndSaveMediaMessage(deletedMessage);
                            messageContent = { audio: { url: audioPath }, ptt: true, caption: notification, mentions: [participant] };
                        } else if (deletedMessage.message.stickerMessage) {
                            const stickerPath = await adams.downloadAndSaveMediaMessage(deletedMessage);
                            messageContent = { sticker: { url: stickerPath }, caption: notification, mentions: [participant] };
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

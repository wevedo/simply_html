module.exports = {
    setup: async (zk, { config, logger, store }) => {
        if (!zk || !config || !store) return;

        console.log("Initializing Anti-Delete system...");

        zk.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            const ms = messages[0];
            if (!ms.message) return; // Skip empty messages

            const messageKey = ms.key;
            const remoteJid = messageKey.remoteJid;

            // Ignore status updates
            if (remoteJid === "status@broadcast") return;

            // Initialize chat storage if missing
            if (!store.chats[remoteJid]) store.chats[remoteJid] = [];

            // Store received messages
            store.chats[remoteJid].push(ms);

            // Handle deleted messages
            if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0) {
                const deletedKey = ms.message.protocolMessage.key;

                // Search for deleted message
                const chatMessages = store.chats[remoteJid];
                const deletedMessage = chatMessages.find((msg) => msg.key.id === deletedKey.id);

                if (deletedMessage) {
                    try {
                        const participant = deletedMessage.key.participant || deletedMessage.key.remoteJid;
                        const sender = `@${participant.split("@")[0]}`;
                        const notification = `*🛑 This message was deleted by ${sender}*`;

                        const botOwnerJid = `${config.NUMERO_OWNER}@s.whatsapp.net`;

                        const sendMessage = async (jid, content) => {
                            await zk.sendMessage(jid, { ...content, mentions: [participant] });
                        };

                        // Message handling logic
                        let content = {};
                        if (deletedMessage.message.conversation) {
                            content = { text: `${notification}\nDeleted message: ${deletedMessage.message.conversation}` };
                        } else if (deletedMessage.message.imageMessage) {
                            const caption = deletedMessage.message.imageMessage.caption || "";
                            const imagePath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.imageMessage);
                            content = { image: { url: imagePath }, caption: `${notification}\n${caption}` };
                        } else if (deletedMessage.message.videoMessage) {
                            const caption = deletedMessage.message.videoMessage.caption || "";
                            const videoPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.videoMessage);
                            content = { video: { url: videoPath }, caption: `${notification}\n${caption}` };
                        } else if (deletedMessage.message.audioMessage) {
                            const audioPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.audioMessage);
                            content = { audio: { url: audioPath }, ptt: true, caption: notification };
                        } else if (deletedMessage.message.stickerMessage) {
                            const stickerPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.stickerMessage);
                            content = { sticker: { url: stickerPath }, caption: notification };
                        }

                        // Send messages based on settings
                        if (config.ANTIDELETE1 === "yes") {
                            await sendMessage(botOwnerJid, content); // Send to owner's inbox
                        }
                        if (config.ANTIDELETE2 === "yes") {
                            await sendMessage(remoteJid, content); // Recover in chat
                        }
                    } catch (error) {
                        logger.error("Error handling deleted message:", error);
                    }
                }
            }
        });

        console.log("✅ Anti-Delete system activated!");
    }
};

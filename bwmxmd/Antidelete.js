module.exports = {
    setup: async (zk, { conf, store }) => {
        if (!zk || !conf || !store) return;

        console.log("✅ Anti-Delete system activated!");

        zk.ev.on("messages.upsert", async (m) => {
            if (conf.ANTIDELETE1 !== "yes" && conf.ANTIDELETE2 !== "yes") return;

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

                        const botOwnerJid = `${conf.OWNER_NUMBER}@s.whatsapp.net`;

                        const sendMessage = async (jid, content) => {
                            await zk.sendMessage(jid, { ...content, mentions: [participant] });
                        };

                        let content = {};
                        if (deletedMessage.message.conversation) {
                            content = { text: `${notification}\nDeleted message: ${deletedMessage.message.conversation}` };
                        } else if (deletedMessage.message.imageMessage) {
                            const caption = deletedMessage.message.imageMessage.caption || "";
                            const buffer = await zk.downloadMediaMessage(deletedMessage);
                            content = { image: buffer, caption: `${notification}\n${caption}` };
                        } else if (deletedMessage.message.videoMessage) {
                            const caption = deletedMessage.message.videoMessage.caption || "";
                            const buffer = await zk.downloadMediaMessage(deletedMessage);
                            content = { video: buffer, caption: `${notification}\n${caption}` };
                        } else if (deletedMessage.message.audioMessage) {
                            const buffer = await zk.downloadMediaMessage(deletedMessage);
                            content = { audio: buffer, mimetype: "audio/mp4", ptt: true, caption: notification };
                        } else if (deletedMessage.message.stickerMessage) {
                            const buffer = await zk.downloadMediaMessage(deletedMessage);
                            content = { sticker: buffer };
                        }

                        // Send messages based on settings
                        if (conf.ANTIDELETE1 === "yes") {
                            await sendMessage(botOwnerJid, content); // Send to owner's inbox
                        }
                        if (conf.ANTIDELETE2 === "yes") {
                            await sendMessage(remoteJid, content); // Recover in chat
                        }
                    } catch (error) {
                        console.error("❌ Error handling deleted message:", error);
                    }
                }
            }
        });
    }
};

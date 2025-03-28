module.exports = (zk, conf, store, getGroupMetadata) => {
    console.log("✅ Anti-Delete Listener Loaded");

    // Ensure store.chats exists
    if (!store.chats) store.chats = {};

    // Silent Group Updates
    zk.ev.on("groups.update", async (updates) => {
        for (const update of updates) {
            const { id } = update;
            if (!id.endsWith("@g.us")) continue;
            await getGroupMetadata(zk, id);
        }
    });

    // Handle message deletions
    zk.ev.on("messages.upsert", async (m) => {
        if (conf.ANTIDELETE1 !== "yes") return;  // Ensure anti-delete is enabled

        const { messages } = m;
        const ms = messages[0];
        if (!ms || !ms.message) return;

        const messageKey = ms.key;
        const remoteJid = messageKey.remoteJid;
        if (remoteJid === "status@broadcast") return;

        if (!store.chats[remoteJid]) {
            store.chats[remoteJid] = [];
        }

        store.chats[remoteJid].push(ms);

        if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0) {
            const deletedKey = ms.message.protocolMessage.key;
            const chatMessages = store.chats[remoteJid];
            const deletedMessage = chatMessages.find((msg) => msg.key.id === deletedKey.id);

            if (deletedMessage) {
                try {
                    const participant = deletedMessage.key.participant || deletedMessage.key.remoteJid;
                    const notification = `*🛑 This message was deleted by @${participant.split("@")[0]}*`;
                    const botOwnerJid = `${conf.NUMERO_OWNER}@s.whatsapp.net`;

                    let sendOptions = {
                        mentions: [participant],
                    };

                    if (deletedMessage.message.conversation) {
                        sendOptions.text = `${notification}\nDeleted message: ${deletedMessage.message.conversation}`;
                    } else if (deletedMessage.message.imageMessage) {
                        sendOptions.image = await zk.downloadMediaMessage(deletedMessage);
                        sendOptions.caption = notification;
                    } else if (deletedMessage.message.videoMessage) {
                        sendOptions.video = await zk.downloadMediaMessage(deletedMessage);
                        sendOptions.caption = notification;
                    } else if (deletedMessage.message.audioMessage) {
                        sendOptions.audio = await zk.downloadMediaMessage(deletedMessage);
                        sendOptions.ptt = true;
                    } else if (deletedMessage.message.stickerMessage) {
                        sendOptions.sticker = await zk.downloadMediaMessage(deletedMessage);
                    }

                    await zk.sendMessage(botOwnerJid, sendOptions);
                } catch (error) {
                    console.error("Error handling deleted message:", error);
                }
            }
        }
    });
};

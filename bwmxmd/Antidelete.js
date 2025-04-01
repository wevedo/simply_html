const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

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

            if (remoteJid === "status@broadcast") return;

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

                        let messageContent = { text: notification, mentions: [participant] };

                        if (deletedMessage.message.conversation) {
                            messageContent.text += `\nDeleted message: ${deletedMessage.message.conversation}`;
                        } else if (deletedMessage.message.extendedTextMessage) {
                            messageContent.text += `\nDeleted message: ${deletedMessage.message.extendedTextMessage.text}`;
                        } else if (deletedMessage.message.imageMessage) {
                            const media = await downloadMediaMessage(deletedMessage, { logger });
                            const tempPath = path.join(__dirname, 'temp_img.jpg');
                            fs.writeFileSync(tempPath, media);
                            messageContent = {
                                image: { url: tempPath },
                                caption: `${notification}\n${deletedMessage.message.imageMessage.caption || ''}`.trim(),
                                mentions: [participant]
                            };
                            await sendMessage(remoteJid, messageContent);
                            fs.unlinkSync(tempPath);
                            return;
                        }
                        // ... (similar for video, audio, etc)

                        if (config.ANTIDELETE1 === "yes") await sendMessage(botOwnerJid, messageContent);
                        if (config.ANTIDELETE2 === "yes") await sendMessage(remoteJid, messageContent);

                    } catch (error) {
                        logger.error('Error:', error);
                    }
                }
            }
        });

        console.log("✅ Anti-Delete System operational");
    }
};

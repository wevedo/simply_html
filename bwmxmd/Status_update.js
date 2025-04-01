const { createContext } = require('../utils/helper');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) return;

        const botJid = `${adams.user?.id.split('@')[0]}@s.whatsapp.net`;
        const businessLink = 'https://business.bwmxmd.online/';
        const infoLink = 'https://ibrahimadams.site/';

        // ==================== PRESENCE ====================
        if (config.PRESENCE) {
            const validStates = ["available", "composing", "recording", "paused", "unavailable"];
            if (validStates.includes(config.PRESENCE)) {
                logger.info(`[Presence] Setting to: ${config.PRESENCE}`);
                
                // Set initial presence
                await adams.sendPresenceUpdate(config.PRESENCE);
                
                // Update presence on reconnection
                adams.ev.on("connection.update", async (update) => {
                    if (update.connection === "open") {
                        await adams.sendPresenceUpdate(config.PRESENCE);
                        logger.info(`[Presence] Reconnected, maintained ${config.PRESENCE}`);
                    }
                });
            } else {
                logger.warn(`[Presence] Invalid state: ${config.PRESENCE}`);
            }
        }

        // ==================== AUTO READ ====================
        if (config.AUTO_READ === "yes") {
            logger.info("[Read] Auto-read enabled for chats");
            
            adams.ev.on("messages.upsert", async (m) => {
                try {
                    const unread = m.messages.filter(
                        msg => !msg.key.fromMe && msg.key.remoteJid !== "status@broadcast"
                    );
                    if (unread.length > 0) {
                        await adams.readMessages(unread.map(msg => msg.key));
                    }
                } catch (err) {
                    logger.error("[Read] Error:", err);
                }
            });
        }

        // ==================== STATUS READ ====================
        if (config.AUTO_READ_STATUS === "yes") {
            logger.info("[Status] Auto-read enabled for status updates");
            
            adams.ev.on("messages.upsert", async (m) => {
                try {
                    const statusUpdates = m.messages.filter(
                        msg => msg.key?.remoteJid === "status@broadcast"
                    );
                    if (statusUpdates.length > 0) {
                        await adams.readMessages(statusUpdates.map(msg => msg.key));
                    }
                } catch (err) {
                    logger.error("[Status] Read error:", err);
                }
            });
        }

        // ==================== STATUS REACTIONS ====================
        if (config.AUTO_REACT_STATUS === "yes") {
            logger.info("[Status] Auto-react enabled");

            zk.ev.on("messages.upsert", async (m) => {
           const { messages } = m;
        
        // Common love reaction emojis for WhatsApp status
        const reactionEmojis = ["❤️", "💖", "💞", "💕", "😍", "💓", "💗", "🔥"];

        for (const message of messages) {
            if (message.key && message.key.remoteJid === "status@broadcast") {
                console.log("Detected status update from:", message.key.remoteJid);

                const now = Date.now();
                if (now - lastReactionTime < 5000) {  // 5-second interval
                    console.log("Throttling reactions to prevent overflow.");
                    continue;
                }

                const adams = zk.user && zk.user.id ? zk.user.id.split(":")[0] + "@s.whatsapp.net" : null;
                if (!adams) {
                    console.log("Bot's user ID not available. Skipping reaction.");
                    continue;
                }

                // Select a random reaction emoji
                const randomEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];

                await zk.sendMessage(message.key.remoteJid, {
                    react: {
                        key: message.key,
                        text: randomEmoji,
                    },
                }, {
                    statusJidList: [message.key.participant, adams],
                });

                lastReactionTime = Date.now();
                console.log(`Reacted with '${randomEmoji}' to status update by ${message.key.remoteJid}`);

                await delay(2000); // 2-second delay between reactions
              }
            }
          });
       }
            
            

        // ==================== STATUS DOWNLOAD ====================
        if (config.AUTO_DOWNLOAD_STATUS === "yes" && config.STATUS_LOG_JID) {
            logger.info("[Status] Auto-download enabled");
            
            adams.ev.on("messages.upsert", async (m) => {
                try {
                    const statusMessages = m.messages.filter(
                        msg => msg.key?.remoteJid === "status@broadcast"
                    );

                    for (const status of statusMessages) {
                        // Mark as read first if enabled
                        if (config.AUTO_READ_STATUS === "yes") {
                            await adams.readMessages([status.key]);
                        }

                        if (status.message?.extendedTextMessage) {
                            await adams.sendMessage(config.STATUS_LOG_JID, {
                                text: `📢 Status Update:\n${status.message.extendedTextMessage.text}\n\n` +
                                      `🔗 ${businessLink}\nℹ️ ${infoLink}`,
                                ...createContext(status.key.participant || status.key.remoteJid)
                            });
                        } 
                        else if (status.message?.imageMessage) {
                            const media = await adams.downloadMediaMessage(status.message.imageMessage);
                            await adams.sendMessage(config.STATUS_LOG_JID, {
                                image: media,
                                caption: (status.message.imageMessage.caption || "📸 Status Image") + 
                                        `\n\n🔗 ${businessLink}\nℹ️ ${infoLink}`,
                                ...createContext(status.key.participant || status.key.remoteJid)
                            });
                        }
                        else if (status.message?.videoMessage) {
                            const media = await adams.downloadMediaMessage(status.message.videoMessage);
                            await adams.sendMessage(config.STATUS_LOG_JID, {
                                video: media,
                                caption: (status.message.videoMessage.caption || "🎥 Status Video") + 
                                        `\n\n🔗 ${businessLink}\nℹ️ ${infoLink}`,
                                ...createContext(status.key.participant || status.key.remoteJid)
                            });
                        }
                    }
                } catch (err) {
                    logger.error("[Status] Download error:", err);
                }
            });
        }

        // ==================== AUTO REACT TO MESSAGES ====================
        if (config.AUTO_REACT === "yes") {
            logger.info("[React] Auto-react to messages enabled");
            
            const emojiMap = {
                "hello": ["👋", "🙂", "😊"],
                "hi": ["👋", "😄", "🤗"],
                "good morning": ["🌞", "☀️", "🌻"],
                "good night": ["🌙", "🌠", "💤"],
                "thanks": ["🙏", "❤️", "😊"],
                "welcome": ["😊", "🤗", "👌"],
                "congrats": ["🎉", "👏", "🥳"],
                "sorry": ["😔", "🙏", "🥺"]
            };
            
            const fallbackEmojis = ["👍", "❤️", "😊", "😂", "🔥", "✨"];

            let lastReactTime = 0;

            adams.ev.on("messages.upsert", async (m) => {
                try {
                    const { messages } = m;
                    const now = Date.now();

                    for (const message of messages) {
                        if (!message.key || message.key.fromMe || 
                            message.key.remoteJid === "status@broadcast" ||
                            now - lastReactTime < 2000) continue;

                        const msgText = (
                            message.message?.conversation || 
                            message.message?.extendedTextMessage?.text || ""
                        ).toLowerCase();

                        let emoji;
                        for (const [keyword, emojis] of Object.entries(emojiMap)) {
                            if (msgText.includes(keyword)) {
                                emoji = emojis[Math.floor(Math.random() * emojis.length)];
                                break;
                            }
                        }

                        emoji = emoji || fallbackEmojis[Math.floor(Math.random() * fallbackEmojis.length)];

                        await adams.sendMessage(message.key.remoteJid, {
                            react: {
                                text: emoji,
                                key: message.key
                            }
                        });

                        lastReactTime = now;
                        logger.info(`[React] Sent ${emoji} to ${message.key.remoteJid}`);
                        await delay(1000);
                    }
                } catch (err) {
                    logger.error("[React] Error:", err);
                }
            });
        }
    }
};

// Import necessary modules
// utils/statusUtils.js
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = (adams, conf) => {
    // Valid presence states
    const validPresenceStates = new Set([
        "available", "composing", "recording", "paused", "unavailable"
    ]);

    // ======================
    // 1. PRESENCE MANAGEMENT
    // ======================
    if (conf.PRESENCE && validPresenceStates.has(conf.PRESENCE)) {
        console.log(`[Presence] Setting to: ${conf.PRESENCE}`);
        
        // Set initial presence
        adams.sendPresenceUpdate(conf.PRESENCE).catch(console.error);
        
        // Update on reconnection
        adams.ev.on("connection.update", (update) => {
            if (update.connection === "open") {
                adams.sendPresenceUpdate(conf.PRESENCE)
                    .then(() => console.log(`[Presence] Reconnected, maintained ${conf.PRESENCE}`))
                    .catch(console.error);
            }
        });
    }

    // ====================
    // 2. AUTO-READ MESSAGES
    // ====================
    if (conf.AUTO_READ === "yes") {
        console.log("[Read] Auto-read enabled for chats");
        
        adams.ev.on("messages.upsert", async (m) => {
            try {
                const unread = m.messages.filter(
                    msg => !msg.key.fromMe && msg.key.remoteJid !== "status@broadcast"
                );
                
                if (unread.length > 0) {
                    await adams.readMessages(unread.map(msg => msg.key));
                    console.log(`[Read] Marked ${unread.length} messages as read`);
                }
            } catch (err) {
                console.error("[Read] Error:", err);
            }
        });
    }

    // ==========================
    // 3. AUTO-READ STATUS UPDATES
    // ==========================
    if (conf.AUTO_READ_STATUS === "yes") {
        console.log("[Read] Auto-read enabled for status updates");
        
        adams.ev.on("messages.upsert", async (m) => {
            try {
                const statusUpdates = m.messages.filter(
                    msg => msg.key?.remoteJid === "status@broadcast"
                );
                
                if (statusUpdates.length > 0) {
                    await adams.readMessages(statusUpdates.map(msg => msg.key));
                    console.log(`[Read] Marked ${statusUpdates.length} status updates as read`);
                }
            } catch (err) {
                console.error("[Read] Status error:", err);
            }
        });
    }

    // =========================
    // 4. AUTO-REACT TO STATUSES
    // =========================
    if (conf.AUTO_REACT_STATUS === "yes") {
        console.log("[React] Status auto-reaction enabled");
        
        // Use emojis from config or default set
        const reactionEmojis = conf.STATUS_REACTION_EMOJIS?.split(",") || [
            "❤️", "🔥", "👏", "🎉", "👍", "🤩", "💯", "✨", "😍", "😂"
        ];
        
        let lastReactionTime = 0;
        const reactionCooldown = 5000; // 5 seconds

        adams.ev.on("messages.upsert", async (m) => {
            try {
                const { messages } = m;
                const now = Date.now();
                
                for (const message of messages) {
                    if (!message.key || message.key.remoteJid !== "status@broadcast") continue;
                    if (now - lastReactionTime < reactionCooldown) continue;
                    
                    const randomEmoji = reactionEmojis[
                        Math.floor(Math.random() * reactionEmojis.length)
                    ];
                    
                    await adams.sendMessage(message.key.remoteJid, {
                        react: {
                            text: randomEmoji,
                            key: message.key
                        }
                    });
                    
                    lastReactionTime = now;
                    console.log(`[React] Reacted to status with ${randomEmoji}`);
                    await delay(1000); // Brief delay between reactions
                }
            } catch (err) {
                console.error("[React] Error:", err);
            }
        });
    }

    // ===========================
    // 5. AUTO-DOWNLOAD STATUSES
    // ===========================
    if (conf.AUTO_DOWNLOAD_STATUS === "yes" && conf.STATUS_LOG_JID) {
        console.log("[Status] Auto-download enabled for:", conf.STATUS_LOG_JID);
        
        adams.ev.on("messages.upsert", async (m) => {
            try {
                const statusMessages = m.messages.filter(
                    msg => msg.key?.remoteJid === "status@broadcast"
                );

                for (const status of statusMessages) {
                    // Mark as read first if enabled
                    if (conf.AUTO_READ_STATUS === "yes") {
                        await adams.readMessages([status.key]);
                    }

                    if (status.message?.extendedTextMessage) {
                        await adams.sendMessage(conf.STATUS_LOG_JID, {
                            text: `📢 Status Update:\n${status.message.extendedTextMessage.text}`
                        });
                    } 
                    else if (status.message?.imageMessage) {
                        const media = await adams.downloadMediaMessage(status.message.imageMessage);
                        await adams.sendMessage(conf.STATUS_LOG_JID, {
                            image: media,
                            caption: status.message.imageMessage.caption || "📸 Status Image"
                        });
                    }
                    else if (status.message?.videoMessage) {
                        const media = await adams.downloadMediaMessage(status.message.videoMessage);
                        await adams.sendMessage(conf.STATUS_LOG_JID, {
                            video: media,
                            caption: status.message.videoMessage.caption || "🎥 Status Video"
                        });
                    }
                }
            } catch (err) {
                console.error("[Status] Download error:", err);
            }
        });
    }
};

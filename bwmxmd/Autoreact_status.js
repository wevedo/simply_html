const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    setup: async (adams, { config, logger }) => {
        console.log("[Status] Initializing reaction system...");
        
        if (!adams) {
            console.error("[Status] Error: Adams client not provided");
            return;
        }
        
        if (!config) {
            console.error("[Status] Error: Config not provided");
            return;
        }
        
        console.log("[Status] Config STATUS_REACT_EMOJIS:", config.STATUS_REACT_EMOJIS);
        
        if (config.STATUS_REACT_EMOJIS !== "yes") {
            console.log("[Status] Feature disabled in config");
            return;
        }

        console.log("[Status] Random reactions enabled");
        
        // Professional emoji sets
        const reactionEmojis = ["👍", "❤️", "🙏", "🎉", "✨", "👏", "💯", "🌞"];
        console.log("[Status] Using emojis:", reactionEmojis);

        let lastReactionTime = 0;
        const botJid = adams.user?.id ? `${adams.user.id.split('@')[0]}@s.whatsapp.net` : null;
        console.log("[Status] Bot JID:", botJid);

        adams.ev.on("messages.upsert", async (m) => {
            console.log("[Status] New messages.upsert event");
            
            try {
                const { messages } = m;
                console.log(`[Status] Processing ${messages.length} message(s)`);

                const now = Date.now();
                for (const message of messages) {
                    console.log("[Status] Checking message from:", message.key.remoteJid);
                    
                    if (!message.key) {
                        console.log("[Status] Skipping - no message key");
                        continue;
                    }
                    
                    if (message.key.remoteJid !== "status@broadcast") {
                        console.log("[Status] Skipping - not a status update");
                        continue;
                    }
                    
                    if (now - lastReactionTime < 5000) {
                        console.log("[Status] Skipping - rate limited");
                        continue;
                    }

                    const statusText = (
                        message.message?.conversation ||
                        message.message?.extendedTextMessage?.text ||
                        ""
                    );
                    console.log("[Status] Status text:", statusText);

                    const reactionEmoji = reactionEmojis[
                        Math.floor(Math.random() * reactionEmojis.length)
                    ];
                    console.log("[Status] Selected reaction:", reactionEmoji);

                    try {
                        await adams.sendMessage(message.key.remoteJid, {
                            react: {
                                text: reactionEmoji,
                                key: message.key
                            }
                        });
                        console.log("[Status] Reaction sent successfully");
                        
                        lastReactionTime = now;
                        await delay(2000);
                    } catch (sendError) {
                        console.error("[Status] Failed to send reaction:", sendError);
                    }
                }
            } catch (err) {
                console.error("[Status] Processing error:", err);
            }
        });
        
        console.log("[Status] Reaction system ready");
    }
};

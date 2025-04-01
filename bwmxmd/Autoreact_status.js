const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    setup: async (adams, { config, logger }) => {
        console.log("[Status] Initializing reaction system...");
        console.log("[Debug] Received config:", {
            AUTO_REACT_STATUS: config.AUTO_REACT_STATUS,
            STATUS_REACT_EMOJIS: config.STATUS_REACT_EMOJIS
        });

        // Validation checks
        if (!adams) {
            console.error("[Error] Adams client not provided");
            return;
        }
        
        if (!config) {
            console.error("[Error] Config not provided");
            return;
        }

        // Corrected config check - using AUTO_REACT_STATUS instead of STATUS_REACT_EMOJIS
        if (config.AUTO_REACT_STATUS !== "yes") {
            console.log("[Status] Disabled - AUTO_REACT_STATUS is not 'yes'");
            console.log(`[Debug] Current value: '${config.AUTO_REACT_STATUS}' (type: ${typeof config.AUTO_REACT_STATUS})`);
            return;
        }

        console.log("[Status] Feature enabled - proceeding with setup");

        // Professional emoji set (with configurable option)
        const defaultEmojis = ["👍", "❤️", "🙏", "🎉", "✨", "👏", "💯", "🌞"];
        let reactionEmojis = defaultEmojis;
        
        if (config.STATUS_REACT_EMOJIS) {
            try {
                reactionEmojis = config.STATUS_REACT_EMOJIS.split(',')
                    .map(e => e.trim())
                    .filter(e => e.length > 0);
                console.log("[Status] Using custom emojis from config:", reactionEmojis);
            } catch (e) {
                console.warn("[Status] Failed to parse custom emojis, using defaults");
            }
        }

        console.log("[Status] Final emoji set:", reactionEmojis);

        let lastReactionTime = 0;
        const reactionCooldown = 5000; // 5 seconds

        adams.ev.on("messages.upsert", async (m) => {
            console.log("[Status] New message batch received");
            
            try {
                const { messages } = m;
                const now = Date.now();

                for (const message of messages) {
                    console.log(`[Status] Processing message from ${message.key?.remoteJid}`);
                    
                    // Status message validation
                    if (!message.key || message.key.remoteJid !== "status@broadcast") {
                        console.log("[Status] Not a status update - skipping");
                        continue;
                    }

                    // Rate limiting check
                    if (now - lastReactionTime < reactionCooldown) {
                        console.log(`[Status] Rate limited - ${reactionCooldown - (now - lastReactionTime)}ms remaining`);
                        continue;
                    }

                    // Get status content
                    const statusText = message.message?.conversation || 
                                     message.message?.extendedTextMessage?.text || "";
                    console.log("[Status] Status content:", statusText);

                    // Select random emoji
                    const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
                    console.log("[Status] Selected reaction:", reactionEmoji);

                    // Send reaction
                    try {
                        await adams.sendMessage(message.key.remoteJid, {
                            react: {
                                text: reactionEmoji,
                                key: message.key
                            }
                        });
                        console.log("[Status] Reaction sent successfully");
                        lastReactionTime = now;
                    } catch (sendError) {
                        console.error("[Status] Failed to send reaction:", sendError);
                    }

                    await delay(2000); // Brief delay between reactions
                }
            } catch (err) {
                console.error("[Status] Message processing error:", err);
            }
        });

        console.log("[Status] Reaction system active and listening");
    }
};

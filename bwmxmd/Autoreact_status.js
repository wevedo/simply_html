const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    setup: async (adams, { config, logger }) => {
        console.log("[Status] Initializing reaction system with enhanced debugging...");

        // Validate requirements
        if (!adams || !adams.sendMessage) {
            console.error("[Critical] Invalid adams client - missing sendMessage function");
            return;
        }

        if (config?.AUTO_REACT_STATUS !== "yes") {
            console.log("[Status] Feature disabled (AUTO_REACT_STATUS ≠ 'yes')");
            return;
        }

        console.log("[Debug] Bot user ID:", adams.user?.id);
        console.log("[Debug] Connection state:", adams.connection);

        // Professional emoji set
        const reactionEmojis = ["👍", "❤️", "🙏", "🎉", "✨", "👏", "💯", "🌞"];
        let lastReactionTime = 0;

        adams.ev.on("messages.upsert", async (m) => {
            console.log(`[Status] Received ${m.messages.length} message(s)`);

            for (const message of messages) {
                try {
                    // Validate status message
                    if (!message?.key || message.key.remoteJid !== "status@broadcast") {
                        continue;
                    }

                    console.log("[Debug] Status message structure:", JSON.stringify({
                        key: message.key,
                        message: {
                            type: Object.keys(message.message || {})[0],
                            hasMedia: !!message.message?.imageMessage || !!message.message?.videoMessage
                        }
                    }, null, 2));

                    // Rate limiting
                    const now = Date.now();
                    if (now - lastReactionTime < 5000) {
                        console.log(`[RateLimit] ${5000 - (now - lastReactionTime)}ms remaining`);
                        continue;
                    }

                    // Select emoji
                    const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
                    console.log("[React] Attempting to react with:", reactionEmoji);

                    // Enhanced reaction attempt with full error capture
                    try {
                        const reaction = {
                            react: {
                                text: reactionEmoji,
                                key: message.key
                            }
                        };

                        console.log("[Debug] Reaction payload:", JSON.stringify(reaction, null, 2));

                        const result = await adams.sendMessage(message.key.remoteJid, reaction);
                        console.log("[Debug] Reaction result:", result);

                        // Verify reaction
                        if (result?.status === 1 || result?.key?.id) {
                            console.log("[Success] Reaction verified with delivery receipt");
                            lastReactionTime = now;
                        } else {
                            console.warn("[Warning] Reaction sent but no confirmation received");
                        }
                    } catch (sendError) {
                        console.error("[Error] Reaction failed:", {
                            error: sendError.message,
                            stack: sendError.stack,
                            participant: message.key.participant
                        });
                    }

                    await delay(2000);
                } catch (err) {
                    console.error("[Processing Error]", err);
                }
            }
        });

        // Add event listeners to track message acknowledgments
        adams.ev.on('messages.ack', (ack) => {
            console.log("[Ack] Message acknowledgment:", JSON.stringify(ack, null, 2));
        });

        console.log("[Status] Reaction system fully initialized");
    }
};

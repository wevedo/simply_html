const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config || config.AUTO_REACT_STATUS !== "yes") return;

        logger.info("[Status] Random reactions enabled");
        
        // Get emojis from config or use defaults
        const reactionEmojis = config.STATUS_REACT_EMOJIS ?
            config.STATUS_REACT_EMOJIS.split(',').map(e => e.trim()) : 
            ["❤️", "🔥", "👍", "🎉"]; // Default emojis
        
        let lastReactionTime = 0;
        const botJid = `${adams.user?.id.split('@')[0]}@s.whatsapp.net`;

        // Enhanced emoji mapping for keywords
        const keywordEmojis = {
            "happy": ["😊", "😄", "🥰"],
            "sad": ["😢", "😔", "🥺"],
            "love": ["❤️", "💖", "💘"],
            "party": ["🎉", "🎊", "🥳"],
            "travel": ["✈️", "🌎", "🗺️"],
            "food": ["🍕", "🍔", "🍣"]
        };

        adams.ev.on("messages.upsert", async (m) => {
            try {
                const { messages } = m;
                const now = Date.now();

                for (const message of messages) {
                    if (!message.key || message.key.remoteJid !== "status@broadcast") continue;
                    if (now - lastReactionTime < 5000) continue;

                    // Get status text
                    const statusText = (
                        message.message?.conversation ||
                        message.message?.extendedTextMessage?.text ||
                        ""
                    ).toLowerCase();

                    // Select reaction - first try keyword matches, then random from config
                    let reactionEmoji;
                    
                    // Check for keywords
                    for (const [keyword, emojis] of Object.entries(keywordEmojis)) {
                        if (statusText.includes(keyword)) {
                            reactionEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                            break;
                        }
                    }
                    
                    // Fallback to configured emojis
                    if (!reactionEmoji) {
                        reactionEmoji = reactionEmojis[
                            Math.floor(Math.random() * reactionEmojis.length)
                        ];
                    }

                    // Send reaction
                    await adams.sendMessage(message.key.remoteJid, {
                        react: {
                            text: reactionEmoji,
                            key: message.key
                        }
                    });

                    lastReactionTime = now;
                    logger.info(`[Status] Reacted with ${reactionEmoji} to ${message.key.participant || 'unknown'}'s status`);
                    await delay(2000); // 2-second delay between reactions
                }
            } catch (err) {
                logger.error("[Status] Reaction error:", err);
            }
        });
    }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config || config.STATUS_REACT_EMOJIS !== "yes") return;

        logger.info("[Status] Professional reactions enabled");
        
        // Mature, universally appropriate emoji sets
        const professionalEmojis = {
            general: ["👍", "👌", "💯", "✨", "🌟"], // Neutral positive reactions
            greetings: ["👋", "🙂", "😊", "🤗"],    // For hello/hi messages
            appreciation: ["🙏", "❤️", "💖", "💐"], // For thank you messages
            celebration: ["🎉", "🎊", "🥂", "🏆"],  // For achievements/events
            nature: ["🌞", "🌻", "🌎", "🌸"],      // For nature/travel
            time: ["🕰️", "⏳", "🌙", "☀️"],        // For time-related (good morning/night)
            objects: ["📚", "🎵", "🍵", "✈️"]      // Neutral object symbols
        };

        let lastReactionTime = 0;
        const botJid = `${adams.user?.id.split('@')[0]}@s.whatsapp.net`;

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

                    // Select appropriate emoji category
                    let emojiSet = professionalEmojis.general;
                    
                    if (/(good\s(morning|night)|day|evening)/.test(statusText)) {
                        emojiSet = professionalEmojis.time;
                    } else if (/(thank|appreciate|grateful)/.test(statusText)) {
                        emojiSet = professionalEmojis.appreciation;
                    } else if (/(hi|hello|hey|greet)/.test(statusText)) {
                        emojiSet = professionalEmojis.greetings;
                    } else if (/(celebrate|congrat|achievement)/.test(statusText)) {
                        emojiSet = professionalEmojis.celebration;
                    } else if (/(travel|nature|weather)/.test(statusText)) {
                        emojiSet = professionalEmojis.nature;
                    } else if (/(book|music|tea|coffee|flight)/.test(statusText)) {
                        emojiSet = professionalEmojis.objects;
                    }

                    // Select random emoji from chosen set
                    const reactionEmoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];

                    // Send reaction
                    await adams.sendMessage(message.key.remoteJid, {
                        react: {
                            text: reactionEmoji,
                            key: message.key
                        }
                    });

                    lastReactionTime = now;
                    logger.info(`[Status] Reacted with ${reactionEmoji} to status`);
                    await delay(2000); // 2-second delay between reactions
                }
            } catch (err) {
                logger.error("[Status] Reaction error:", err);
            }
        });
    }
};

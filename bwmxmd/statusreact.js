// Utility function for delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Common love reaction emojis for WhatsApp status
const reactionEmojis = ["❤️", "💖", "💞", "💕", "😍", "💓", "💗", "🔥"];

// Export the function as a module
module.exports = (zk, conf) => {
    if (conf.AUTO_REACT_STATUS !== "yes") {
        console.log("AUTO_REACT_STATUS is disabled. No reactions will be sent.");
        return;
    }

    console.log("AUTO_REACT_STATUS is enabled. Listening for status updates...");

    // Track the last reaction time to prevent spam
    let lastReactionTime = 0;

    zk.ev.on("messages.upsert", async (m) => {
        const { messages } = m;

        for (const message of messages) {
            if (!message.key || message.key.remoteJid !== "status@broadcast") continue;

            console.log("Detected a status update...");

            const now = Date.now();
            if (now - lastReactionTime < 5000) {
                console.log("Throttling reactions to prevent spam.");
                continue;
            }

            // Pick a random reaction emoji
            const randomEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];

            try {
                await zk.sendMessage(message.key.remoteJid, {
                    react: {
                        key: message.key,
                        text: randomEmoji,
                    },
                });

                lastReactionTime = Date.now();
                console.log(`Reacted with '${randomEmoji}' to a status update.`);
            } catch (err) {
                console.error("Failed to send reaction:", err);
            }

            await delay(2000); // 2-second delay before reacting to the next status
        }
    });
};

// Utility function for delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Track the last reaction time to prevent overflow
let lastReactionTime = 0;

// Common love reaction emojis for WhatsApp status
const reactionEmojis = ["❤️", "💖", "💞", "💕", "😍", "💓", "💗", "🔥"];

// Auto-react to status updates if enabled in config
if (conf.AUTO_REACT_STATUS === "yes") {
    console.log("AUTO_REACT_STATUS is enabled. Listening for status updates...");

    zk.ev.on("messages.upsert", async (m) => {
        const { messages } = m;

        for (const message of messages) {
            if (message.key && message.key.remoteJid === "status@broadcast") {
                console.log("Detected status update from:", message.key.remoteJid);

                const now = Date.now();
                if (now - lastReactionTime < 5000) { // 5-second interval
                    console.log("Throttling reactions to prevent overflow.");
                    continue;
                }

                // Select a random reaction emoji
                const randomEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];

                await zk.sendMessage(message.key.remoteJid, {
                    react: {
                        key: message.key,
                        text: randomEmoji,
                    },
                });

                lastReactionTime = Date.now();
                console.log(`Reacted with '${randomEmoji}' to status update by ${message.key.remoteJid}`);

                await delay(2000); // 2-second delay between reactions
            }
        }
    });
}

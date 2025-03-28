// Import necessary modules
const makeWASocket = require("@whiskeysockets/baileys");

// Utility function for delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = (zk, conf) => {
    // Track last reaction time to prevent spam
    let lastReactionTime = 0;

    // Emoji reaction map for specific words
    const emojiMap = {
        "hello": ["👋", "🙂", "😊", "🙋‍♂️", "🙋‍♀️"],
        "hi": ["👋", "🙂", "😁", "🙋‍♂️", "🙋‍♀️"],
        "good morning": ["🌅", "🌞", "☀️", "🌻", "🌼"],
        "good night": ["🌙", "🌜", "⭐", "🌛", "💫"],
        "bye": ["👋", "😢", "👋🏻", "🥲", "🚶‍♂️", "🚶‍♀️"],
        "cheers": ["🥂", "🍻", "🍾", "🎉", "🎊"],
    };

    // Fallback random emoji list
    const fallbackEmojis = [
        "😊", "😂", "❤️", "😍", "😭", "🥺", "👍", "🙏", "💔", "💀",
        "🥳", "🔥", "✨", "🎉", "🎂", "🥂", "💥", "👏", "💯", "🌹",
    ];

    // Function to find an emoji based on a sentence
    const getEmojiForSentence = (sentence) => {
        const words = sentence.split(/\s+/);
        for (const word of words) {
            const emoji = getRandomEmojiFromMap(word.toLowerCase());
            if (emoji) return emoji;
        }
        return getRandomFallbackEmoji();
    };

    // Get random emoji from the map
    const getRandomEmojiFromMap = (keyword) => {
        const emojis = emojiMap[keyword.toLowerCase()];
        return emojis ? emojis[Math.floor(Math.random() * emojis.length)] : null;
    };

    // Get a random emoji from fallback list
    const getRandomFallbackEmoji = () => {
        return fallbackEmojis[Math.floor(Math.random() * fallbackEmojis.length)];
    };

    // Auto-react to messages if enabled
    if (conf.AUTO_REACT === "yes") {
        console.log("Auto-react is enabled. Listening for messages...");

        zk.ev.on("messages.upsert", async (m) => {
            const { messages } = m;

            for (const message of messages) {
                if (!message.key || !message.key.remoteJid) continue;

                const now = Date.now();
                if (now - lastReactionTime < 5000) {
                    console.log("Throttling reactions to prevent spam.");
                    continue;
                }

                // Extract message text
                const conversationText = message?.message?.conversation || "";
                if (!conversationText.trim()) continue;

                const randomEmoji = getEmojiForSentence(conversationText);

                // Send reaction
                if (randomEmoji) {
                    try {
                        await zk.sendMessage(message.key.remoteJid, {
                            react: {
                                text: randomEmoji,
                                key: message.key,
                            },
                        });
                        lastReactionTime = Date.now();
                        console.log(`Reacted with '${randomEmoji}' to message from ${message.key.remoteJid}`);
                    } catch (err) {
                        console.error("Reaction failed:", err);
                    }
                }

                await delay(2000);
            }
        });
    }
};

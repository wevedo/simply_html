const delay = ms => new Promise(resolve => setTimeout(resolve, ms)); let lastReactionTime = 0;
module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) {
            logger.error('Auto_like_stutas Missing adams or config');
            return;
if (config.AUTO_REACT_STATUS === "yes") { console.log("AUTO_REACT_STATUS is enabled. Listening for status updates...");

adams.ev.on("messages.upsert", async (m) => {
    const { messages } = m;
    
    // Fetch emojis from conf and split into an array
    const reactionEmojis = (config.STATUS_REACT_EMOJIS || "🚀,🌎,✅,💚,🩵,🤖").split(",").map(e => e.trim());

    for (const message of messages) {
        if (message.key && message.key.remoteJid === "status@broadcast") {
            console.log("Detected status update from:", message.key.remoteJid);

            const now = Date.now();
            if (now - lastReactionTime < 5000) {  // 5-second interval
                console.log("Throttling reactions to prevent overflow.");
                continue;
            }

            const adam = adams.user && adams.user.id ? adams.user.id.split(":")[0] + "@s.whatsapp.net" : null;
            if (!adam) {
                console.log("Bot's user ID not available. Skipping reaction.");
                continue;
            }

            // Select a random reaction emoji
            const randomEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];

            await adams.sendMessage(message.key.remoteJid, {
                react: {
                    key: message.key,
                    text: randomEmoji,
                },
            }, {
                statusJidList: [message.key.participant, adam],
            });

            lastReactionTime = Date.now();
            console.log(`Reacted with '${randomEmoji}' to status update by ${message.key.remoteJid}`);

            await delay(2000); // 2-second delay between reactions
        }
    }
});                                      

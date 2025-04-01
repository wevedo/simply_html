const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = { setup: async (adams, { conf }) => { let lastReactionTime = 0;

if (conf.AUTO_REACT_STATUS === "yes") {
        adams.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            
            // Fetch emojis from conf and split into an array
            const reactionEmojis = (conf.STATUS_REACT_EMOJIS || "🚀,🌎,♻️").split(",").map(e => e.trim());

            for (const message of messages) {
                if (message.key && message.key.remoteJid === "status@broadcast") {
                    const now = Date.now();
                    if (now - lastReactionTime < 5000) {
                        continue;
                    }

                    const adam = adams.user && adams.user.id ? adams.user.id.split(":")[0] + "@s.whatsapp.net" : null;
                    if (!adam) {
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
                    await delay(2000); // 2-second delay between reactions
                }
            }
        });
    }
}

};

                                        }

const { adams } = require("../Ibrahim/adams");
const { PREFIX } = require(__dirname + "/../config");

// Command categories with images
const categories = {
    media: {
        title: "🎬 Media Commands",
        commands: [
            `${PREFIX}ytdl - Download YouTube videos`,
            `${PREFIX}igdl - Instagram downloader`,
            `${PREFIX}sticker - Create stickers`,
            `${PREFIX}tiktok - TikTok downloader`
        ],
        thumbnail: "https://example.com/media.jpg"
    },
    group: {
        title: "👥 Group Tools",
        commands: [
            `${PREFIX}add - Add users`,
            `${PREFIX}kick - Remove users`,
            `${PREFIX}promote - Make admin`,
            `${PREFIX}lock - Lock group`
        ],
        thumbnail: "https://example.com/group.jpg"
    },
    tools: {
        title: "🛠 Utilities",
        commands: [
            `${PREFIX}calc - Calculator`,
            `${PREFIX}trt - Translator`,
            `${PREFIX}tts - Text to speech`,
            `${PREFIX}tempmail - Temp email`
        ],
        thumbnail: "https://example.com/tools.jpg"
    }
};

adams({ 
    nomCom: "pollmenu", 
    categorie: "General",
    reaction: "📊",
    nomFichier: __filename 
}, async (dest, zk, { repondre, verifAdmin }) => {
    try {
        // Create poll with categories
        await zk.sendMessage(dest, {
            poll: {
                name: "📊 BWM-XMD Command Navigator",
                values: Object.keys(categories).map(key => categories[key].title),
                selectableCount: 1
            }
        });

        // Store active polls
        const activePoll = {
            chatId: dest,
            timestamp: Date.now()
        };

        // Handle poll responses
        zk.ev.on("messages.update", async (update) => {
            const pollUpdate = update.messages[0];
            if (!pollUpdate?.message?.pollUpdateMessage) return;
            
            // Verify it's our poll
            if (pollUpdate.key.remoteJid !== activePoll.chatId) return;
            
            const selectedIndex = pollUpdate.message.pollUpdateMessage.vote.selectedOptions[0];
            const categoryKey = Object.keys(categories)[selectedIndex];
            const category = categories[categoryKey];

            // Send category commands
            await zk.sendMessage(dest, {
                image: { url: category.thumbnail },
                caption: `*${category.title}*\n\n${category.commands.join('\n')}\n\nReply "menu" to return`
            });

            // Handle menu return
            zk.ev.once("messages.upsert", async ({ messages }) => {
                const msg = messages[0];
                if (msg?.message?.conversation?.toLowerCase() === "menu") {
                    await repondre("Returning to main menu...");
                    // Resend poll
                    await zk.sendMessage(dest, {
                        poll: {
                            name: "📊 BWM-XMD Command Navigator",
                            values: Object.keys(categories).map(key => categories[key].title),
                            selectableCount: 1
                        }
                    });
                }
            });
        });

    } catch (error) {
        repondre(`❌ Error: ${error.message}`);
    }
});

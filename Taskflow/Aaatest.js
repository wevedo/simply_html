const { adams } = require('../Ibrahim/adams');
const conf = require(__dirname + "/../config");
const PREFIX = conf.PREFIX;

adams({ 
    nomCom: "menu", 
    categorie: "General",
    reaction: "📱",
    nomFichier: __filename 
}, async (dest, zk, { ms, repondre }) => {
    try {
        await zk.sendMessage(dest, {
            text: `
╭─────═━┈┈━═──━┈⊷
│ ʙᴏᴛ ɴᴀᴍᴇ: *ʙᴡᴍ-ᴍᴅ*
│ ᴠᴇʀꜱɪᴏɴ: *6.0.3*
│ ᴏᴡɴᴇʀ: *sɪʀ ɪʙʀᴀʜɪᴍ*
╰─────═━┈┈━═──━┈⊷
            `.trim(),
            footer: "Powered by BWM-XMD | Select an option below",
            templateButtons: [
                { 
                    index: 1, 
                    quickReplyButton: { 
                        displayText: "📜 COMMANDS", 
                        id: `${PREFIX}commands` 
                    }
                },
                { 
                    index: 2, 
                    quickReplyButton: { 
                        displayText: "⏳ PING", 
                        id: `${PREFIX}ping` 
                    }
                },
                { 
                    index: 3, 
                    quickReplyButton: { 
                        displayText: "🎵 MEDIA TOOLS", 
                        id: `${PREFIX}media` 
                    }
                },
                { 
                    index: 4, 
                    quickReplyButton: { 
                        displayText: "👥 GROUP TOOLS", 
                        id: `${PREFIX}group` 
                    }
                },
                { 
                    index: 5, 
                    urlButton: { 
                        displayText: "⭐ GITHUB", 
                        url: "https://github.com/devibraah/BWM-XMD" 
                    }
                }
            ]
        }, { quoted: ms });

    } catch (error) {
        console.error("Menu Error:", error);
        await repondre("❌ Failed to load menu. Please try again.");
    }
});

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
            buttons: [
                {
                    buttonId: `${PREFIX}commands`,
                    buttonText: { displayText: "📜 COMMANDS" },
                    type: 1
                },
                {
                    buttonId: `${PREFIX}ping`,
                    buttonText: { displayText: "⏳ PING" },
                    type: 1
                },
                {
                    buttonId: `${PREFIX}media`,
                    buttonText: { displayText: "🎵 MEDIA TOOLS" },
                    type: 1
                },
                {
                    buttonId: `${PREFIX}group`,
                    buttonText: { displayText: "👥 GROUP TOOLS" },
                    type: 1
                }
            ],
            headerType: 1
        }, { quoted: ms });

    } catch (error) {
        console.error("Menu Error:", error);
        await repondre("❌ Failed to load menu. Please try again.");
    }
});

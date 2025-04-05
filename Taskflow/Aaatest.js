const { adams } = require("../Ibrahim/adams");
const axios = require('axios');
const yts = require('yt-search');
const conf = require(__dirname + "/../config");
const PREFIX = conf.PREFIX;
adams({ 
    nomCom: "buttontest", 
    categorie: "Test",
    reaction: "🔘",
    nomFichier: __filename 
}, async (dest, zk, { ms, repondre }) => {
    try {
        // Immediate response with test buttons
        await zk.sendMessage(dest, {
            text: "🛠️ *BWM-XMD BUTTON TEST* 🛠️\n\nSelect an option:",
            footer: "Testing button functionality",
            buttons: [
                {
                    buttonId: `${PREFIX}test1`,
                    buttonText: { displayText: "🔊 Test Button 1" },
                    type: 1
                },
                {
                    buttonId: `${PREFIX}test2`,
                    buttonText: { displayText: "📸 Test Button 2" },
                    type: 1
                }
            ],
            contextInfo: {
                mentionedJid: [ms.key.participant || ms.key.remoteJid],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: ms });

        // Button click handler
        zk.ev.once("messages.upsert", ({ messages }) => {
            const msg = messages[0];
            if (msg?.message?.buttonsResponseMessage) {
                const selected = msg.message.buttonsResponseMessage.selectedButtonId;
                repondre(`✅ You clicked: ${selected.replace(PREFIX, "")}`);
            }
        });

    } catch (error) {
        console.error("Button Test Error:", error);
        repondre("❌ Button test failed");
    }
});

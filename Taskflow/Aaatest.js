const { adams } = require("../Ibrahim/adams");
const conf = require(__dirname + "/../config");
const PREFIX = conf.PREFIX;

adams({ 
    nomCom: "btest", 
    categorie: "Test",
    reaction: "🔘",
    nomFichier: __filename 
}, async (dest, zk, { ms, repondre }) => {
    try {
        // Mobile-friendly button message
        await zk.sendMessage(dest, {
            text: "📲 *BWM-XMD MOBILE TEST* 📲\n\nPlease select:",
            footer: "Mobile button test",
            templateButtons: [
                {
                    index: 1,
                    quickReplyButton: {
                        displayText: "⭐ OPTION 1",
                        id: `${PREFIX}test1`
                    }
                },
                {
                    index: 2,
                    quickReplyButton: {
                        displayText: "✨ OPTION 2",
                        id: `${PREFIX}test2`
                    }
                }
            ]
        }, { quoted: ms });

        // Button response handler
        zk.ev.on("messages.upsert", ({ messages }) => {
            const msg = messages[0];
            if (msg?.message?.templateButtonReplyMessage) {
                const selected = msg.message.templateButtonReplyMessage.selectedId;
                repondre(`📱 You chose: ${selected.replace(PREFIX, "")}`);
            }
        });

    } catch (error) {
        console.error("Mobile Button Error:", error);
        repondre("❌ Mobile button test failed");
    }
});

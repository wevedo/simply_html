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
    text: "📋 BWM-XMD MOBILE MENU",
    footer: "Select an option",
    title: "YOUR CHOICE",
    buttonText: "VIEW OPTIONS",
    sections: [
        {
            title: "MAIN OPTIONS",
            rows: [
                {
                    title: "Option 1",
                    rowId: `${PREFIX}mopt1`
                },
                {
                    title: "Option 2", 
                    rowId: `${PREFIX}mopt2`
                }
            ]
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

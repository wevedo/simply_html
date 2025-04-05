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
        // SOLUTION 1: Use List Message Instead (More Reliable)
        await zk.sendMessage(dest, {
            text: "📱 *BWM-XMD INTERACTIVE MENU*",
            footer: "Select an option",
            title: "TEST MENU",
            buttonText: "VIEW OPTIONS",
            sections: [
                {
                    title: "TEST SECTION",
                    rows: [
                        { title: "OPTION 1", rowId: `${PREFIX}test1` },
                        { title: "OPTION 2", rowId: `${PREFIX}test2` }
                    ]
                }
            ]
        }, { quoted: ms });

        // SOLUTION 2: Alternative Button Format (If list doesn't work)
        await zk.sendMessage(dest, {
            text: "🔘 *BUTTON TEST*",
            templateButtons: [
                { 
                    index: 1,
                    quickReplyButton: { 
                        displayText: "TEST BUTTON", 
                        id: `${PREFIX}test` 
                    }
                }
            ]
        }, { quoted: ms });

        // Track responses
        zk.ev.on("messages.upsert", ({ messages }) => {
            const msg = messages[0];
            
            // For list messages
            if (msg?.message?.listResponseMessage) {
                const selected = msg.message.listResponseMessage.singleSelectReply.selectedRowId;
                repondre(`LIST SELECTED: ${selected}`);
            }
            
            // For template buttons
            if (msg?.message?.templateButtonReplyMessage) {
                const selected = msg.message.templateButtonReplyMessage.selectedId;
                repondre(`BUTTON SELECTED: ${selected}`);
            }
        });

    } catch (error) {
        console.error("Full Error:", error);
        repondre("❌ Test failed - Check console");
    }
});

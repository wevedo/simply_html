const { adams } = require("../Ibrahim/adams");
const conf = require(__dirname + "/../config");
const PREFIX = conf.PREFIX;

adams({ 
    nomCom: "listtest", 
    categorie: "Test",
    reaction: "📋",
    nomFichier: __filename 
}, async (dest, zk, { ms, repondre }) => {
    try {
        // Create interactive list message
        const listMessage = {
            text: "📋 *BWM-XMD LIST TEST* 📋",
            footer: "Select an option from the list",
            title: "TEST OPTIONS",
            buttonText: "View Options",
            sections: [
                {
                    title: "MAIN TEST SECTION",
                    rows: [
                        {
                            title: "🔊 Audio Test",
                            description: "Test audio functionality",
                            rowId: `${PREFIX}test1`
                        },
                        {
                            title: "📸 Video Test",
                            description: "Test video functionality", 
                            rowId: `${PREFIX}test2`
                        }
                    ]
                }
            ]
        };

        // Send list message
        await zk.sendMessage(dest, listMessage, { quoted: ms });

        // List selection handler
        zk.ev.on("messages.upsert", async ({ messages }) => {
            const msg = messages[0];
            if (!msg?.message?.listResponseMessage) return;
            
            const selected = msg.message.listResponseMessage.singleSelectReply.selectedRowId;
            await repondre(`✅ You selected: ${selected.replace(PREFIX, "")}`);
            
            // Additional response
            await zk.sendMessage(dest, {
                text: `You chose: ${selected.includes('test1') ? "Audio Test" : "Video Test"}`,
                footer: "BWM-XMD Test Result"
            }, { quoted: msg });
        });

    } catch (error) {
        console.error("List Test Error:", error);
        await repondre("❌ List test failed");
    }
});

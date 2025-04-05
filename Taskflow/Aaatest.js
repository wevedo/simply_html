const { adams } = require("../Ibrahim/adams");
const conf = require(__dirname + "/../config");
const PREFIX = conf.PREFIX;

adams({ 
    nomCom: "mtest", 
    categorie: "Test",
    reaction: "📱",
    nomFichier: __filename 
}, async (dest, zk, { ms, repondre }) => {
    try {
        // 1. First verify basic message delivery
        await zk.sendMessage(dest, { 
            text: "📲 *BWM-XMD MOBILE TEST* 📲\n\nThis text should appear first..." 
        }, { quoted: ms });

        // 2. Send SIMPLE interactive buttons (mobile-optimized)
        const buttonMsg = {
            text: "Please select an option:",
            footer: "Mobile interactive test",
            buttons: [
                { buttonId: `${PREFIX}m1`, buttonText: { displayText: "MOBILE BUTTON 1" }, type: 1 },
                { buttonId: `${PREFIX}m2`, buttonText: { displayText: "MOBILE BUTTON 2" }, type: 1 }
            ],
            headerType: 1, // CRUCIAL FOR MOBILE
            viewOnce: true // Helps with rendering
        };

        console.log("Sending mobile-optimized buttons:", JSON.stringify(buttonMsg, null, 2));
        const sentMsg = await zk.sendMessage(dest, buttonMsg, { quoted: ms });

        // 3. Fallback: List message if buttons fail
        setTimeout(async () => {
            const listMsg = {
                text: "Alternative menu:",
                footer: "Select from list",
                title: "MOBILE OPTIONS",
                buttonText: "OPEN MENU",
                sections: [{ 
                    title: "MAIN", 
                    rows: [
                        { title: "Option A", rowId: `${PREFIX}optA` },
                        { title: "Option B", rowId: `${PREFIX}optB` }
                    ] 
                }]
            };
            await zk.sendMessage(dest, listMsg, { quoted: ms });
        }, 5000);

        // Debug incoming messages
        zk.ev.on("messages.upsert", ({ messages }) => {
            const msg = messages[0];
            
            // Button response
            if (msg?.message?.buttonsResponseMessage) {
                console.log("BUTTON WORKED! Selected:", msg.message.buttonsResponseMessage.selectedButtonId);
                repondre(`🎉 You pressed: ${msg.message.buttonsResponseMessage.selectedButtonId}`);
            }
            
            // List response
            if (msg?.message?.listResponseMessage) {
                console.log("LIST WORKED! Selected:", msg.message.listResponseMessage.singleSelectReply.selectedRowId);
                repondre(`📋 You chose: ${msg.message.listResponseMessage.singleSelectReply.selectedRowId}`);
            }
        });

    } catch (error) {
        console.error("Mobile Test Error:", error);
        repondre("❌ Mobile test failed - Check logs");
    }
});

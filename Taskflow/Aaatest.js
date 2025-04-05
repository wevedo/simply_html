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
        console.log("=== STARTING BUTTON TEST ===");
        
        // Test 1: Verify basic message delivery
        console.log("[TEST 1] Sending regular text message...");
        const testMsg = await zk.sendMessage(dest, { 
            text: "🔍 PHASE 1: Can you see this text message?" 
        }, { quoted: ms });
        console.log("✅ Regular message sent with ID:", testMsg.key.id);

        // Test 2: Attempt template buttons (mobile-friendly)
        console.log("[TEST 2] Trying templateButtons format...");
        const templateMsg = {
            text: "📲 PHASE 2: TemplateButtons Test",
            footer: "Should show two buttons below",
            templateButtons: [
                {
                    index: 1,
                    quickReplyButton: { displayText: "TEMPLATE OPTION 1", id: "t1" }
                },
                {
                    index: 2,
                    quickReplyButton: { displayText: "TEMPLATE OPTION 2", id: "t2" }
                }
            ]
        };
        const sentTemplate = await zk.sendMessage(dest, templateMsg, { quoted: ms });
        console.log("ℹ️ TemplateButtons message payload:", JSON.stringify(templateMsg, null, 2));
        console.log("✅ Template message sent with ID:", sentTemplate.key.id);

        // Test 3: Attempt list message (fallback)
        console.log("[TEST 3] Trying list message format...");
        const listMsg = {
            text: "📋 PHASE 3: List Message Test",
            footer: "Should show selectable options",
            title: "TEST OPTIONS",
            buttonText: "CHOOSE",
            sections: [{
                title: "MAIN SECTION",
                rows: [
                    { title: "List Option 1", rowId: "l1" },
                    { title: "List Option 2", rowId: "l2" }
                ]
            }]
        };
        const sentList = await zk.sendMessage(dest, listMsg, { quoted: ms });
        console.log("✅ List message sent with ID:", sentList.key.id);

        // Debug response handling
        zk.ev.on("messages.upsert", ({ messages }) => {
            const msg = messages[0];
            console.log("\n=== INCOMING MESSAGE UPDATE ===");
            console.log("Message ID:", msg.key.id);
            console.log("Message Type:", Object.keys(msg.message)[0]);
            
            if (msg.key.id === sentTemplate.key.id) {
                console.log("🔔 This is our template button message");
                console.log("Current state:", msg.message?.templateMessage ? "RENDERED" : "NOT RENDERED");
            }

            if (msg.message?.templateButtonReplyMessage) {
                console.log("🎉 Template button click detected!");
                repondre(`Template button pressed: ${msg.message.templateButtonReplyMessage.selectedId}`);
            }
            
            if (msg.message?.listResponseMessage) {
                console.log("🎉 List selection detected!");
                repondre(`List option chosen: ${msg.message.listResponseMessage.singleSelectReply.selectedRowId}`);
            }
        });

        console.log("\n=== TEST SUMMARY ===");
        console.log("1. Regular text - Should appear");
        console.log("2. TemplateButtons - Mobile-friendly buttons");
        console.log("3. ListMessage - Fallback interactive menu");
        console.log("Waiting for interactions...");

    } catch (error) {
        console.error("‼️ CRITICAL TEST FAILURE:", error);
        repondre("❌ Button test crashed: " + error.message);
    }
});

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
        console.log("[DEBUG] Command received - Starting button test");
        
        // 1. Test basic message sending
        console.log("[DEBUG] Testing basic message send...");
        await zk.sendMessage(dest, { text: "PRE-TEST: Regular message" }, { quoted: ms });
        console.log("[DEBUG] Basic message sent successfully");

        // 2. Test button message structure
        const buttonMsg = {
            text: "🛠️ *BWM-XMD BUTTON TEST* 🛠️",
            footer: "Tap a button below",
            buttons: [
                { buttonId: `${PREFIX}bt1`, buttonText: { displayText: "TEST 1" } },
                { buttonId: `${PREFIX}bt2`, buttonText: { displayText: "TEST 2" } }
            ],
            headerType: 1
        };

        console.log("[DEBUG] Attempting to send button message:", JSON.stringify(buttonMsg, null, 2));
        
        // 3. Send button message
        const sentMsg = await zk.sendMessage(dest, buttonMsg, { quoted: ms });
        console.log("[DEBUG] Message sent with ID:", sentMsg.key.id);

        // 4. Verify message delivery
        zk.ev.on("messages.upsert", ({ messages }) => {
            const msg = messages[0];
            console.log("[DEBUG] Received message update:", msg.key.id);
            
            if (msg.key.id === sentMsg.key.id) {
                console.log("[DEBUG] Our button message confirmed delivered");
                console.log("MESSAGE CONTENT:", JSON.stringify(msg.message, null, 2));
            }

            if (msg?.message?.buttonsResponseMessage) {
                console.log("[DEBUG] Button click detected!");
                console.log("BUTTON RESPONSE:", JSON.stringify(msg.message.buttonsResponseMessage, null, 2));
                repondre(`✅ Received: ${msg.message.buttonsResponseMessage.selectedButtonId}`);
            }
        });

        // 5. Fallback testing
        setTimeout(async () => {
            console.log("[DEBUG] Running fallback tests...");
            
            // Test alternative button format
            const altMsg = {
                text: "ALTERNATE BUTTON TEST",
                templateButtons: [
                    { index: 1, quickReplyButton: { displayText: "ALT 1", id: `${PREFIX}alt1` }},
                    { index: 2, quickReplyButton: { displayText: "ALT 2", id: `${PREFIX}alt2` }}
                ]
            };
            
            await zk.sendMessage(dest, altMsg, { quoted: ms });
            console.log("[DEBUG] Alternate button message sent");
        }, 5000);

    } catch (error) {
        console.error("[DEBUG] FULL ERROR:", error);
        repondre(`❌ Test failed: ${error.message}`);
    }
});

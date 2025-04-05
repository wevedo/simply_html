const { adams } = require("../Ibrahim/adams");
const conf = require(__dirname + "/../config");
const PREFIX = conf.PREFIX;

adams({ 
    nomCom: "buttontest", 
    categorie: "Test",
    reaction: "🔘",
    nomFichier: __filename 
}, async (dest, zk, { ms, repondre }) => {
    try {
        // Create the button message properly
        const buttonMessage = {
            text: "🛠️ *BWM-XMD BUTTON TEST* 🛠️\n\nSelect an option:",
            footer: "Testing button functionality",
            buttons: [
                {
                    buttonId: `${PREFIX}test1`,
                    buttonText: { displayText: "🔊 Test Button 1" }
                },
                {
                    buttonId: `${PREFIX}test2`, 
                    buttonText: { displayText: "📸 Test Button 2" }
                }
            ],
            headerType: 1, // Important for button display
            viewOnce: true // Makes message disappear after selection
        };

        // Send the message
        await zk.sendMessage(dest, buttonMessage, { quoted: ms });

        // Button click handler
        zk.ev.on("messages.upsert", async ({ messages }) => {
            const msg = messages[0];
            if (!msg?.message?.buttonsResponseMessage) return;
            
            const selected = msg.message.buttonsResponseMessage.selectedButtonId;
            await repondre(`✅ You clicked: ${selected.replace(PREFIX, "")}`);
            
            // Optional: Send a visible confirmation
            await zk.sendMessage(dest, { 
                text: `You selected: ${selected.includes('test1') ? "Button 1" : "Button 2"}`,
                footer: "BWM-XMD Test"
            }, { quoted: msg });
        });

    } catch (error) {
        console.error("Button Test Error:", error);
        await repondre("❌ Button test failed");
    }
});

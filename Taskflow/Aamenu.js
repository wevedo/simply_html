const { adams } = require("../Ibrahim/adams");
const { generateWAMessageFromContent, proto } = require("@whiskeysockets/baileys");

adams({ nomCom: "abu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;

    // Simple test message with buttons
    const msg = {
        text: "TESTING BUTTONS - Please select an option:",
        footer: "Button Test",
        buttons: [
            { buttonId: 'btn1', buttonText: { displayText: 'Button 1' }, type: 1 },
            { buttonId: 'btn2', buttonText: { displayText: 'Button 2' }, type: 1 }
        ],
        headerType: 1
    };

    // Send the message with buttons
    await zk.sendMessage(dest, msg);

    // Button selection handler
    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];
        if (!message.message) return;

        // Check for button response
        if (message.message.buttonsResponseMessage) {
            const selectedId = message.message.buttonsResponseMessage.selectedButtonId;
            
            let replyText = "";
            if (selectedId === 'btn1') {
                replyText = "You pressed Button 1!";
            } else if (selectedId === 'btn2') {
                replyText = "You pressed Button 2!";
            }

            if (replyText) {
                await zk.sendMessage(dest, { text: replyText }, { quoted: message });
            }
        }
    });
});

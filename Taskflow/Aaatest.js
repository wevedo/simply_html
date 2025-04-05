const { adams } = require('../Ibrahim/adams');
const conf = require(__dirname + "/../config");
const PREFIX = conf.PREFIX;

adams({ 
    nomCom: "menu", 
    categorie: "General",
    reaction: "📱",
    nomFichier: __filename 
}, async (dest, zk, { ms, repondre }) => {
    try {
        // SIMPLE BUTTON THAT DEFINITELY WORKS
        await zk.sendMessage(dest, {
            text: "Tap a button below:",
            buttons: [
                {
                    buttonId: `${PREFIX}test`,
                    buttonText: { displayText: "👉 CLICK ME" },
                    type: 1
                }
            ]
        }, { quoted: ms });

    } catch (error) {
        console.error("Button Error:", error);
        await repondre("❌ Failed to send button");
    }
});

// HANDLER FOR THE BUTTON
adams({ nomCom: "test" }, async (dest, zk, { repondre }) => {
    await repondre("✅ Button worked! You clicked me!");
});

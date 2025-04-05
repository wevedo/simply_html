const { adams } = require("../Ibrahim/adams");
const { PREFIX } = require(__dirname + "/../config");
const fs = require("fs");

adams({ nomCom: "swipemenu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    const { ms, nomAuteurMessage } = commandeOptions;

    // Unique swipe-based menu
    const menuMsg = await zk.sendMessage(dest, {
        text: `🔄 *BWM-XMD SWIPE MENU* 🔄
        
╔══════❰ SWIPE ❱══════╗
║                      ║
║   ⇦ *LEFT*: Media   ║
║   ⇨ *RIGHT*: Group  ║
║   ⇧ *UP*: Tools     ║
║   ⇩ *DOWN*: Fun     ║
║                      ║
╚══════════════════════╝

Reply with:
• "L" ⇦ Media Tools
• "R" ⇨ Group Tools
• "U" ⇧ Utilities
• "D" ⇩ Fun Commands`,
        footer: `${nomAuteurMessage}'s Secret Navigation`
    });

    // Create reaction tracker
    const swipeHandler = async (reply) => {
        const direction = reply.message?.conversation?.toUpperCase();
        let commands = "";

        switch(direction) {
            case "L": // Media
                commands = `🎬 *Media Tools*\n` +
                          `${PREFIX}ytdl\n${PREFIX}igdl\n` +
                          `${PREFIX}sticker\n${PREFIX}tiktok`;
                break;
                
            case "R": // Group
                commands = `👥 *Group Tools*\n` +
                          `${PREFIX}add\n${PREFIX}kick\n` +
                          `${PREFIX}promote\n${PREFIX}demote`;
                break;
                
            case "U": // Tools
                commands = `🛠 *Utilities*\n` +
                          `${PREFIX}calc\n${PREFIX}trt\n` +
                          `${PREFIX}tts\n${PREFIX}tempmail`;
                break;
                
            case "D": // Fun
                commands = `🎉 *Fun Commands*\n` +
                          `${PREFIX}joke\n${PREFIX}meme\n` +
                          `${PREFIX}quote\n${PREFIX}fact`;
                break;
        }

        if (commands) {
            await zk.sendMessage(dest, {
                text: commands,
                footer: "Reply 'B' to go back"
            }, { quoted: reply });

            // Set up back navigation
            zk.ev.once("messages.upsert", backNav);
        }
    };

    const backNav = async (update) => {
        const msg = update.messages[0];
        if (msg.key.remoteJid === dest && 
            msg.message?.conversation?.toUpperCase() === "B") {
            await zk.sendMessage(dest, {
                text: "🔄 Returning to main menu...",
                footer: "Swipe again to continue"
            }, { quoted: ms });
            zk.ev.once("messages.upsert", swipeHandler);
        }
    };

    // Initial trigger
    zk.ev.once("messages.upsert", swipeHandler);
});

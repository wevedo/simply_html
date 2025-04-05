const { adams } = require("../Ibrahim/adams");
const conf = require(__dirname + "/../config");
const PREFIX = conf.PREFIX;

adams({ 
    nomCom: "mobilemenu", 
    categorie: "General",
    reaction: "📱",
    nomFichier: __filename 
}, async (dest, zk, { ms, repondre }) => {
    try {
        // Main menu message
        await zk.sendMessage(dest, {
            text: `📱 *BWM-XMD MOBILE MENU* 📱
            
1. 🎵 Media Commands
2. 👥 Group Tools
3. 🛠️ Utilities
4. 🤖 AI Features
            
Reply with the *number* of your choice`,
            footer: "Works on all devices",
            contextInfo: {
                mentionedJid: [ms.key.participant || ms.key.remoteJid],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: ms });

        // Command handler
        zk.ev.once("messages.upsert", async ({ messages }) => {
            const msg = messages[0];
            if (!msg || msg.key.remoteJid !== dest) return;
            
            const choice = msg.message?.conversation?.trim();
            let response = "";
            
            switch(choice) {
                case "1":
                    response = `🎵 *Media Commands*\n\n` +
                              `${PREFIX}play - Search music\n` +
                              `${PREFIX}ytdl - Download videos\n` +
                              `${PREFIX}igdl - Instagram downloader`;
                    break;
                    
                case "2":
                    response = `👥 *Group Tools*\n\n` +
                              `${PREFIX}add - Add members\n` +
                              `${PREFIX}kick - Remove members\n` +
                              `${PREFIX}promote - Make admin`;
                    break;
                    
                case "3":
                    response = `🛠️ *Utilities*\n\n` +
                              `${PREFIX}calc - Calculator\n` +
                              `${PREFIX}trt - Translator\n` +
                              `${PREFIX}tts - Text-to-speech`;
                    break;
                    
                case "4":
                    response = `🤖 *AI Features*\n\n` +
                              `${PREFIX}gpt - ChatGPT\n` +
                              `${PREFIX}dalle - Image generator\n` +
                              `${PREFIX}gemini - Google AI`;
                    break;
                    
                default:
                    return; // Ignore other messages
            }
            
            await repondre(response);
            
            // Reset menu after selection
            zk.ev.once("messages.upsert", async ({ messages }) => {
                if (messages[0]?.message?.conversation?.toLowerCase() === "menu") {
                    await zk.sendMessage(dest, { 
                        text: "Returning to main menu...\nType *.mobilemenu* again" 
                    });
                }
            });
        });

    } catch (error) {
        console.error("Mobile Menu Error:", error);
        repondre("❌ Menu system error. Please try again.");
    }
});

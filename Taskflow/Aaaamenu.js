const { adams } = require("../Ibrahim/adams");

adams({ 
    nomCom: "pollmenu", 
    categorie: "General",
    reaction: "📊",
    nomFichier: __filename 
}, async (chatId, zk, { repondre }) => {
    try {
        // Simple poll with command categories
        await zk.sendMessage(chatId, {
            poll: {
                name: "BWM-XMD Command Menu",
                values: [
                    "Media Downloaders",
                    "Group Tools", 
                    "Utilities",
                    "AI Features"
                ],
                selectableCount: 1
            }
        });

        // Handle poll responses
        zk.ev.on("messages.update", async (update) => {
            const pollUpdate = update.messages[0];
            if (!pollUpdate?.message?.pollUpdateMessage) return;
            
            // Get selected option
            const selected = pollUpdate.message.pollUpdateMessage.vote.selectedOptions[0];
            let commands = "";
            
            // Command lists
            switch(selected) {
                case 0: // Media
                    commands = `🎬 *Media Commands*\n\n` +
                              `• ytdl - YouTube downloader\n` +
                              `• igdl - Instagram downloader\n` +
                              `• tiktok - TikTok downloader`;
                    break;
                    
                case 1: // Group
                    commands = `👥 *Group Commands*\n\n` +
                              `• add - Add members\n` +
                              `• kick - Remove members\n` +
                              `• promote - Make admin`;
                    break;
                    
                case 2: // Tools
                    commands = `🛠 *Utilities*\n\n` +
                              `• calc - Calculator\n` +
                              `• trt - Translator\n` +
                              `• tts - Text-to-speech`;
                    break;
                    
                case 3: // AI
                    commands = `🤖 *AI Commands*\n\n` +
                              `• gpt - ChatGPT\n` +
                              `• dalle - Image generator\n` +
                              `• gemini - Google AI`;
                    break;
            }
            
            if (commands) {
                await repondre(`${commands}\n\n_Reply "menu" to return_`);
            }
        });
        
    } catch (error) {
        repondre(`❌ Error: ${error.message}`);
    }
});

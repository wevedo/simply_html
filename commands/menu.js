// commands/menu.js
const { createContext } = require("../utils/helper");

const COMMAND_CATEGORIES = [
    {
        name: "📥 Downloaders",
        commands: ["download", "get", "ytdl"]
    },
    {
        name: "🔍 Search",
        commands: ["search", "find", "lookup"]
    },
    {
        name: "⚙️ Settings",
        commands: ["set", "config", "toggle"]
    }
];

module.exports = {
    name: "menu",
    description: "Display command categories",
    reaction: "📜",
    
    async execute({ adams, chat, sender, message, commandRegistry }) {
        try {
            // Generate categorized command list
            const commandList = COMMAND_CATEGORIES.map(cat => {
                const cmds = cat.commands
                    .map(name => {
                        const cmd = commandRegistry.get(name);
                        return cmd ? `› ${cmd.name} - ${cmd.description}` : '';
                    })
                    .filter(Boolean)
                    .join('\n');
                
                return `${cat.name}\n${cmds}`;
            }).join('\n\n');

            // Prepare message with image and caption
            const BWM_XMD_TEXT = `
╭───※ ·❆· ※───╮
       BWM XMD
╰───※ ·❆· ※───╯

${commandList}

⚡ Version: 7.0.8
🔧 Prefix: ${process.env.PREFIX}
            `.trim();

            await adams.sendMessage(chat, {
                image: { 
                    url: 'https://files.catbox.moe/642del.jpeg' 
                },
                caption: BWM_XMD_TEXT,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363285388090068@newsletter",
                        newsletterName: "BWM-XMD",
                        serverMessageId: Math.floor(100000 + Math.random() * 900000)
                    }
                }
            }, { quoted: message });

        } catch (error) {
            console.error("Menu command error:", error);
            await adams.sendMessage(chat, {
                text: "Failed to load menu 🚨",
                ...createContext(sender)
            }, { quoted: message });
        }
    }
};

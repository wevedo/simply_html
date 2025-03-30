// commands/menu.js
const { createContext } = require("../utils/helper");

// Command categories configuration
const COMMAND_CATEGORIES = [
    {
        name: "📥 Downloaders",
        emoji: "📥",
        include: ["download", "get", "fetch", "save"]
    },
    {
        name: "🔍 Search",
        emoji: "🔍",
        include: ["search", "find", "lookup"]
    },
    {
        name: "⚙️ Settings",
        emoji: "⚙️",
        include: ["set", "config", "toggle"]
    },
    {
        name: "🎭 Core",
        emoji: "🎭",
        include: ["ping", "menu", "help"]
    },
    {
        name: "🛡️ Moderation",
        emoji: "🛡️",
        include: ["ban", "kick", "mute"]
    },
    {
        name: "🎉 Fun",
        emoji: "🎉",
        include: ["joke", "meme", "gif"]
    }
];

module.exports = {
    name: "menu",
    description: "Display categorized command list",
    reaction: "📜",
    category: "🎭 Core",
    
    async execute({ adams, chat, sender, message, commandRegistry, listenerManager }) {
        try {
            const menuMessage = `
╭─⊰ *BWM XMD COMMAND MENU* ⊱─○
│
│ ⚙️ ${formatSystemInfo(listenerManager)}
│
${generateCategorySections(commandRegistry)}
│
╰─⊰ *${process.env.BOT_NAME || "BWM-XMD"}* ⊱─○
            `.trim();

            await adams.sendMessage(chat, {
                text: menuMessage,
                ...createContext(sender, {
                    title: "Categorized Menu",
                    body: "Explore commands by category",
                    thumbnail: "https://files.catbox.moe/sd49da.jpg"
                })
            }, { quoted: message });

        } catch (error) {
            console.error("Menu command error:", error);
            await adams.sendMessage(chat, {
                text: "Failed to generate menu 🚨",
                ...createContext(sender)
            }, { quoted: message });
        }
    }
};

// Helper functions
function formatSystemInfo(listenerManager) {
    return `*System Status*
⌚ Uptime: ${formatUptime(process.uptime())}
📡 Listeners: ${listenerManager.activeListeners.size} active
💾 Memory: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)}MB`;
}

function generateCategorySections(registry) {
    return COMMAND_CATEGORIES.map(category => {
        const commands = Array.from(registry.values())
            .filter(cmd => 
                category.include.some(keyword => cmd.name.includes(keyword)) ||
                cmd.category === category.name
            )
            .map(cmd => formatCommand(cmd));

        return commands.length > 0 
            ? `├─⊰ ${category.emoji} ${category.name} ⊱─○\n${commands.join("\n")}`
            : "";
    }).filter(section => section !== "").join("\n│\n");
}

function formatCommand(cmd) {
    const adminBadge = cmd.adminOnly ? " 🔒" : "";
    return `│ ➤ ${cmd.name}${adminBadge}\n│    └ ${cmd.description}\n│    ╰ ${cmd.syntax || `Use: ${process.env.PREFIX}${cmd.name}`}`;
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
}

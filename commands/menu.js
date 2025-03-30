// commands/menu.js
const { createContext } = require("../utils/helper3");

module.exports = {
    name: "menu",
    description: "Display all available commands",
    reaction: "📜",
    
    async execute({ adams, chat, sender, message, commandRegistry, listenerManager }) {
        try {
            // Generate menu content
            const menuContent = generateMenuContent(commandRegistry, listenerManager);
            
            // Create formatted message
            const menuMessage = `
╭─⊰ *BWM XMD COMMAND MENU* ⊱─○
│
│ ⚙️ *System Status*
│ ⌚ Uptime: ${formatUptime(process.uptime())}
│ 🔊 Listeners: ${listenerManager.activeListeners.size} active
│
├─⊰ *Public Commands* ⊱─○
${generateCommandList(commandRegistry, false)}
│
├─⊰ *Admin Commands* ⊱─○
${generateCommandList(commandRegistry, true)}
│
├─⊰ *System Listeners* ⊱─○
${generateListenerList(listenerManager)}
│
╰─⊰ *${process.env.BOT_NAME || "BWM-XMD"}* ⊱─○
            `.trim();

            // Send menu with context
            await adams.sendMessage(chat, {
                text: menuMessage,
                ...createContext(sender, {
                    title: "Command Menu",
                    body: "Explore available features",
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
function generateCommandList(registry, isAdmin) {
    return Array.from(registry.values())
        .filter(cmd => isAdmin ? cmd.adminOnly : !cmd.adminOnly)
        .map(cmd => {
            const adminBadge = cmd.adminOnly ? " 🔒" : "";
            return `│ ➤ ${cmd.name}${adminBadge}\n│    └ ${cmd.description}\n│    ╰ ${cmd.syntax || `Use: ${process.env.PREFIX}${cmd.name}`}`;
        })
        .join("\n") || "│ ➤ No commands available";
}

function generateListenerList(listenerManager) {
    return Array.from(listenerManager.activeListeners.keys())
        .map(listener => `│ ➤ ${listener.replace('.js', '')}`)
        .join("\n") || "│ ➤ No active listeners";
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    return `${days}d ${hours}h`;
}

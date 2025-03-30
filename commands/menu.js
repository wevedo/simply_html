// commands/menu.js
const { createContext } = require("../utils/contextManager");

module.exports = {
    name: "menu",
    description: "Display all available commands",
    reaction: "📜",
    
    async execute({ adams, chat, sender, message, commandRegistry, listenerManager }) {
        try {
            // Generate formatted menu
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
    const commands = Array.from(registry.values())
        .filter(cmd => isAdmin ? cmd.adminOnly : !cmd.adminOnly)
        .map(cmd => {
            const adminBadge = cmd.adminOnly ? " 🔒" : "";
            return `│ ➤ ${cmd.name}${adminBadge}\n│    └ ${cmd.description}\n│    ╰ ${cmd.syntax || `Use: ${process.env.PREFIX}${cmd.name}`}`;
        });
    
    return commands.length > 0 ? commands.join("\n") : "│ ➤ No commands available";
}

function generateListenerList(listenerManager) {
    const listeners = Array.from(listenerManager.activeListeners.keys())
        .map(listener => `│ ➤ ${listener.replace('.js', '')}`);
    
    return listeners.length > 0 ? listeners.join("\n") : "│ ➤ No active listeners";
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
}

const { createContext } = require("../utils/helper");

module.exports = {
    name: "menu",
    description: "Display advanced command menu",
    reaction: "🌀",
    category: "🚀 System",
    
    async execute({ adams, chat, sender, message, commandRegistry, conf }) {
        try {
            // System Information
            const uptime = process.uptime();
            const memoryUsage = process.memoryUsage().rss / 1024 / 1024;           
            
            // Bot Configuration          
            const botMode = conf.MODE === "yes" ? "PUBLIC" : "PRIVATE";
            
            // Generate Header
            const header = `
╭───◇◆♢♤ BWM XMD ♤♢◆◇───╮
│
│ ✦ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: 7.0.8
│ ✦ 𝗣𝗿𝗲𝗳𝗶𝘅: [ ${conf.PREFIX} ]
│ ✦ 𝗠𝗼𝗱𝗲: ${botMode} 𓃠
│ ✦ 𝗦𝘁𝗮𝘁𝘂𝘀: ${botStatus} ${botStatus === "ONLINE" ? "🟢" : "🔴"}
│
│ ═══════◇◆◇═══════
│ 𝗦𝘆𝘀𝘁𝗲𝗺 𝗥𝗲𝘀𝗼𝘂𝗿𝗰𝗲𝘀
│ ◈ Uptime: ${formatUptime(uptime)}
│ ◈ Memory: ${memoryUsage.toFixed(1)}MB
│ ◈ CPU: ${os.cpus()[0].model.split('@')[0].trim()}
│
╰───◇◆♢♤ ${formatDate()} ♤♢◆◇───╯

${readMore}
            `.trim();

            // Generate Command Categories
            const categories = Array.from(commandRegistry.values())
                .reduce((acc, cmd) => {
                    const category = cmd.category || "⚙️ General";
                    acc[category] = (acc[category] || []).concat(cmd.name);
                    return acc;
                }, {});

            const categoryList = Object.entries(categories)
                .map(([cat, cmds]) => 
                    `┌─⊰ ${cat}\n${cmds.sort().map(c => `│ ➫ ${c}`).join("\n")}`
                ).join("\n\n");

            // Full Message
            const fullMessage = `${header}\n\n${categoryList}`;

            await adams.sendMessage(chat, {
                image: { 
                    url: 'https://files.catbox.moe/642del.jpeg',
                    caption: fullMessage
                },
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363285388090068@newsletter",
                        newsletterName: "BWM-XMD",
                        serverMessageId: Math.floor(100000 + Math.random() * 900000)
                    },
                    externalAdReply: {
                        title: "BWM XMD Command Center",
                        body: "Premium WhatsApp Bot Solution",
                        thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
                        mediaType: 1
                    }
                }
            }, { quoted: message });

        } catch (error) {
            console.error("Menu command error:", error);
            await adams.sendMessage(chat, {
                text: "Failed to generate enhanced menu 🚨",
                ...createContext(sender)
            }, { quoted: message });
        }
    }
};

// Helper functions
const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}D ${hours}H`;
};

const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    }).toUpperCase();
};

const readMore = `
╭───────────────◇◆◇───────────────╮
│      📖 𝗥𝗘𝗔𝗗 𝗠𝗢𝗥𝗘 𝗕𝗘𝗟𝗢𝗪 ▼      
╰───────────────◇◆◇───────────────╯
`.trim();

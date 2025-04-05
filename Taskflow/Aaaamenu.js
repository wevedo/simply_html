const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const s = require(__dirname + "/../config");

// Constants
const BWM_NEWSLETTER = {
    newsletterJid: "120363285388090068@newsletter",
    newsletterName: "BWM-XMD",
    serverMessageId: () => Math.floor(100000 + Math.random() * 900000)
};

const COMMON_CONTEXT = {
    mentionedJid: [s.OWNER_NUMBER],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: BWM_NEWSLETTER.newsletterJid,
        newsletterName: BWM_NEWSLETTER.newsletterName,
        serverMessageId: BWM_NEWSLETTER.serverMessageId()
    }
};

// Resource URLs
const RESOURCES = {
    audio: {
        baseUrl: "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic",
        files: Array.from({ length: 100 }, (_, i) => `sound${i + 1}.mp3`)
    },
    images: [
        "https://bwm-xmd-files.vercel.app/bwmxmd_lzgu8w.jpeg",
        "https://bwm-xmd-files.vercel.app/bwmxmd_9s9jr8.jpeg",
        // ... other image URLs
    ]
};

// Helper functions
const helpers = {
    getRandomAudio: () => RESOURCES.audio.files[Math.floor(Math.random() * RESOURCES.audio.files.length)],
    randomImage: () => RESOURCES.images[Math.floor(Math.random() * RESOURCES.images.length)],
    formatFooter: () => "\n\n©Sir Ibrahim Adams\n\nFollow our channel https://shorturl.at/z3b8v\n\n®2025 BWM XMD 🔥",
    getGreeting: () => {
        const hour = moment().hour();
        if (hour >= 5 && hour < 12) return "🌅 *Good Morning! Let's kickstart your day!*";
        if (hour >= 12 && hour < 18) return "☀️ *Good Afternoon! Stay productive*";
        if (hour >= 18 && hour < 22) return "🌆 *Good Evening! Time to relax!*";
        return "🌙 *Good Night! See you tomorrow!*";
    }
};

// Command storage
const commandStorage = {
    list: {},
    init(cmds) {
        cmds.forEach(cmd => {
            const category = cmd.categorie.toUpperCase();
            this.list[category] = this.list[category] || [];
            this.list[category].push(`🟢 ${cmd.nomCom}`);
        });
    }
};

adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, { nomAuteurMessage, ms, repondre, cm }) => {
    try {
        // Initialize commands if not already done
        if (Object.keys(commandStorage.list).length === 0) {
            commandStorage.init(cm);
        }

        // Get current time and stats
        moment.tz.setDefault(s.TZ || "Africa/Nairobi");
        const date = moment().format("DD/MM/YYYY");
        const time = moment().format("HH:mm:ss");
        const greeting = helpers.getGreeting();

        // Main menu message
        const menuImage = helpers.randomImage();
        const menuCaption = `
╭─❖ 𓆩 ⚡ 𓆪 ❖─╮
       𝐁𝐖𝐌 𝐗𝐌𝐃    
╰─❖ 𓆩 ⚡ 𓆪 ❖─╯  
╭─❖
┃🕵️ ᴜsᴇʀ ɴᴀᴍᴇ: ${nomAuteurMessage}
┃📅 ᴅᴀᴛᴇ: ${date}
┃⏰ ᴛɪᴍᴇ: ${time}
╰─❖

${greeting}

📜 *Reply with category number*

${Object.keys(categoryGroups).map((cat, i) => `${i+1} ${cat}`).join("\n")}
${helpers.formatFooter()}`;

        const sentMessage = await zk.sendMessage(dest, {
            image: { url: menuImage },
            caption: menuCaption,
            contextInfo: COMMON_CONTEXT
        }, { quoted: ms });

        // Category selection handler
        zk.ev.on("messages.upsert", async ({ messages }) => {
            const message = messages[0];
            if (!message?.message?.extendedTextMessage) return;
            
            const ctx = message.message.extendedTextMessage.contextInfo;
            if (!ctx || ctx.stanzaId !== sentMessage.key.id) return;

            const selectedIndex = parseInt(message.message.extendedTextMessage.text.trim());
            if (isNaN(selectedIndex)) return repondre("*❌ Invalid selection*");

            const categories = Object.keys(categoryGroups);
            if (selectedIndex < 1 || selectedIndex > categories.length) {
                return repondre("*❌ Invalid category number*");
            }

            const selectedCategory = categories[selectedIndex - 1];
            const commands = categoryGroups[selectedCategory]
                .flatMap(cat => commandStorage.list[cat] || [])
                .join("\n\n");

            await zk.sendMessage(dest, {
                image: { url: helpers.randomImage() },
                caption: `📜 *${selectedCategory}*\n\n${commands || "No commands found"}\n${helpers.formatFooter()}`,
                contextInfo: COMMON_CONTEXT
            }, { quoted: message });

            // Send random audio
            const audioUrl = `${RESOURCES.audio.baseUrl}/${helpers.getRandomAudio()}`;
            await zk.sendMessage(dest, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: true,
                contextInfo: COMMON_CONTEXT
            });
        });

    } catch (error) {
        console.error("Menu Error:", error);
        repondre("❌ Failed to load menu. Please try again.");
    }
});

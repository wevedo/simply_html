const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

moment.tz.setDefault("Africa/Nairobi");
const time = moment().format("HH:mm:ss");
const date = moment().format("DD/MM/YYYY");
const hour = moment().hour();

const themes = {
    morning: {
        greeting: "🌞 Good Morning!",
        image: "https://files.catbox.moe/nature_morning.webp",
    },
    afternoon: {
        greeting: "☀️ Good Afternoon!",
        image: "https://files.catbox.moe/nature_afternoon.webp",
    },
    evening: {
        greeting: "🌅 Good Evening!",
        image: "https://files.catbox.moe/galaxy_evening.webp",
    },
    night: {
        greeting: "🌌 Good Night!",
        image: "https://files.catbox.moe/galaxy_night.webp",
    }
};

// Select theme based on time
let selectedTheme = themes.night;
if (hour >= 0 && hour <= 11) selectedTheme = themes.morning;
else if (hour >= 12 && hour <= 16) selectedTheme = themes.afternoon;
else if (hour >= 17 && hour <= 20) selectedTheme = themes.evening;

adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { prefixe, nomAuteurMessage } = commandeOptions;
    const time = moment().format("HH:mm:ss");
    const date = moment().format("DD/MM/YYYY");

    // Prepare menu text
    let menuText = `🔷 〘 BWM XMD 〙 🔷\n`;
    menuText += `╔═══❖═══╗\n`;
    menuText += `┃ 👤 *User:* ${nomAuteurMessage}\n`;
    menuText += `┃ 💻 *Owner:* Ibrahim Adams\n`;
    menuText += `┃ 📅 *Date:* ${date}\n`;
    menuText += `┃ ⏰ *Time:* ${time}\n`;
    menuText += `╚═══❖═══╝\n\n`;

    menuText += `${selectedTheme.greeting}\n`;
    menuText += `⚡ *Stay Connected!*\n`;
    menuText += `${readmore}\n`;

    // Commands grouped by category
    menuText += `📂 *Commands:*`;
    const categories = ["GENERAL", "FUN", "TOOLS"];
    categories.forEach(cat => {
        menuText += `\n🔸 *${cat}*`;
        menuText += `\n   🔹 ${prefixe}menu`;
        menuText += `\n   🔹 ${prefixe}help`;
    });

    // Send the menu
    try {
        await zk.sendMessage(dest, {
            image: { url: selectedTheme.image },
            caption: menuText,
            forwardingScore: 999,
            isForwarded: true,
        });
    } catch (error) {
        console.error("Error while sending the menu:", error);
    }
});

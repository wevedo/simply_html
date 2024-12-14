const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const s = require(__dirname + "/../config");

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

// Dynamic themes based on time of day
const themes = {
    morning: {
        greeting: "🌅 Good Morning! Start Fresh ☕",
        image: "https://files.catbox.moe/7ux2i3.webp",
        quote: "Every sunrise is an invitation to brighten someone's day."
    },
    afternoon: {
        greeting: "☀️ Good Afternoon! Keep Going 💪",
        image: "https://files.catbox.moe/7ux2i3.webp",
        quote: "The journey of a thousand miles begins with a single step."
    },
    evening: {
        greeting: "🌆 Good Evening! Unwind and Relax ✨",
        image: "https://files.catbox.moe/7ux2i3.webp",
        quote: "Success is not final, failure is not fatal. It is the courage to continue that counts."
    },
    night: {
        greeting: "🌙 Good Night! Recharge for Tomorrow 🌌",
        image: "https://files.catbox.moe/7ux2i3.webp",
        quote: "Dream big. Tomorrow is another chance to chase your goals."
    }
};

// Background songs
const audioUrls = [
    "https://files.catbox.moe/fm0rvl.mp3",
    "https://files.catbox.moe/demlei.mp3",
    "https://files.catbox.moe/3ka4td.m4a",
    "https://files.catbox.moe/zm8edu.m4a",
    "https://files.catbox.moe/6ztgwg.mp3"
];

// Determine MIME type
const getMimeType = (url) => {
    return url.endsWith(".wav") ? "audio/wav" : "audio/mpeg";
};

// Fetch GitHub repository stats
const fetchGitHubStats = async () => {
    try {
        const repo = "Devibraah/BWM-XMD";
        const response = await axios.get(`https://api.github.com/repos/${repo}`);
        const forks = response.data.forks_count || 0;
        const stars = response.data.stargazers_count || 0;
        const totalUsers = (forks * 2) + (stars * 2);
        return { forks, stars, totalUsers };
    } catch (error) {
        console.error("Error fetching GitHub stats:", error);
        return { forks: 0, stars: 0, totalUsers: 0 };
    }
};

// Main menu command
adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { prefixe, nomAuteurMessage } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim/adams");
    let coms = {};

    // Organize commands by category
    cm.map((com) => {
        const categoryUpper = com.categorie.toUpperCase();
        if (!coms[categoryUpper]) coms[categoryUpper] = [];
        coms[categoryUpper].push(com.nomCom);
    });

    moment.tz.setDefault(s.TZ || "Africa/Nairobi");
    const time = moment().format("HH:mm:ss");
    const date = moment().format("DD/MM/YYYY");
    const hour = moment().hour();

    // Select theme based on time
    let selectedTheme = themes.night;
    if (hour >= 0 && hour <= 11) selectedTheme = themes.morning;
    else if (hour >= 12 && hour <= 16) selectedTheme = themes.afternoon;
    else if (hour >= 17 && hour <= 20) selectedTheme = themes.evening;

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    // Prepare command list for the menu
    let menuText = `╭━━━╮ *𝐁𝐖𝐌 𝐗𝐌𝐃*\n`;
    menuText += `┃👋 *Hey, ${nomAuteurMessage}!*\n`;
    menuText += `┃💻 *Owner:* Ibrahim Adams\n`;
    menuText += `┃📅 *Date:* ${date}\n`;
    menuText += `┃⏰ *Time:* ${time}\n`;
    menuText += `┃👥 *Users:* ${formattedTotalUsers}\n`;
    menuText += `╰━━━╯\n\n`;

    menuText += `🌟 ${selectedTheme.greeting}\n`;
    menuText += `⭐ *Quote of the Day:* "${selectedTheme.quote}"\n`;
    menuText += `${readmore}\n`;

    // Categorize and list commands
    menuText += `*Available Commands:*\n`;
    const sortedCategories = Object.keys(coms).sort();
    sortedCategories.forEach((cat) => {
        menuText += `\n📚 *${cat}*\n`;
        coms[cat].forEach((cmd) => {
            menuText += `- ${prefixe}${cmd}\n`;
        });
    });

    // Randomly select an audio file
    const randomAudio = audioUrls[Math.floor(Math.random() * audioUrls.length)];

    // Send the stylish menu
    try {
        await zk.sendMessage(dest, {
            image: { url: selectedTheme.image },
            caption: menuText,
        });

        // Play background audio
        await zk.sendMessage(dest, {
            audio: { url: randomAudio },
            mimetype: getMimeType(randomAudio),
            ptt: false, // Not a voice note
        });
    } catch (error) {
        console.error("Error while sending the menu:", error);
    }
});

       
                

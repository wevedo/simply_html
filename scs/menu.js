const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const s = require(__dirname + "/../config");

// Unicode separator for cleaner layout
const separator = "\n━━━━━━━━━━━━━━\n";

// Stylish greeting fonts
const coolFonts = {
    morning: ["🌅 Rise and Shine ✨"],
    afternoon: ["🌞 Good Afternoon ✨"],
    evening: ["🌌 Good Evening 🌟"],
    night: ["🌙 Sleep Tight 🌙"],
};

// GitHub repo stats function
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

// Audio URLs for background music
const audioUrls = [
    "https://files.catbox.moe/fm0rvl.mp3",
    "https://files.catbox.moe/demlei.mp3",
    "https://files.catbox.moe/3ka4td.m4a",
    "https://files.catbox.moe/zm8edu.m4a",
    "https://files.catbox.moe/6ztgwg.mp3",
];

// New menu images
const menuImages = [
    "https://files.catbox.moe/7ux2i3.webp",
    "https://files.catbox.moe/mphnzn.webp",
    "https://files.catbox.moe/s21y92.webp",
];

const getMimeType = (url) => (url.endsWith(".wav") ? "audio/wav" : "audio/mpeg");

// Main menu command
adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { repondre, prefixe, nomAuteurMessage } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim/adams");
    let coms = {};

    // Organize commands
    cm.map((com) => {
        const categoryUpper = com.categorie.toUpperCase();
        if (!coms[categoryUpper]) coms[categoryUpper] = [];
        coms[categoryUpper].push(com.nomCom);
    });

    moment.tz.setDefault(s.TZ || "Africa/Nairobi");
    const temps = moment().format("HH:mm:ss");
    const date = moment().format("DD/MM/YYYY");
    const hour = moment().hour();

    // Greeting logic
    const getRandomGreeting = (greetings) => greetings[Math.floor(Math.random() * greetings.length)];
    let greeting = coolFonts.night;
    if (hour >= 0 && hour <= 11) {
        greeting = getRandomGreeting(coolFonts.morning);
    } else if (hour >= 12 && hour <= 16) {
        greeting = getRandomGreeting(coolFonts.afternoon);
    } else if (hour >= 16 && hour <= 21) {
        greeting = getRandomGreeting(coolFonts.evening);
    }

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    // Prepare command list
    let commandList = "";
    const sortedCategories = Object.keys(coms).sort();
    sortedCategories.forEach((cat) => {
        commandList += `${separator}🔹 *${cat}* 🔹${separator}`;
        coms[cat].forEach((cmd) => {
            commandList += `- ${cmd}\n`;
        });
    });

    // Randomly select menu image and audio
    const randomImage = menuImages[Math.floor(Math.random() * menuImages.length)];
    const randomAudio = audioUrls[Math.floor(Math.random() * audioUrls.length)];

    try {
        // Menu with dynamic quick action buttons
        await zk.sendMessage(dest, {
            caption: `
╭━━━╮ *𝐁𝐖𝐌 𝐗𝐌𝐃*
┃🙋‍♀️ *Hello*: ${nomAuteurMessage}
┃💻 *Owner*: Ibrahim Adams
┃📅 *Date*: ${date}
┃⏰ *Time*: ${temps}
┃👥 *Users*: ${formattedTotalUsers}
╰━━━╯

${greeting}
${separator}
*Available Commands:*
${commandList}

✨ *Enjoy a seamless experience with BWM-XMD!* ✨
            `,
            image: { url: randomImage },
            footer: "🔗 Powered by BWM-XMD",
            templateButtons: [
                { index: 1, quickReplyButton: { displayText: "📄 Info", id: `${prefixe}info` } },
                { index: 2, quickReplyButton: { displayText: "ℹ️ Help", id: `${prefixe}help` } },
                { index: 3, quickReplyButton: { displayText: "ℹ️ About Us", id: `${prefixe}about` } },
            ],
        });

        // Play audio background
        await zk.sendMessage(dest, {
            audio: { url: randomAudio },
            mimetype: getMimeType(randomAudio),
            ptt: true,
        });
    } catch (error) {
        console.error("Error while sending the menu:", error);
    }
});

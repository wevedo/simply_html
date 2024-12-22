const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const s = require(__dirname + "/../config");

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

// Dynamic greetings
const greetings = {
    morning: "🌄 Good Morning! Let's kickstart your day!",
    afternoon: "☀️ Good Afternoon! Stay productive!",
    evening: "🌆 Good Evening! Time to relax!",
    night: "🌙 Good Night! See you tomorrow!",
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

// Menu assets
const menuImages = [
    "https://files.catbox.moe/z0k3jv.jpg",
    "https://files.catbox.moe/z0k3jv.jpg",
    "https://files.catbox.moe/z0k3jv.jpg",
];
const audioUrls = [
    "https://files.catbox.moe/p9mww2.mp3",
    "https://files.catbox.moe/4rnxdx.mp3",
    "https://files.catbox.moe/sila3e.mp3",
];

// Determine MIME type
const getMimeType = (url) => (url.endsWith(".wav") ? "audio/wav" : "audio/mpeg");

// Main menu command
adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { nomAuteurMessage } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim/adams");
    let coms = {};

    // Organize commands by category
    cm.map((com) => {
        const categoryUpper = com.categorie.toUpperCase();
        if (!coms[categoryUpper]) coms[categoryUpper] = [];
        coms[categoryUpper].push(com.nomCom);
    });

    moment.tz.setDefault(s.TZ || "Africa/Nairobi");
    const date = moment().format("DD/MM/YYYY");
    const time = moment().format("HH:mm:ss");
    const hour = moment().hour();

    // Determine greeting based on time
    let greeting = greetings.night;
    if (hour >= 5 && hour < 12) greeting = greetings.morning;
    else if (hour >= 12 && hour < 18) greeting = greetings.afternoon;
    else if (hour >= 18 && hour <= 22) greeting = greetings.evening;

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    // Prepare command list with readmore after each category
    let commandList = "";
    const sortedCategories = Object.keys(coms).sort();
    sortedCategories.forEach((cat) => {
        commandList += `\n📂 *${cat}*:\n\n`;
        let categoryCommands = coms[cat];
        for (let i = 0; i < categoryCommands.length; i++) {
            commandList += `🟢 ${categoryCommands[i]}   `;
            if ((i + 1) % 3 === 0 || i === categoryCommands.length - 1) commandList += `\n`;
        }
        commandList += `\n${readmore}`; // Add readmore after each category
    });

    // Select random assets
    const randomImage = menuImages[Math.floor(Math.random() * menuImages.length)];
    const randomAudio = audioUrls[Math.floor(Math.random() * audioUrls.length)];

    // Send menu
    try {
        await zk.sendMessage(dest, {
            image: { url: randomImage },
            caption: `
╭━━━╮ 
┃  𝐁𝐖𝐌 𝐗𝐌𝐃 𝐌𝐄𝐍𝐔
┃ 📅 *Date*: ${date}
┃ ⏰ *Time*: ${time}
┃ 👥 *Users*: ${formattedTotalUsers}
╰━━━╯

${greeting}

> ©Ibrahim Adams
${commandList}
`,
            contextInfo: {
                externalAdReply: {
                    title: "𝗕𝗪𝗠 𝗫𝗠𝗗 𝗖𝗵𝗮𝗻𝗻𝗲𝗹",
                    body: "Tap here to join our official channel!",
                    thumbnailUrl: "https://files.catbox.moe/7ux2i3.webp",
                    sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                    showAdAttribution: true,
                },
            },
        });

        // Send audio for ambiance
        await zk.sendMessage(dest, {
            audio: { url: randomAudio },
            mimetype: getMimeType(randomAudio),
            ptt: true,
        });
    } catch (error) {
        console.error("Error while sending the menu:", error);
    }
});

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
        const repo = "devibraah/BWM-XMD";
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

// Menu images and thumbnail URLs
const menuImages = [
    "https://files.catbox.moe/13i93y.jpeg",
    "https://files.catbox.moe/2696sn.jpeg",
    "https://files.catbox.moe/soj3q4.jpeg",
    "https://files.catbox.moe/bddwnw.jpeg",
    "https://files.catbox.moe/fwy93d.jpeg",
    "https://files.catbox.moe/dd93hl.jpg",
    "https://files.catbox.moe/omgszj.jpg",
    "https://files.catbox.moe/sf6xgk.jpg",
    "https://files.catbox.moe/nwvoq3.jpg",
    "https://files.catbox.moe/x9cezb.jpg",
];

const randomImage = () => menuImages[Math.floor(Math.random() * menuImages.length)];

// Audio URLs
const audioUrls = [
    "https://files.catbox.moe/p9mww2.mp3",
    "https://files.catbox.moe/4rnxdx.mp3",
    "https://files.catbox.moe/sila3e.mp3",
];

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

        // Prepare command list with readmore before specific categories
    let commandList = "";
    const sortedCategories = Object.keys(coms).sort();
    sortedCategories.forEach((cat) => {
        if (cat === "ABU") {
            // Apply arrow with readmore before "Abu"
            commandList += `╰••┈••➤ ${readmore}\n📂 *${cat}*:\n\n`;
        } else if (cat.toLowerCase().includes("download") || cat.toLowerCase().includes("github")) {
            commandList += `${readmore}\n📂 *${cat}*:\n\n`;
        } else {
            commandList += `\n📂 *${cat}*:\n\n`;
        }
        
        let categoryCommands = coms[cat];
        for (let i = 0; i < categoryCommands.length; i++) {
            commandList += `🟢 ${categoryCommands[i]}   `;
            if ((i + 1) % 3 === 0 || i === categoryCommands.length - 1) commandList += `\n`;
        }
        commandList += `\n`; // Add spacing after commands
    });

    // Select assets
    const image = randomImage();
    const image1 = randomImage();
    const audio = audioUrls[Math.floor(Math.random() * audioUrls.length)];

    const menuType = s.MENUTYPE || (Math.random() < 0.5 ? "1" : "2"); // Randomly pick if blank

    const footer = "\n\n®2025 ʙᴡᴍ xᴍᴅ";

    try {
        if (menuType === "1") {
            // Menu Type 1
            await zk.sendMessage(dest, {
                image: { url: image1 },
                caption: `
╭┈┈┈┈┈╮
│  ʙᴡᴍ xᴍᴅ ɴᴇxᴜs
├┈┈┈┈➤
│ 🔱 Date: ${date}
│ ⏳ Time: ${time}
│ ⚡ Users: 1${formattedTotalUsers}
╰┈┈┈┈┈╯
${greeting}

> ©Ibrahim Adams\n\n
${commandList}${footer}
`,
                contextInfo: {
                    externalAdReply: {
                        title: "𝗕𝗪𝗠 𝗫𝗠𝗗",
                        body: "Join the official channel!",
                        thumbnailUrl: image,
                        sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                        showAdAttribution: true,
                        renderLargerThumbnail: false, // For Menu Type 1
                    },
                },
            });
        } else {
            // Menu Type 2
            await zk.sendMessage(dest, {
                image: { url: image1 },
                caption: `
╭───❖
┃ ʙᴡᴍ xᴍᴅ ɴᴇxᴜs
┃📅 Date: ${date}
┃⏰ Time: ${time}
┃👥 Users: 1${formattedTotalUsers}
╰───❖
${greeting}

> ©Ibrahim Adams\n\n
${commandList}${footer}
`,
                contextInfo: {
                externalAdReply: {
                    title: "𝗕𝗪𝗠 𝗫𝗠𝗗",
                    body: "Tap here to join our official channel!",
                    thumbnailUrl: image,
                    sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                    showAdAttribution: true,
                    mediaType: 1,
                    renderLargerThumbnail: true, 
                    },
                },
            });
        }

        // Send audio
        await zk.sendMessage(dest, {
            audio: { url: audio },
            mimetype: getMimeType(audio),
            ptt: true,
        });
    } catch (error) {
        console.error("Error sending menu:", error);
    }
});

/**

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
        const repo = "devibraah/BWM-XMD";
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

// Menu images and thumbnail URLs (Sema images)
const semaImages = [
    "https://files.catbox.moe/13i93y.jpeg",
    "https://files.catbox.moe/2696sn.jpeg",
    "https://files.catbox.moe/soj3q4.jpeg",
    "https://files.catbox.moe/bddwnw.jpeg",
    "https://files.catbox.moe/fwy93d.jpeg",
    "https://files.catbox.moe/dd93hl.jpg",
    "https://files.catbox.moe/omgszj.jpg",
    "https://files.catbox.moe/sf6xgk.jpg",
    "https://files.catbox.moe/nwvoq3.jpg",
    "https://files.catbox.moe/x9cezb.jpg",
];

// Select random image for both `menuImages` and `thumbnailUrl`
const randomSemaImage = () => semaImages[Math.floor(Math.random() * semaImages.length)];

// Audio URLs
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

    // Prepare command list with readmore before specific categories
    let commandList = "";
    const sortedCategories = Object.keys(coms).sort();
    sortedCategories.forEach((cat) => {
        if (cat === "ABU") {
            // Apply arrow with readmore before "Abu"
            commandList += `╰••┈••➤ ${readmore}\n📂 *${cat}*:\n\n`;
        } else if (cat.toLowerCase().includes("download") || cat.toLowerCase().includes("github")) {
            commandList += `${readmore}\n📂 *${cat}*:\n\n`;
        } else {
            commandList += `\n📂 *${cat}*:\n\n`;
        }
        
        let categoryCommands = coms[cat];
        for (let i = 0; i < categoryCommands.length; i++) {
            commandList += `🟢 ${categoryCommands[i]}   `;
            if ((i + 1) % 3 === 0 || i === categoryCommands.length - 1) commandList += `\n`;
        }
        commandList += `\n`; // Add spacing after commands
    });

    // Select random assets
    const randomImage = randomSemaImage(); // Random menu image
    const thumbnailUrl = randomSemaImage(); // Random thumbnail image
    const randomAudio = audioUrls[Math.floor(Math.random() * audioUrls.length)];

    // Footer to be added at the end
    const footer = "\n\n®2025 ʙᴡᴍ xᴍᴅ";

    // Send menu
    try {
        await zk.sendMessage(dest, {
            image: { url: randomImage },
            caption: `
╭┈┈┈┈┈╮
│  ʙᴡᴍ xᴍᴅ ɴᴇxᴜs
├┈┈┈┈➤
│ 🔱 Date: ${date}
│ ⏳ Time: ${time}
│ ⚡ Users: 1${formattedTotalUsers}
╰┈┈┈┈┈╯
${greeting}

> ©Ibrahim Adams\n\n
${commandList}${footer}
`,
            contextInfo: {
                externalAdReply: {
                    title: "𝗕𝗪𝗠 𝗫𝗠𝗗",
                    body: "Tap here to join our official channel!",
                    thumbnailUrl: thumbnailUrl,
                    sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                    showAdAttribution: true,
                    mediaType: 1,
                    renderLargerThumbnail: true, 
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
});*/

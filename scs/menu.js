const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const s = require(__dirname + "/../config");

// Configuration constants
const MORE_CHAR = String.fromCharCode(8206);
const READ_MORE = MORE_CHAR.repeat(4001);
const TIME_ZONE = s.TZ || "Africa/Nairobi";
const BOT_VERSION = s.VERSION || "2.5.0";

// UI Constants
const BORDER_TOP = "╭─────────⭒";
const BORDER_BOTTOM = "╰─────────⭒";
const SECTION_DIVIDER = "├─────────✦";
const COMMAND_BULLET = "◈";
const CATEGORY_ICON = "▣";
const PROGRESS_BAR = "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰";

// Dynamic Content URLs
const GITHUB_MUSIC_URL = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";
const MENU_IMAGES = [
    "https://files.catbox.moe/13i93y.jpeg",
    "https://files.catbox.moe/2696sn.jpeg",
    // ... keep other image URLs ...
];

// Audio Configuration
const AUDIO_FILES = Array.from({ length: 161 }, (_, i) => `sound${i + 1}.mp3`);

// Helpers
const getRandomImage = () => MENU_IMAGES[Math.floor(Math.random() * MENU_IMAGES.length)];
const getRandomAudio = () => AUDIO_FILES[Math.floor(Math.random() * AUDIO_FILES.length)];
const getMimeType = (url) => url.endsWith(".wav") ? "audio/wav" : "audio/mpeg";

// GitHub Stats Fetcher
const fetchGitHubStats = async () => {
    try {
        const response = await axios.get("https://api.github.com/repos/devibraah/BWM-XMD");
        return {
            forks: response.data.forks_count || 0,
            stars: response.data.stargazers_count || 0,
            totalUsers: (response.data.forks_count * 2) + (response.data.stargazers_count * 2)
        };
    } catch (error) {
        console.error("GitHub API Error:", error.message);
        return { forks: 0, stars: 0, totalUsers: 0 };
    }
};

// Dynamic Greeting Generator
const getGreeting = () => {
    const hour = moment().tz(TIME_ZONE).hour();
    if (hour >= 5 && hour < 12) return "🌄 Good Morning, ready to conquer the day?";
    if (hour >= 12 && hour < 17) return "☀️ Good Afternoon, stay productive!";
    if (hour >= 17 && hour < 21) return "🌇 Good Evening, time to unwind!";
    return "🌌 Good Night, recharge for tomorrow!";
};

// Main Menu Command
adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, { nomAuteurMessage }) => {
    try {
        // Setup
        const cm = require(__dirname + "/../Ibrahim/adams").cm;
        const coms = {};
        cm.forEach(cmd => {
            const category = cmd.categorie.toUpperCase();
            coms[category] = coms[category] || [];
            coms[category].push(cmd.nomCom);
        });

        // Dynamic Content
        const now = moment().tz(TIME_ZONE);
        const { totalUsers } = await fetchGitHubStats();
        const userCount = (totalUsers + 1500).toLocaleString(); // Base users

        // Header Construction
        const header = `${BORDER_TOP}
   𝗕𝗪𝗠 𝗫𝗠𝗗 𝗩${BOT_VERSION}
${SECTION_DIVIDER}
│  👤 𝗨𝘀𝗲𝗿: ${nomAuteurMessage}
│  📅 ${now.format("DD/MM/YYYY")} | 🕒 ${now.format("HH:mm")}
│  👥 𝗨𝘀𝗲𝗿𝘀: ${userCount}
│  ${PROGRESS_BAR}
${SECTION_DIVIDER}`;

        // Command List Builder
        let commandDisplay = "";
        Object.keys(coms).sort().forEach(category => {
            commandDisplay += `\n│  ${CATEGORY_ICON} ${category}\n│  ────────────\n│  `;
            
            let line = "";
            coms[category].forEach((cmd, index) => {
                const formatted = `${COMMAND_BULLET} ${cmd}`;
                if ((line + formatted).length > 28) { // WhatsApp safe width
                    commandDisplay += `${line}\n│  `;
                    line = formatted;
                } else {
                    line += `${formatted}${index < coms[category].length-1 ? "   " : ""}`;
                }
            });
            
            commandDisplay += `${line}\n${SECTION_DIVIDER}`;
        });

        // Footer Section
        const footer = `${BORDER_BOTTOM}
📢 𝗨𝗽𝗱𝗮𝘁𝗲𝘀: ${s.CHANNEL_LINK || "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y"}
🔧 𝗦𝘂𝗽𝗽𝗼𝗿𝘁: ${s.SUPPORT_GROUP || "https://chat.whatsapp.com/..."}

⚡ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗜𝗯𝗿𝗮𝗵𝗶𝗺 𝗔𝗱𝗮𝗺𝘀 • 𝗫𝗠𝗗 𝗧𝗲𝗰𝗵 𝟮𝟬𝟮𝟰`;

        // Send Menu
        const menuImage = getRandomImage();
        await zk.sendMessage(dest, {
            image: { url: menuImage },
            caption: `${header}${commandDisplay}
${getGreeting()}
${READ_MORE}
${footer}`,
            contextInfo: {
                quotedMessage: { conversation: "🚀 Unleash WhatsApp's Full Potential!" },
                externalAdReply: {
                    title: `BWM XMD v${BOT_VERSION}`,
                    body: "⚡ Most Advanced WhatsApp Bot | 99.98% Uptime",
                    thumbnailUrl: menuImage,
                    sourceUrl: s.CHANNEL_LINK,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

        // Send Audio
        const audioUrl = `${GITHUB_MUSIC_URL}/${getRandomAudio()}`;
        await zk.sendMessage(dest, {
            audio: { url: audioUrl },
            mimetype: getMimeType(audioUrl),
            ptt: true
        });

    } catch (error) {
        console.error("Menu Generation Error:", error);
        await zk.sendMessage(dest, { 
            text: "🚨 Error generating menu. Please try again later!"
        });
    }
});







/*
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

// GitHub audio files
const githubRawBaseUrl = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";
const audioFiles = Array.from({ length: 161 }, (_, i) => `sound${i + 1}.mp3`);
const getRandomAudio = () => audioFiles[Math.floor(Math.random() * audioFiles.length)];

const getMimeType = (url) => (url.endsWith(".wav") ? "audio/wav" : "audio/mpeg");

// Menu images and thumbnail URLs
const menuImages = [
    "https://files.catbox.moe/13i93y.jpeg",
    "https://files.catbox.moe/2696sn.jpeg",
    "https://files.catbox.moe/soj3q4.jpeg",
    "https://files.catbox.moe/bddwnw.jpeg",
    "https://files.catbox.moe/f6zee8.jpeg",
    "https://files.catbox.moe/dd93hl.jpg",
    "https://files.catbox.moe/omgszj.jpg",
    "https://files.catbox.moe/sf6xgk.jpg",
    "https://files.catbox.moe/nwvoq3.jpg",
    "https://files.catbox.moe/040de7.jpeg",
    "https://files.catbox.moe/3qkejj.jpeg",
];
const randomImage = () => menuImages[Math.floor(Math.random() * menuImages.length)];

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
            commandList += `╰••┈••➤ ${readmore}\n🗂 *${cat}*:\n\n`;
        } else if (cat.toLowerCase().includes("download") || cat.toLowerCase().includes("github")) {
            commandList += `${readmore}\n📃 *${cat}*:\n\n`;
        } else {
            commandList += `\n📜 *${cat}*:\n\n`;
        }

        let categoryCommands = coms[cat];
        for (let i = 0; i < categoryCommands.length; i++) {
            commandList += `🟢 ${categoryCommands[i]}\n`; // Display commands in a list
        }
        commandList += `\n`;
    });

    // Select assets
    const image = randomImage();
    const image1 = randomImage();
    const randomAudioFile = getRandomAudio();
    const audioUrl = `${githubRawBaseUrl}/${randomAudioFile}`;

    const menuType = s.MENUTYPE || (Math.random() < 0.5 ? "1" : "2"); // Randomly pick if blank

    const footer = "\n\n®2025 ʙᴡᴍ xᴍᴅ";

    try {
        // Send menu based on the requested category
        const requestedCategory = commandeOptions.category || 'General'; // Get the requested category or default to 'General'

        if (menuType === "1") {
            // Menu Type 1 (For all categories or specific category)
            await zk.sendMessage(dest, {
                image: { url: image1 },
                caption: `
╭┈┈┈┈┈╮
│  ʙᴡᴍ xᴍᴅ ɴᴇxᴜs
├┈┈┈┈•➤
│ 🕵️ ᴜsᴇʀ ɴᴀᴍᴇ: ${nomAuteurMessage}
│ 📆 ᴅᴀᴛᴇ: ${date}
│ ⏰ ᴛɪᴍᴇ: ${time}
│ 👪 ʙᴡᴍ ᴜsᴇʀs: 1${formattedTotalUsers}
╰┈┈┈┈┈╯
${greeting}

> ©Ibrahim Adams

${commandList}${footer}
`,
                contextInfo: {
                    quotedMessage: {
                        conversation: "ʙᴡᴍ xᴍᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs 💫",
                    },
                    externalAdReply: {
                        title: "𝗕𝗪𝗠 𝗫𝗠𝗗",
                        body: "Tap here to Join our official channel!",
                        thumbnailUrl: image,
                        sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                        showAdAttribution: true,
                        renderLargerThumbnail: false,
                    },
                },
            });
        } else {
            // Menu Type 2 (For all categories or specific category)
            await zk.sendMessage(dest, {
                image: { url: image1 },
                caption: `
╭───❖
┃🚀 ʙᴏᴛ ɴᴀᴍᴇ: ʙᴡᴍ xᴍᴅ
┃🕵️ ᴜsᴇʀ ɴᴀᴍᴇ: ${nomAuteurMessage}
┃📅 ᴅᴀᴛᴇ: ${date}
┃⏰ ᴛɪᴍᴇ: ${time}
┃👥 ʙᴡᴍ ᴜsᴇʀs: 1${formattedTotalUsers}
╰───❖
${greeting}

> ©Ibrahim Adams

${commandList}${footer}
`,
                contextInfo: {
                    quotedMessage: {
                        conversation: "ʙᴡᴍ xᴍᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs 💫",
                    },
                    externalAdReply: {
                        title: "𝗕𝗪𝗠 𝗫𝗠𝗗",
                        body: "Tap here to Join our official channel!",
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
            audio: { url: audioUrl },
            mimetype: getMimeType(audioUrl),
            ptt: true,
        });
    } catch (error) {
        console.error("Error sending menu:", error);
    }
});
*/

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

    cm.map((com) => {
        const categoryUpper = com.categorie.toUpperCase();
        if (!coms[categoryUpper]) coms[categoryUpper] = [];
        coms[categoryUpper].push(com.nomCom);
    });

    moment.tz.setDefault(s.TZ || "Africa/Nairobi");
    const date = moment().format("DD/MM/YYYY");
    const time = moment().format("HH:mm:ss");
    const hour = moment().hour();

    let greeting = greetings.night;
    if (hour >= 5 && hour < 12) greeting = greetings.morning;
    else if (hour >= 12 && hour < 18) greeting = greetings.afternoon;
    else if (hour >= 18 && hour <= 22) greeting = greetings.evening;

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    let commandList = "";
    const sortedCategories = Object.keys(coms).sort();
    sortedCategories.forEach((cat) => {
        if (cat === "ABU") {
            commandList += `╰••┈••➤ ${readmore}\n🗂 *${cat}*:\n\n`;
        } else {
            commandList += `\n📜 *${cat}*:\n\n`;
        }

        let categoryCommands = coms[cat];
        for (let i = 0; i < categoryCommands.length; i++) {
            commandList += `🟢 ${categoryCommands[i]}\n`;
        }
        commandList += `\n`;
    });

    const image = randomImage();
    const randomAudioFile = getRandomAudio();
    const audioUrl = `${githubRawBaseUrl}/${randomAudioFile}`;

    const menuType = s.MENUTYPE || (Math.random() < 0.5 ? "1" : "2");
    const footer = "\n\n®2025 ʙᴡᴍ xᴍᴅ";

    try {
        if (menuType === "1") {
            await zk.sendMessage(dest, {
                image: { url: image },
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
            });
        } else {
            await zk.sendMessage(dest, {
                image: { url: image },
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

${footer}
`,
                buttons: [
                    { buttonId: "commands", buttonText: { displayText: "📜 Commands" }, type: 1 },
                    { buttonId: "ping", buttonText: { displayText: "📡 Ping" }, type: 1 },
                    { buttonId: "repo", buttonText: { displayText: "📂 Bot Repo" }, type: 1 },
                    { buttonId: "alive", buttonText: { displayText: "💡 Alive" }, type: 1 },
                    { buttonId: "channel", buttonText: { displayText: "📢 WhatsApp Channel" }, type: 1 },
                ],
                headerType: 4,
            });
        }

        await zk.sendMessage(dest, {
            audio: { url: audioUrl },
            mimetype: getMimeType(audioUrl),
            ptt: true,
        });

    } catch (error) {
        console.error("Error sending menu:", error);
    }
});

// Button Response
adams({ nomCom: "commands" }, async (dest, zk) => {
    await zk.sendMessage(dest, { text: "📜 *Commands List*\n\n" + commandList });
});

adams({ nomCom: "ping" }, async (dest, zk) => {
    const start = Date.now();
    await zk.sendMessage(dest, { text: "🏓 Checking Ping..." });
    const end = Date.now();
    await zk.sendMessage(dest, { text: `🏓 Pong! Response time: *${end - start}ms*` });
});

adams({ nomCom: "repo" }, async (dest, zk) => {
    await zk.sendMessage(dest, { text: "📂 *Bot Repository*\n\n🔗 https://github.com/devibraah/BWM-XMD" });
});

adams({ nomCom: "alive" }, async (dest, zk) => {
    await zk.sendMessage(dest, { text: "💡 *BWM XMD is Alive!* 🚀\n✅ Online and Running" });
});

adams({ nomCom: "channel" }, async (dest, zk) => {
    await zk.sendMessage(dest, { text: "📢 *Join Our Official Channel!*\n🔗 https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y" });
});

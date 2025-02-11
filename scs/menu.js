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

// Store command categories globally
let commandCategories = {};

// Main menu command
adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { nomAuteurMessage } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim/adams");

    // Organize commands by category
    commandCategories = {};
    cm.map((com) => {
        const categoryUpper = com.categorie.toUpperCase();
        if (!commandCategories[categoryUpper]) commandCategories[categoryUpper] = [];
        commandCategories[categoryUpper].push(com.nomCom);
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

    // Prepare category list with numbered replies
    let categoryList = "📂 *Select a Category:* \n\n";
    let index = 1;
    let categoryKeys = Object.keys(commandCategories).sort();
    categoryKeys.forEach((cat) => {
        categoryList += `${index++}. ${cat}\n`;
    });
    categoryList += `\n💡 Reply with a number to view commands from a specific category.`;

    // Select assets
    const image = randomImage();
    const image1 = randomImage();
    const randomAudioFile = getRandomAudio();
    const audioUrl = `${githubRawBaseUrl}/${randomAudioFile}`;

    const menuType = s.MENUTYPE || (Math.random() < 0.5 ? "1" : "2"); // Randomly pick if blank

    const footer = "\n\n®2025 ʙᴡᴍ xᴍᴅ";

    try {
        // Send category selection message
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

${categoryList}${footer}
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

        // Listen for reply to display commands in the chosen category
        zk.onMessage(async (msg) => {
            if (!msg.text || isNaN(msg.text)) return;

            let selectedIndex = parseInt(msg.text) - 1;
            if (selectedIndex < 0 || selectedIndex >= categoryKeys.length) return;

            let selectedCategory = categoryKeys[selectedIndex];
            let commands = commandCategories[selectedCategory].map(cmd => `🟢 ${cmd}`).join("\n");

            await zk.sendMessage(dest, {
                text: `📜 *${selectedCategory} Commands:*\n\n${commands}\n\n💡 Reply with another number to view a different category.`,
            });
        });

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

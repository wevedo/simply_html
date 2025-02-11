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

// GitHub raw audio links
const githubRawBaseUrl = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";
const audioFiles = Array.from({ length: 161 }, (_, i) => `sound${i + 1}.mp3`);
const getRandomAudio = () => audioFiles[Math.floor(Math.random() * audioFiles.length)];

const getMimeType = (url) => (url.endsWith(".wav") ? "audio/wav" : "audio/mpeg");

// Menu images
const menuImages = [
    "https://files.catbox.moe/13i93y.jpeg",
    "https://files.catbox.moe/2696sn.jpeg",
    "https://files.catbox.moe/soj3q4.jpeg",
    "https://files.catbox.moe/bddwnw.jpeg",
    "https://files.catbox.moe/f6zee8.jpeg",
];
const randomImage = () => menuImages[Math.floor(Math.random() * menuImages.length)];

// GitHub repo stats
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

// Main menu
adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { nomAuteurMessage, ms, repondre } = commandeOptions;
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

    // Determine greeting
    let greeting = greetings.night;
    if (hour >= 5 && hour < 12) greeting = greetings.morning;
    else if (hour >= 12 && hour < 18) greeting = greetings.afternoon;
    else if (hour >= 18 && hour <= 22) greeting = greetings.evening;

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    // Generate numbered category list
    const sortedCategories = Object.keys(coms).sort();
    let categoryMenu = "";
    sortedCategories.forEach((cat, index) => {
        categoryMenu += `${index + 1}⊷ ${cat}\n`;
    });

    // Select assets
    const image = randomImage();
    const audioUrl = `${githubRawBaseUrl}/${getRandomAudio()}`;

    const menuType = s.MENUTYPE || (Math.random() < 0.5 ? "1" : "2"); // Randomly pick if blank

    const footer = "\n\n®2025 ʙᴡᴍ xᴍᴅ";

    try {
        // Send main menu with numbered categories
        const sentMessage = await zk.sendMessage(dest, {
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

Reply with a number to choose a category:

${categoryMenu}${footer}
`,
            contextInfo: {
                externalAdReply: {
                    title: "𝗕𝗪𝗠 𝗫𝗠𝗗",
                    body: "Tap here to Join our official channel!",
                    thumbnailUrl: image,
                    sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                    showAdAttribution: true,
                    renderLargerThumbnail: true,
                },
            },
        });

        // Listen for reply with number
        zk.ev.on("messages.upsert", async (update) => {
            const message = update.messages[0];
            if (!message.message || !message.message.extendedTextMessage) return;

            const responseText = message.message.extendedTextMessage.text.trim();
            if (
                message.message.extendedTextMessage.contextInfo &&
                message.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id
            ) {
                const selectedIndex = parseInt(responseText);
                if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > sortedCategories.length) {
                    return repondre("*Invalid number. Please select a valid category.*");
                }

                const selectedCategory = sortedCategories[selectedIndex - 1];
                let categoryCommands = coms[selectedCategory];

                let commandList = `\n📜 *${selectedCategory}*:\n\n`;
                categoryCommands.forEach((cmd) => {
                    commandList += `🟢 ${cmd}\n`;
                });

                // Send selected category commands
                await zk.sendMessage(dest, {
                    text: `*${selectedCategory} Commands:*\n${commandList}`,
                    contextInfo: { quotedMessage: { conversation: "Category Selection" } },
                });
            }
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

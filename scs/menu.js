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

// Function to split array into chunks
const chunkArray = (array, size) => {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
        array.slice(i * size, i * size + size)
    );
};

const commandChunks = {}; // Store chunks for each user

adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { nomAuteurMessage, ms, repondre } = commandeOptions;
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

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    const image = randomImage();

    // Get sorted categories
    const sortedCategories = Object.keys(coms).sort();

    // Store command chunks per category
    sortedCategories.forEach((cat) => {
        commandChunks[cat] = chunkArray(coms[cat], 5); // 5 commands per page
    });

    const footer = "\n\n®2025 ʙᴡᴍ xᴍᴅ";

    try {
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

Reply with a number to choose a category:
${sortedCategories.map((cat, index) => `${index + 1}⊷ ${cat}`).join("\n")}${footer}
`,
        });

        // Listen for category selection
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
                let categoryCommands = commandChunks[selectedCategory];

                // Track current page
                let page = 0;
                let totalPages = categoryCommands.length;

                const sendCommandPage = async (pageIndex) => {
                    let commandList = `📜 *${selectedCategory}* (Page ${pageIndex + 1}/${totalPages}):\n\n`;
                    commandList += categoryCommands[pageIndex].map((cmd) => `🟢 ${cmd}`).join("\n");

                    let navigationText = "\nReply with:\n1️⃣ - Previous Page\n2️⃣ - Next Page";

                    await zk.sendMessage(dest, {
                        text: commandList + (totalPages > 1 ? navigationText : ""),
                    });
                };

                await sendCommandPage(page);

                zk.ev.on("messages.upsert", async (update) => {
                    const navMessage = update.messages[0];
                    if (!navMessage.message || !navMessage.message.extendedTextMessage) return;

                    const navText = navMessage.message.extendedTextMessage.text.trim();
                    if (navText === "1" && page > 0) {
                        page--;
                        await sendCommandPage(page);
                    } else if (navText === "2" && page < totalPages - 1) {
                        page++;
                        await sendCommandPage(page);
                    }
                });
            }
        });

        // Send audio
        const audioUrl = `${githubRawBaseUrl}/${getRandomAudio()}`;
        await zk.sendMessage(dest, {
            audio: { url: audioUrl },
            mimetype: getMimeType(audioUrl),
            ptt: true,
        });
    } catch (error) {
        console.error("Error sending menu:", error);
    }
});

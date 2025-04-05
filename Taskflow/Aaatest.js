const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const s = require(__dirname + "/../config");

// GitHub raw audio links
const githubRawBaseUrl = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";
const audioFiles = Array.from({ length: 100 }, (_, i) => `sound${i + 1}.mp3`);
const getRandomAudio = () => audioFiles[Math.floor(Math.random() * audioFiles.length)];

// Menu images
const menuImages = [
    "https://bwm-xmd-files.vercel.app/bwmxmd_lzgu8w.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd_9s9jr8.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd_psaclm.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd_1tksj5.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd_v4jirh.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd_d8cv2v.png",
    "https://files.catbox.moe/jwwjd3.jpeg",
    "https://files.catbox.moe/3k35q4.jpeg",
    "https://files.catbox.moe/sgl022.jpeg",
    "https://files.catbox.moe/xx6ags.jpeg",
];
const randomImage = () => menuImages[Math.floor(Math.random() * menuImages.length)];
const footer = "\n\n🌀 𝗦𝗶𝗿 𝗜𝗯𝗿𝗮𝗵𝗶𝗺 𝗔𝗱𝗮𝗺𝘀\n\nᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ ʙᴇʟᴏᴡ ᴛᴏ ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ\nhttps://shorturl.at/z3b8v\n\n⚡ 𝟮𝟬𝟮𝟱 𝗕𝗪𝗠 𝗫𝗠𝗗 𝗣𝗿𝗼𝗷𝗲𝗰𝘁";

// Newsletter context
const newsletterContext = {
    contextInfo: {
        mentionedJid: ["120363285388090068@newsletter"],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363285388090068@newsletter",
            newsletterName: "BWM-XMD",
            serverMessageId: Math.floor(100000 + Math.random() * 900000),
        }
    }
};

// GitHub repo stats
const fetchGitHubStats = async () => {
    try {
        const repo = "devibraah/BWM-XMD";
        const response = await axios.get(`https://api.github.com/repos/${repo}`);
        const forks = response.data.forks_count || 0;
        const stars = response.data.stargazers_count || 0;
        return (forks * 2) + (stars * 2);
    } catch (error) {
        console.error("Error fetching GitHub stats:", error);
        return 0;
    }
};

// Command list storage
const commandList = {};
let commandsStored = false;

adams({ nomCom: "btest", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { nomAuteurMessage, ms, repondre } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim/adams");

    // Store commands only once
    if (!commandsStored) {
        cm.forEach((com) => {
            const categoryUpper = com.categorie.toUpperCase();
            if (!commandList[categoryUpper]) commandList[categoryUpper] = [];
            commandList[categoryUpper].push(`✨ ${com.nomCom}`);
        });
        commandsStored = true;
    }

    moment.tz.setDefault(s.TZ || "Africa/Nairobi");
    const date = moment().format("DD/MM/YYYY");
    const time = moment().format("HH:mm:ss");
    const totalUsers = await fetchGitHubStats();
    const image = randomImage();

    // Dynamic Greeting
    const hour = moment().hour();
    let greeting = "🌙 *𝗚𝗼𝗼𝗱 𝗡𝗶𝗴𝗵𝘁! 𝗦𝗹𝗲𝗲𝗽 𝘄𝗲𝗹𝗹!*";
    if (hour >= 5 && hour < 12) greeting = "🌅 *𝗚𝗼𝗼𝗱 𝗠𝗼𝗿𝗻𝗶𝗻𝗴! 𝗛𝗮𝘃𝗲 𝗮 𝗴𝗿𝗲𝗮𝘁 𝗱𝗮𝘆!*";
    else if (hour >= 12 && hour < 18) greeting = "☀️ *𝗚𝗼𝗼𝗱 𝗔𝗳𝘁𝗲𝗿𝗻𝗼𝗼𝗻! 𝗦𝘁𝗮𝘆 𝗽𝗿𝗼𝗱𝘂𝗰𝘁𝗶𝘃𝗲!*";
    else if (hour >= 18 && hour < 22) greeting = "🌆 *𝗚𝗼𝗼𝗱 𝗘𝘃𝗲𝗻𝗶𝗻𝗴! 𝗧𝗶𝗺𝗲 𝘁𝗼 𝗿𝗲𝗹𝗮𝘅!*";

    // Stylish Categories
    const categoryGroups = {
        "🤖 𝗔𝗜 𝗠𝗘𝗡𝗨": ["ABU"],
        "🎵 𝗔𝗨𝗗𝗜𝗢 𝗠𝗘𝗡𝗨": ["AUDIO-EDIT"],
        "📥 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗠𝗘𝗡𝗨": ["BMW PICS", "SEARCH", "DOWNLOAD"],
        "🛠️ 𝗖𝗢𝗡𝗧𝗥𝗢𝗟 𝗠𝗘𝗡𝗨": ["CONTROL", "STICKCMD", "TOOLS"],
        "💬 𝗖𝗛𝗔𝗧 𝗠𝗘𝗡𝗨": ["CONVERSION", "MPESA"],
        "😂 𝗙𝗨𝗡 𝗠𝗘𝗡𝗨": ["HENTAI", "FUN", "REACTION"],
        "🎮 𝗚𝗔𝗠𝗘𝗦 𝗠𝗘𝗡𝗨": ["GAMES"],
        "🌍 𝗚𝗘𝗡𝗘𝗥𝗔𝗟 𝗠𝗘𝗡𝗨": ["GENERAL"],
        "👥 𝗚𝗥𝗢𝗨𝗣 𝗠𝗘𝗡𝗨": ["GROUP"],
        "💻 𝗚𝗜𝗧𝗛𝗨𝗕 𝗠𝗘𝗡𝗨": ["GITHUB"],
        "🖼️ 𝗜𝗠𝗔𝗚𝗘 𝗠𝗘𝗡𝗨": ["IMAGE-EDIT"],
        "🔤 𝗟𝗢𝗚𝗢 𝗠𝗘𝗡𝗨": ["LOGO"],
        "🛑 𝗠𝗢𝗗𝗦 𝗠𝗘𝗡𝗨": ["MODS"],
        "📰 𝗡𝗘𝗪𝗦 𝗠𝗘𝗡𝗨": ["NEWS", "AI"],
        "🔗 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗢𝗥 𝗠𝗘𝗡𝗨": ["PAIR", "USER"],
        "🔍 𝗦𝗘𝗔𝗥𝗖𝗛 𝗠𝗘𝗡𝗨": ["NEWS", "IA"],
        "🗣️ 𝗧𝗧𝗦 𝗠𝗘𝗡𝗨": ["TTS"],
        "⚙️ 𝗨𝗧𝗜𝗟𝗜𝗧𝗬 𝗠𝗘𝗡𝗨": ["UTILITY"],
        "🎌 𝗔𝗡𝗜𝗠𝗘 𝗠𝗘𝗡𝗨": ["WEEB"],
    };

    // Main Menu
    const BWM_XMD_TEXT = `
╭─✦ 〘 𝗕𝗪𝗠 𝗫𝗠𝗗 〙 ✦─╮
│
│ 🕵️ 𝗨𝘀𝗲𝗿: ${nomAuteurMessage}
│ 📅 𝗗𝗮𝘁𝗲: ${date}
│ ⏰ 𝗧𝗶𝗺𝗲: ${time}
│ 👥 𝗨𝘀𝗲𝗿𝘀: 1${totalUsers}
│
╰─✦───────✦─╯

${greeting}

📜 𝗥𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝘆 𝗻𝘂𝗺𝗯𝗲𝗿:

${Object.keys(categoryGroups).map((cat, index) => `│ ${index + 1}. ${cat}`).join("\n")}
│
╰─✦───────✦─╯
${footer}`;

    // Send Main Menu
    const sentMessage = await zk.sendMessage(dest, {
        image: { url: image },
        caption: BWM_XMD_TEXT,
        ...newsletterContext
    }, { quoted: ms });

    // Category Selection Handler
    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];
        if (!message.message?.extendedTextMessage) return;

        const responseText = message.message.extendedTextMessage.text.trim();
        if (message.message.extendedTextMessage.contextInfo?.stanzaId === sentMessage.key.id) {
            const selectedIndex = parseInt(responseText);
            const categoryKeys = Object.keys(categoryGroups);

            if (isNaN(selectedIndex) {
                return repondre("❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗶𝗻𝗽𝘂𝘁. 𝗣𝗹𝗲𝗮𝘀𝗲 𝘂𝘀𝗲 𝗮 𝗻𝘂𝗺𝗯𝗲𝗿.", newsletterContext);
            }

            if (selectedIndex < 1 || selectedIndex > categoryKeys.length) {
                return repondre(`❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘀𝗲𝗹𝗲𝗰𝘁 𝗯𝗲𝘁𝘄𝗲𝗲𝗻 𝟭-${categoryKeys.length}`, newsletterContext);
            }

            const selectedCategory = categoryKeys[selectedIndex - 1];
            const combinedCommands = categoryGroups[selectedCategory].flatMap((cat) => commandList[cat] || []);

            await zk.sendMessage(dest, {
                image: { url: randomImage() },
                caption: combinedCommands.length
                    ? `📜 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${selectedCategory}\n\n${combinedCommands.join("\n")}\n${footer}`
                    : `⚠️ 𝗡𝗼 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀 𝗳𝗼𝘂𝗻𝗱 𝗳𝗼𝗿 ${selectedCategory}`,
                ...newsletterContext
            }, { quoted: message });
        }
    });

    // Send Random Audio
    await zk.sendMessage(dest, {
        audio: { url: `${githubRawBaseUrl}/${getRandomAudio()}` },
        mimetype: "audio/mpeg",
        ptt: true,
        ...newsletterContext
    });
});

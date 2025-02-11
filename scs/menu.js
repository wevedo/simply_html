const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const s = require(__dirname + "/../config");

// GitHub raw audio links
const githubRawBaseUrl = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";
const audioFiles = Array.from({ length: 161 }, (_, i) => `sound${i + 1}.mp3`);
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

adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { nomAuteurMessage, ms, repondre } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim/adams");

    // **Prevent Duplicate Commands in Categories**
    cm.forEach((com) => {
        const categoryUpper = com.categorie.toUpperCase();
        if (!commandList[categoryUpper]) commandList[categoryUpper] = new Set();
        commandList[categoryUpper].add(`🟢 ${com.nomCom}`);
    });

    // Convert sets to arrays
    Object.keys(commandList).forEach((cat) => {
        commandList[cat] = [...commandList[cat]];
    });

    moment.tz.setDefault(s.TZ || "Africa/Nairobi");
    const date = moment().format("DD/MM/YYYY");
    const time = moment().format("HH:mm:ss");
    const totalUsers = await fetchGitHubStats();
    const image = randomImage();

    // **Dynamic Greeting Based on Time**
    const hour = moment().hour();
    let greeting = "🌙 *Good Night! See you tomorrow!*";
    if (hour >= 5 && hour < 12) greeting = "🌅 *Good Morning! Let's kickstart your day!*";
    else if (hour >= 12 && hour < 18) greeting = "☀️ *Good Afternoon! Stay productive*";
    else if (hour >= 18 && hour < 22) greeting = "🌆 *Good Evening! Time to relax!*";

    // **Custom Categories with Emojis**
    const categoryGroups = {
        "🤖 AI MENU": ["ABU"],
        "🎵 AUTO EDIT MENU": ["AUDIO-EDIT"],
        "📥 DOWNLOAD MENU": ["BMW PICS","SEARCH", "DOWNLOAD"],
        "🛠️ CONTROL MENU": ["CONTROL", "STICKCMD", "TOOLS"],
        "💬 CONVERSATION MENU": ["CONVERSION", "MPESA"],
        "😂 FUN MENU": ["HENTAI", "FUN", "REACTION"],
        "🎮 GAMES MENU": ["GAMES"],
        "🌍 GENERAL MENU": ["GENERAL"],
        "👨‍👨‍👦‍👦 GROUP MENU": ["GROUP"],
        "💻 GITHUB MENU": ["GITHUB"],
        "🖼️ IMAGE MENU": ["IMAGE-EDIT"],
        "🔤 LOGO MENU": ["LOGO"],
        "🛑 MODS MENU": ["MODS"],
        "📰 NEWS MENU": ["NEWS","AI"],
        "🔗 CONNECTOR MENU": ["PAIR","USER"],
        "🔍 SEARCH MENU": ["NEWS","IA"],
        "🗣️ TTS MENU": ["TTS"],
        "⚙️ UTILITY MENU": ["UTILITY"],
        "🎌 ANIME MENU": ["WEEB"],
    };

    const footer = "\n\n©Sir Ibrahim Adams\n\nᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ ʙᴇʟᴏᴡ ᴛᴏ ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ https://shorturl.at/z3b8v\n\n®2025 ʙᴡᴍ xᴍᴅ 🔥";

    try {
        // **Send Main Menu**
        await zk.sendMessage(dest, {
            image: { url: image },
            caption: `📜 *Main Menu*\n\n${greeting}\n\n${Object.keys(categoryGroups).map((cat, index) => `${index + 1} ${cat}`).join("\n\n")}${footer}`,
            contextInfo: { forwardingScore: 999, isForwarded: true },
        }, { quoted: ms });

        // **Send Random Audio**
        const audioUrl = `${githubRawBaseUrl}/${getRandomAudio()}`;
        await zk.sendMessage(dest, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            ptt: true,
        });

    } catch (error) {
        console.error("❌ Error sending menu:", error);
    }
});

// **Listen for Category Replies**
zk.ev.on("messages.upsert", async (update) => {
    const message = update.messages[0];
    if (!message.message || !message.message.extendedTextMessage) return;

    const responseText = message.message.extendedTextMessage.text.trim();
    const selectedIndex = parseInt(responseText);
    const categoryKeys = Object.keys(categoryGroups);

    if (!isNaN(selectedIndex) && selectedIndex >= 1 && selectedIndex <= categoryKeys.length) {
        const selectedCategory = categoryKeys[selectedIndex - 1];
        const combinedCommands = categoryGroups[selectedCategory].flatMap((cat) => commandList[cat] || []);

        // **Send Category Commands**
        await zk.sendMessage(message.key.remoteJid, {
            text: `📜 *${selectedCategory}*\n\n${combinedCommands.join("\n") || "⚠️ No commands found."}`,
            contextInfo: { forwardingScore: 999, isForwarded: true },
        }, { quoted: message });
    }
});

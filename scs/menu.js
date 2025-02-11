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

    // Organize commands
    cm.map((com) => {
        const categoryUpper = com.categorie.toUpperCase();
        if (!commandList[categoryUpper]) commandList[categoryUpper] = [];
        commandList[categoryUpper].push(`🟢 ${com.nomCom}`);
    });

    moment.tz.setDefault(s.TZ || "Africa/Nairobi");
    const date = moment().format("DD/MM/YYYY");
    const time = moment().format("HH:mm:ss");
    const totalUsers = await fetchGitHubStats();
    const image = randomImage();

    // **Dynamic Greeting Based on Time**
    const hour = moment().hour();
    let greeting = "🌙 *Good Night*";
    if (hour >= 5 && hour < 12) greeting = "🌅 *Good Morning*";
    else if (hour >= 12 && hour < 18) greeting = "☀️ *Good Afternoon*";
    else if (hour >= 18 && hour < 22) greeting = "🌆 *Good Evening*";

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

    // Add new categories dynamically
    Object.keys(commandList).forEach((category) => {
        if (!Object.values(categoryGroups).flat().includes(category)) {
            categoryGroups[category] = [category];
        }
    });

    const footer = "\n\n®2025 ʙᴡᴍ xᴍᴅ 🔥";

    try {
        // **Send Main Menu**
        const sentMessage = await zk.sendMessage(dest, {
            image: { url: image },
            caption: `
╭─❖ 𓆩 ⚡ 𓆪 ❖──╮
   ✨  ʙᴡᴍ xᴍᴅ  ✨  
╰─❖ 𓆩 ⚡ 𓆪 ❖──╯

🌟 ${greeting}, *${nomAuteurMessage}!*  
📆 ᴅᴀᴛᴇ: ${date}  
⏰ ᴛɪᴍᴇ: ${time}  
👥 ᴜsᴇʀs: ${totalUsers}  

📜 *Select a category:*  
${Object.keys(categoryGroups).map((cat, index) => `${index + 1} ${cat}`).join("\n\n")}${footer}
`,
        });

        // **Category Selection Listener**
        zk.ev.on("messages.upsert", async (update) => {
            const message = update.messages[0];
            if (!message.message || !message.message.extendedTextMessage) return;

            const responseText = message.message.extendedTextMessage.text.trim();
            if (
                message.message.extendedTextMessage.contextInfo &&
                message.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id
            ) {
                const selectedIndex = parseInt(responseText);
                const categoryKeys = Object.keys(categoryGroups);

                if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > categoryKeys.length) {
                    return repondre("*❌ Invalid number. Please select a valid category.*");
                }

                const selectedCategory = categoryKeys[selectedIndex - 1];
                const combinedCommands = categoryGroups[selectedCategory].flatMap((cat) => commandList[cat] || []);

                // **Display All Commands in Selected Category**
                const commandText = combinedCommands.length
                    ? `📜 *${selectedCategory}*:\n\n${combinedCommands.join("\n")}`
                    : `⚠️ No commands found for ${selectedCategory}.`;

                await zk.sendMessage(dest, {
                    text: commandText,
                    contextInfo: {
                        externalAdReply: {
                            title: "𝗕𝗪𝗠 𝗫𝗠𝗗 🚀",
                            body: "Tap here to Join our official channel!",
                            thumbnailUrl: image,
                            sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                            showAdAttribution: true,
                            renderLargerThumbnail: Math.random() < 0.5,
                        },
                    },
                    quoted: message, // **Ensures context is applied correctly**
                });
            }
        });

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

const pkg = require("@whiskeysockets/baileys");
const { generateWAMessageFromContent, proto } = pkg;
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

// Menu images
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

    // Determine greeting
    let greeting = greetings.night;
    if (hour >= 5 && hour < 12) greeting = greetings.morning;
    else if (hour >= 12 && hour < 18) greeting = greetings.afternoon;
    else if (hour >= 18 && hour <= 22) greeting = greetings.evening;

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    // Select assets
    const image = randomImage();
    const image1 = randomImage();
    const randomAudioFile = getRandomAudio();
    const audioUrl = `${githubRawBaseUrl}/${randomAudioFile}`;

    const menuType = s.MENUTYPE || (Math.random() < 0.5 ? "1" : "2"); // Default if blank

    const footer = "\n\n®2025 ʙᴡᴍ xᴍᴅ";

    try {
        if (menuType === "1") {
            // Normal menu
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
${footer}
`,
            });
        } else {
            // Interactive menu with buttons
            const menuMessage = {
                viewOnceMessage: {
                    message: generateWAMessageFromContent(dest, proto.Message.fromObject({
                        buttonsMessage: {
                            contentText: `
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
                            footerText: "Choose an option below",
                            buttons: [
                                { buttonId: "commands", buttonText: { displayText: "📜 Commands" }, type: 1 },
                                { buttonId: "ping", buttonText: { displayText: "📡 Ping" }, type: 1 },
                                { buttonId: "repo", buttonText: { displayText: "💾 Bot Repo" }, type: 1 },
                                { buttonId: "alive", buttonText: { displayText: "✅ Alive" }, type: 1 },
                                { buttonId: "channel", buttonText: { displayText: "📢 WhatsApp Channel" }, type: 1 },
                            ],
                            headerType: 4,
                            imageMessage: (await zk.prepareMessageMedia({ url: image1 }, "image")),
                        }
                    }), {}),
                }
            };
            await zk.sendMessage(dest, menuMessage);
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

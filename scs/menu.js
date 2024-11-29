const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const s = require(__dirname + "/../config");

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

// Cool fonts for greetings
const coolFonts = {
    morning: ["🌞 𝐆𝐨𝐨𝐝 𝐌𝐨𝐫𝐧𝐢𝐧𝐠", "🌄 𝑹𝒊𝒔𝒆 & 𝑺𝒉𝒊𝒏𝒆", "🌅 𝐌𝐨𝐫𝐧𝐢𝐧𝐠 𝐕𝐢𝐛𝐞𝐬"],
    afternoon: ["☀️ 𝐆𝐨𝐨𝐝 𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧", "🌻 𝐇𝐚𝐩𝐩𝐲 𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧", "☀️ 𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧 𝐃𝐞𝐥𝐢𝐠𝐡𝐭"],
    evening: ["🌅 𝐆𝐨𝐨𝐝 𝐄𝐯𝐞𝐧𝐢𝐧𝐠", "🌇 𝐒𝐞𝐫𝐞𝐧𝐞 𝐄𝐯𝐞𝐧𝐢𝐧𝐠𝐬", "✨ 𝐄𝐯𝐞𝐧𝐢𝐧𝐠 𝐌𝐚𝐠𝐢𝐜"],
    night: ["🌙 𝐆𝐨𝐨𝐝 𝐍𝐢𝐠𝐡𝐭", "🌌 𝐃𝐫𝐞𝐚𝐦𝐲 𝐍𝐢𝐠𝐡𝐭𝐬", "✨ 𝐒𝐥𝐞𝐞𝐩 𝐓𝐢𝐠𝐡𝐭"]
};

// GitHub repo stats function
const fetchGitHubStats = async () => {
    try {
        const repo = "Devibraah/BWM-XMD";
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

// Menu image URLs
const menuImages = [
    "https://files.catbox.moe/h2ydge.jpg",
    "https://files.catbox.moe/0xa925.jpg",
    "https://files.catbox.moe/k13s7u.jpg"
];

// Function to get a random image for the menu
const getRandomMenuImage = () => {
    return menuImages[Math.floor(Math.random() * menuImages.length)];
};

// Audio URLs for background music
const audioUrls = [
    "https://files.catbox.moe/sxygdt.mp3",
    "https://files.catbox.moe/zdti7y.wav",
    "https://files.catbox.moe/nwreb4.mp3",
    "https://files.catbox.moe/y1uawp.mp3",
    "https://files.catbox.moe/x4h8us.mp3"
];

// Function to determine MIME type
const getMimeType = (url) => {
    return url.endsWith(".wav") ? "audio/wav" : "audio/mpeg";
};

// Main menu command
adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { repondre, prefixe, nomAuteurMessage } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim/adams");
    let coms = {};

    // Organize commands by category
    cm.map((com) => {
        const categoryUpper = com.categorie.toUpperCase();
        if (!coms[categoryUpper]) coms[categoryUpper] = [];
        coms[categoryUpper].push(com.nomCom);
    });

    moment.tz.setDefault(s.TZ || "Africa/Nairobi");
    const temps = moment().format("HH:mm:ss");
    const date = moment().format("DD/MM/YYYY");
    const hour = moment().hour();

    // Greeting based on time
    const getRandomGreeting = (greetings) => greetings[Math.floor(Math.random() * greetings.length)];
    let greeting = coolFonts.night;
    if (hour >= 0 && hour <= 11) greeting = getRandomGreeting(coolFonts.morning);
    else if (hour >= 12 && hour <= 16) greeting = getRandomGreeting(coolFonts.afternoon);
    else if (hour >= 16 && hour <= 21) greeting = getRandomGreeting(coolFonts.evening);

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    // Prepare command list for caption
    let commandList = "";
    const sortedCategories = Object.keys(coms).sort();
    sortedCategories.forEach((cat) => {
        commandList += `\n🔹 *${cat}*:\n`;
        coms[cat].forEach((cmd) => {
            commandList += `  - ${cmd}\n`;
        });
    });

    const randomImage = getRandomMenuImage();
    const randomAudio = audioUrls[Math.floor(Math.random() * audioUrls.length)];

    try {
        // Send image with styled caption
        await zk.sendMessage(dest, {
            image: { url: randomImage },
            caption: `
╭━━━╮ 🤖 *𝐁𝐖𝐌 𝐗𝐌𝐃* 🤖
┃💻 Owner: Ibrahim Adams
┃📅 Date: ${date}
┃⏰ Time: ${temps}
┃👥 Bwm Users: ${formattedTotalUsers}
╰━━━╯

${greeting}, ${nomAuteurMessage}
${readmore}
${commandList}

🎶 *Background Music*:
Enjoy the experience with bwm xmd touch. 🤖✨
`,
            contextInfo: {
                externalAdReply: {
                    title: "𝗕𝗪𝗠 𝗫𝗠𝗗",
                    body: "Tap here to follow our channel",
                    thumbnailUrl: "https://files.catbox.moe/m9jm8o.jpeg",
                    sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                    showAdAttribution: true,
                },
            },
        });

        // Play random audio
        await zk.sendMessage(dest, {
            audio: { url: randomAudio },
            mimetype: getMimeType(randomAudio),
            ptt: true,
        });
    } catch (e) {
        console.error("Error generating menu:", e);
        repondre("Error generating menu: " + e.message);
    }
});




    
/**const { adams } = require("../Ibrahim/adams");
const { format } = require(__dirname + "/../Ibrahim/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const axios = require('axios');
const s = require(__dirname + "/../config");

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);
const BaseUrl = process.env.GITHUB_GIT;
const adamsapikey = process.env.BOT_OWNER;
const runtime = function (seconds) { 
    seconds = Number(seconds); 
    var d = Math.floor(seconds / (3600 * 24)); 
    var h = Math.floor((seconds % (3600 * 24)) / 3600); 
    var m = Math.floor((seconds % 3600) / 60); 
    var s = Math.floor(seconds % 60); 
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " d, ") : ""; 
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " h, ") : ""; 
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " m, ") : ""; 
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " s") : ""; 
    return dDisplay + hDisplay + mDisplay + sDisplay; 
};

// GitHub repo data function
const fetchGitHubStats = async () => {
    try {
        const repo = 'Devibraah/BWM-XMD';
        const response = await axios.get(`https://api.github.com/repos/${repo}`);
        const forks = response.data.forks_count;
        const stars = response.data.stargazers_count;
        const totalUsers = (forks * 2) + (stars * 2);
        return { forks, stars, totalUsers };
    } catch (error) {
        console.error("Error fetching GitHub stats:", error);
        return { forks: 0, stars: 0, totalUsers: 0 }; 
    }
};

const audioUrls = [
    "https://files.catbox.moe/sxygdt.mp3",
    "https://files.catbox.moe/zdti7y.wav",
    "https://files.catbox.moe/nwreb4.mp3",
    "https://files.catbox.moe/y1uawp.mp3",
    "https://files.catbox.moe/x4h8us.mp3"
];

// Array of menu image URLs
const menuImages = [
    "https://files.catbox.moe/h2ydge.jpg",
    "https://files.catbox.moe/0xa925.jpg",
    "https://files.catbox.moe/k13s7u.jpg"
];

// Function to get a random image for the menu
const getRandomMenuImage = () => {
    return menuImages[Math.floor(Math.random() * menuImages.length)];
};

// Function to determine the MIME type based on the file extension
const getMimeType = (url) => {
    return url.endsWith(".wav") ? "audio/wav" : "audio/mpeg";
};

adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim/adams");
    var coms = {};
    var mode = "public";

    if ((s.MODE).toLocaleLowerCase() != "public") {
        mode = "Private";
    }

    cm.map(async (com) => {
        const categoryUpper = com.categorie.toUpperCase();
        if (!coms[categoryUpper]) coms[categoryUpper] = [];
        coms[categoryUpper].push(com.nomCom);
    });

    moment.tz.setDefault('${s.TZ}');
    const temps = moment().format('HH:mm:ss');
    const date = moment().format('DD/MM/YYYY');
    const hour = moment().hour();
    let greeting = "Good night";
    if (hour >= 0 && hour <= 11) greeting = "Good morning";
    else if (hour >= 12 && hour <= 16) greeting = "Good afternoon";
    else if (hour >= 16 && hour <= 21) greeting = "Good evening";

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    // Updated infoMsg with a smaller menu
    let infoMsg = `
╭──────────────────⊷
┇🗄 *COMMANDS PAGE*
╰──────────────────⊷
\n\n`;

    // Simplified menuMsg
    let menuMsg = `${readmore}  
╭─── *COMMAND LIST* ───╮\n`;

    const sortedCategories = Object.keys(coms).sort();
    sortedCategories.forEach((cat) => {
        menuMsg += `\n*${cat}*:\n`;
        coms[cat].forEach((cmd) => {
            menuMsg += `- ${cmd}\n`;
        });
    });
    menuMsg += "\n╰──────────────────╯";

    try {
        // Send random image first with caption
        const randomImage = getRandomMenuImage();
        await zk.sendMessage(dest, { 
            image: { url: randomImage }, 
            caption: `╭─────═━┈┈━═──━┈⊷
┇ ʙᴏᴛ ɴᴀᴍᴇ: *ʙᴡᴍ xᴍᴅ*
┇ ᴏᴡɴᴇʀ: ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs
┇ ᴍᴏᴅᴇ: *${mode}*
┇ ᴘʀᴇғɪx: *[ ${prefixe} ]*
┇ ᴅᴀᴛᴇ: *${date}*
┇ ᴛɪᴍᴇ: *${temps}*
╰─────═━┈┈━═──━┈⊷\n\n
🌍 *BEST WHATSAPP BOT* 🌍`,
            width: 335,
            height: 340,
            contextInfo: {
                externalAdReply: {
                    title: "𝗕𝗪𝗠 𝗫𝗠𝗗",
                    body: "Click here to view our WhatsApp channel",
                    thumbnailUrl: "https://files.catbox.moe/fxcksg.webp", // Replace with your contact's profile picture URL
                    sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y", // Replace with your WhatsApp channel URL
                    showAdAttribution: true, // Ensures the "View Channel" button appears
                }
            }
        });

        // Short delay to ensure the image loads first
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Send the menu text, making sure the width matches the image
        await zk.sendMessage(dest, { 
            text: infoMsg + menuMsg,
            contextInfo: {
                externalAdReply: {
                    title: "©Ibrahim adams",
                    body: "View the full list of commands",
                    thumbnailUrl: "https://files.catbox.moe/fxcksg.webp", // Thumbnail for the commands page
                    sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y", // Your WhatsApp channel URL
                    showAdAttribution: true, // Enables the channel button
                }
            }
        });

        // Send the audio message with only a caption
        try {
            const randomAudio = audioUrls[Math.floor(Math.random() * audioUrls.length)];
            console.log("Selected audio URL:", randomAudio); // Log selected audio URL

            await zk.sendMessage(dest, { 
                audio: { url: randomAudio },
                mimetype: getMimeType(randomAudio),
                ptt: true,  
                caption: "BMW MD SONG"
            });

        } catch (audioError) {
            console.error("Error sending audio:", audioError);
            repondre("Error sending audio file: " + audioError.message);
        }

    } catch (e) {
        console.log("🥵🥵 Menu error " + e);
        repondre("🥵🥵 Menu error " + e);
    }
});

**/

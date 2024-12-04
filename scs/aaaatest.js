const { adams } = require("../Ibrahim/adams");
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
    "https://files.catbox.moe/fm0rvl.mp3",
    "https://files.catbox.moe/demlei.mp3",
    "https://files.catbox.moe/3ka4td.m4a",
    "https://files.catbox.moe/zm8edu.m4a",
    "https://files.catbox.moe/6ztgwg.mp3"
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

// New menu for nuber-based replies
adams({ nomCom: "men", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { repondre, nomAuteurMessage, body } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim/adams");
    let coms = {};

    // Organize commands by category
    cm.map((com) => {
        const categoryUpper = com.categorie.toUpperCase();
        if (!coms[categoryUpper]) coms[categoryUpper] = [];
        coms[categoryUpper].push(com.nomCom);
    });

    const sortedCategories = Object.keys(coms).sort();
    let commandList = "";

    // Prepare command list
    sortedCategories.forEach((cat) => {
        commandList += `\n🔸🔹 *${cat}*:\n`;
        coms[cat].forEach((cmd) => {
            commandList += `  - ${cmd}\n`;
        });
    });

    // Define responses based on the reply body
    try {
        if (body.trim() === "1.0") {
            // Display commands in categories
            await zk.sendMessage(dest, {
                text: `
╭━━━╮ *𝐁𝐖𝐌 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬*
┃👥 User: ${nomAuteurMessage}
╰━━━╯

*Commands by Category:*
${commandList}
`,
            });
        } else if (body.trim() === "2.0") {
            // Display bot's GitHub repository
            await zk.sendMessage(dest, {
                text: `
╭━━━╮ *𝐁𝐖𝐌 𝐆𝐢𝐭𝐇𝐮𝐛 𝐑𝐞𝐩𝐨*
┃👥 User: ${nomAuteurMessage}
╰━━━╯

📂 *Repository*: [BWM XMD GitHub](https://github.com/Devibraah/BWM-XMD)
📈 *Description*: Stay updated with all the bot’s features!
`,
            });
        } else if (body.trim() === "3.0") {
            // Display WhatsApp channel link
            await zk.sendMessage(dest, {
                text: `
╭━━━╮ *𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐂𝐡𝐚𝐧𝐧𝐞𝐥*
┃👥 User: ${nomAuteurMessage}
╰━━━╯

🎉 *Join the Channel*: 
[WhatsApp Channel](https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y)
Stay updated with announcements and features!
`,
            });
        } else {
            // Invalid response
            await zk.sendMessage(dest, {
                text: `
╭━━━╮ *𝐁𝐖𝐌 𝐌𝐞𝐧𝐮*
┃👥 User: ${nomAuteurMessage}
╰━━━╯

*Invalid option!*
Please reply with one of the following:
1️⃣ *1.0* - View commands by category.
2️⃣ *2.0* - View the bot's GitHub repository.
3️⃣ *3.0* - Get the WhatsApp channel link.
`,
            });
        }
    } catch (error) {
        console.error("Error processing menu reply:", error);
    }
});

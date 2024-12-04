const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const s = require(__dirname + "/../config");

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

// Fonts for greetings
const coolFonts = {
    morning: ["🌄 🎅 𝑹𝒊𝒔𝒆 & 𝑺𝒉𝒊𝒏𝒆 🎁"],
    afternoon: ["☀️ 🎅 𝐆𝐨𝐨𝐝 𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧 🎁"],
    evening: ["🌅 🎄 𝐆𝐨𝐨𝐝 𝐄𝐯𝐞𝐧𝐢𝐧𝐠 ❄️"],
    night: ["✨ 🎄 𝐒𝐥𝐞𝐞𝐩 𝐓𝐢𝐠𝐡𝐭 🎅"]
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

// Function to send dynamic menu
const sendMenu = async (zk, dest, nomAuteurMessage, commandList, greeting, totalUsers) => {
    const date = moment().format("DD/MM/YYYY");
    const temps = moment().format("HH:mm:ss");
    await zk.sendMessage(dest, {
        text: `
╭━━━╮ 🎄 *𝐁𝐖𝐌 𝐗𝐌𝐃* 🎄
┃💻 Owner: Ibrahim Adams
┃📅 Date: ${date}
┃⏰ Time: ${temps}
┃👥 BWM Users: ${totalUsers}
╰━━━╯

${greeting}

Reply with the number:
1.0 - Commands by Category
2.0 - Bot Repository Info
3.0 - WhatsApp Channel
`,
    });
};

// Main menu command
adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    const { nomAuteurMessage } = commandeOptions;
    const { cm } = require(__dirname + "/../Ibrahim/adams");
    let coms = {};

    // Organize commands by category
    cm.map((com) => {
        const categoryUpper = com.categorie.toUpperCase();
        if (!coms[categoryUpper]) coms[categoryUpper] = [];
        coms[categoryUpper].push(com.nomCom);
    });

    const { totalUsers } = await fetchGitHubStats();
    const hour = moment().hour();
    const greeting =
        hour < 12
            ? coolFonts.morning[0]
            : hour < 18
            ? coolFonts.afternoon[0]
            : hour < 22
            ? coolFonts.evening[0]
            : coolFonts.night[0];

    // Generate the command list
    let commandList = "";
    Object.keys(coms)
        .sort()
        .forEach((cat) => {
            commandList += `\n🔸🔹 *${cat}*:\n`;
            coms[cat].forEach((cmd) => {
                commandList += `  - ${cmd}\n`;
            });
        });

    await sendMenu(zk, dest, nomAuteurMessage, commandList, greeting, totalUsers);
});

// Reply handler for numbers
adams({ replyType: true }, async (dest, zk, commandeOptions) => {
    const { message, nomAuteurMessage } = commandeOptions;
    const responseText = message.body.trim();

    if (responseText === "1.0") {
        // Commands by Category
        const { cm } = require(__dirname + "/../Ibrahim/adams");
        let coms = {};

        cm.map((com) => {
            const categoryUpper = com.categorie.toUpperCase();
            if (!coms[categoryUpper]) coms[categoryUpper] = [];
            coms[categoryUpper].push(com.nomCom);
        });

        let commandList = "";
        Object.keys(coms)
            .sort()
            .forEach((cat) => {
                commandList += `\n🔸🔹 *${cat}*:\n`;
                coms[cat].forEach((cmd) => {
                    commandList += `  - ${cmd}\n`;
                });
            });

        await zk.sendMessage(dest, { text: `📋 *Commands by Category*:\n${commandList}` });
    } else if (responseText === "2.0") {
        // Bot Repository Info
        const { forks, stars } = await fetchGitHubStats();
        await zk.sendMessage(dest, {
            text: `
📦 *BWM XMD Repository Info*
⭐ Stars: ${stars}
🍴 Forks: ${forks}
🔗 [GitHub Repo](https://github.com/Devibraah/BWM-XMD)
            `,
        });
    } else if (responseText === "3.0") {
        // WhatsApp Channel
        await zk.sendMessage(dest, {
            text: `
📢 *WhatsApp Channel Info*
Join our channel for updates and more:
🔗 [WhatsApp Channel](https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y)
            `,
        });
    } else {
        // Invalid Response
        await zk.sendMessage(dest, { text: `❌ Invalid option! Please reply with a valid number.` });
    }
});

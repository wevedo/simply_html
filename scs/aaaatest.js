const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const s = require(__dirname + "/../config");

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

// Function to fetch GitHub stats
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

// Main menu command
adams({ nomCom: "me", categorie: "General" }, async (dest, zk, commandeOptions) => {
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

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    // Prepare command list for "View Commands" button
    let commandList = "";
    const sortedCategories = Object.keys(coms).sort();
    sortedCategories.forEach((cat) => {
        commandList += `\n🔸🔹 *${cat}*:\n`;
        coms[cat].forEach((cmd) => {
            commandList += `  - ${cmd}\n`;
        });
    });

    // Button Menu Layout
    const buttons = [
        { buttonId: "menu3_viewCommands", buttonText: { displayText: "📜 View Commands" }, type: 1 },
        { buttonId: "menu3_ping", buttonText: { displayText: "📶 Ping" }, type: 1 },
        { buttonId: "menu3_repo", buttonText: { displayText: "📂 Repository" }, type: 1 },
        { buttonId: "menu3_channel", buttonText: { displayText: "📢 Channel" }, type: 1 }
    ];

    // Menu Caption
    const caption = `
╭━━━╮ *𝐁𝐖𝐌 𝐗𝐌𝐃*
┃🙋‍♂️ Heyy: ${nomAuteurMessage}
┃💻 Owner: Ibrahim Adams
┃📅 Date: ${date}
┃⏰ Time: ${temps}
┃👥 Users: ${formattedTotalUsers}
╰━━━╯

✨ Please choose an option below ✨
`;

    // Send the menu with buttons
    await zk.sendMessage(dest, {
        text: caption,
        buttons: buttons,
        headerType: 1
    });

    // Handle button responses
    zk.on("button-response", async (btn) => {
        const buttonId = btn.selectedButtonId;
        switch (buttonId) {
            case "menu3_viewCommands":
                // Send command list by category
                await zk.sendMessage(dest, {
                    text: `📜 *Commands by Category*\n${readmore}${commandList}`
                });
                break;

            case "menu3_ping":
                // Respond with a ping message
                const pingTime = Date.now() - zk.messageTimestamp * 1000;
                await zk.sendMessage(dest, {
                    text: `📶 *Ping*: ${pingTime}ms`
                });
                break;

            case "menu3_repo":
                // Send repository link
                await zk.sendMessage(dest, {
                    text: `📂 *Repository*\nAccess the code here:\nhttps://github.com/Devibraah/BWM-XMD`
                });
                break;

            case "menu3_channel":
                // Send channel link
                await zk.sendMessage(dest, {
                    text: `📢 *Channel*\nFollow our updates:\nhttps://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y`
                });
                break;

            default:
                // Default response for unknown buttons
                await zk.sendMessage(dest, {
                    text: "❌ Unknown button selected."
                });
                break;
        }

        // Send an audio below for every button
        const audioUrlsNormal = [
            "https://files.catbox.moe/fm0rvl.mp3",
            "https://files.catbox.moe/demlei.mp3",
            "https://files.catbox.moe/3ka4td.m4a"
        ];
        const randomAudio = audioUrlsNormal[Math.floor(Math.random() * audioUrlsNormal.length)];
        await zk.sendMessage(dest, {
            audio: { url: randomAudio },
            mimetype: randomAudio.endsWith(".wav") ? "audio/wav" : "audio/mpeg",
            ptt: true
        });
    });
});

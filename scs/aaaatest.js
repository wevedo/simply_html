const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const s = require(__dirname + "/../config");

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

// Button menu handler
adams({ nomCom: "me", categorie: "General" }, async (dest, zk, commandeOptions) => {
    const { repondre, nomAuteurMessage } = commandeOptions;
    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    const buttons = [
        { buttonId: "viewCommands", buttonText: { displayText: "📜 View Commands" }, type: 1 },
        { buttonId: "ping", buttonText: { displayText: "📶 Ping" }, type: 1 },
        { buttonId: "repo", buttonText: { displayText: "📂 Repository" }, type: 1 },
        { buttonId: "channel", buttonText: { displayText: "📢 Channel" }, type: 1 }
    ];

    const caption = `
╭━━━╮ *𝐁𝐖𝐌 𝐗𝐌𝐃*
┃🙋‍♂️ Heyy: ${nomAuteurMessage}
┃👥 Users: ${formattedTotalUsers}
┃✨ Select an option below:
╰━━━╯
`;

    // Send the menu with buttons
    await zk.sendMessage(dest, {
        text: caption,
        buttons: buttons,
        headerType: 1
    });
});

// Button response handler
adams.on("button-click", async (dest, zk, buttonId) => {
    try {
        switch (buttonId) {
            case "viewCommands":
                await zk.sendMessage(dest, { text: "📜 Here are the available commands:\n1. Command A\n2. Command B" });
                break;

            case "ping":
                const pingTime = Date.now();
                await zk.sendMessage(dest, { text: `📶 *Ping*: ${pingTime}ms` });
                break;

            case "repo":
                await zk.sendMessage(dest, { text: "📂 Repository: https://github.com/Devibraah/BWM-XMD" });
                break;

            case "channel":
                await zk.sendMessage(dest, { text: "📢 Channel: https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y" });
                break;

            default:
                await zk.sendMessage(dest, { text: "❌ Unknown button selected." });
        }
    } catch (error) {
        console.error("Error handling button response:", error);
    }
});

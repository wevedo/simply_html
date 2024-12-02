const { default: makeWASocket, useSingleFileAuthState } = require("@adiwajshing/baileys");
const moment = require("moment-timezone");
const axios = require("axios");

// Initialize Baileys
const { state, saveState } = useSingleFileAuthState("./auth_info.json");
const sock = makeWASocket({
    auth: state,
});

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

// Handle incoming messages
sock.ev.on("messages.upsert", async (message) => {
    const msg = message.messages[0];
    if (!msg.message) return;
    const from = msg.key.remoteJid;
    const buttonResponse = msg.message.buttonsResponseMessage;

    // Check for button click responses
    if (buttonResponse) {
        const buttonId = buttonResponse.selectedButtonId;

        switch (buttonId) {
            case "viewCommands":
                await sock.sendMessage(from, { text: "📜 Here are the available commands:\n1. Command A\n2. Command B" });
                break;

            case "ping":
                const pingTime = Date.now();
                await sock.sendMessage(from, { text: `📶 *Ping*: ${pingTime}ms` });
                break;

            case "repo":
                await sock.sendMessage(from, { text: "📂 Repository: https://github.com/Devibraah/BWM-XMD" });
                break;

            case "channel":
                await sock.sendMessage(from, { text: "📢 Channel: https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y" });
                break;

            default:
                await sock.sendMessage(from, { text: "❌ Unknown button selected." });
        }
    }

    // If the message is a "menu" command
    if (msg.message.conversation === "menu") {
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
┃🙋‍♂️ Heyy!
┃👥 Users: ${formattedTotalUsers}
┃✨ Select an option below:
╰━━━╯
`;

        await sock.sendMessage(from, {
            text: caption,
            buttons: buttons,
            headerType: 1,
        });
    }
});

// Save auth state on disconnect
sock.ev.on("connection.update", (update) => {
    const { connection } = update;
    if (connection === "close") {
        console.log("Connection closed, reconnecting...");
        makeWASocket();
    }
});

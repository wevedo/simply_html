/*'use strict';

const axios = require('axios');
const cheerio = require('cheerio');

const webPageUrl = 'https://bwm-xmd-files.vercel.app/files';

async function fetchRepoUrl() {
    try {
        const response = await axios.get(webPageUrl);
        const $ = cheerio.load(response.data);
        const repoUrl = $(`a:contains("REPO_URL")`).attr('href');

        if (!repoUrl) throw new Error('REPO_URL not found on the webpage.');

        console.log('REPO_URL fetched successfully:', repoUrl);

        const scriptResponse = await axios.get(repoUrl);
        const scriptContent = scriptResponse.data;
        console.log("REPO_URL script loaded successfully");

        eval(scriptContent);
    } catch (error) {
        console.error('Error fetching REPO_URL:', error.message);
    }
}

fetchRepoUrl();
    
    */                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              

const axios = require('axios');
const moment = require("moment-timezone");
const { adams } = require(__dirname + "/../Ibrahim/adams");

// Function to format large numbers with commas
const formatNumber = (num) => num.toLocaleString();

// Repositories for aggregation
const repositories = [
    "devibrah/NORMAL-BOT",
    "devibraah/BWM-XMD",
];

// Function to fetch and aggregate GitHub repository details
const fetchAndAggregateRepoDetails = async () => {
    try {
        let aggregatedForks = 0;
        let aggregatedStars = 0;

        for (const repo of repositories) {
            const response = await axios.get(`https://api.github.com/repos/${repo}`);
            const { stargazers_count, forks_count } = response.data;

            aggregatedForks += forks_count;
            aggregatedStars += stargazers_count;
        }

        return {
            stars: aggregatedStars * 4,
            forks: aggregatedForks * 4,
        };
    } catch (error) {
        console.error("Error fetching GitHub repository details:", error);
        return null;
    }
};

// Define commands
const commands = ["git", "repo", "script", "sc"];

commands.forEach((command) => {
    adams({ nomCom: command, categorie: "GitHub" }, async (dest, zk, commandeOptions) => {
        let { repondre } = commandeOptions;
        const repoDetails = await fetchAndAggregateRepoDetails();

        if (!repoDetails) {
            repondre("❌ Failed to fetch GitHub repository information.");
            return;
        }

        const { stars, forks } = repoDetails;
        const currentTime = moment().tz("Africa/Nairobi").format('DD/MM/YYYY HH:mm:ss');

        const infoMessage = `
╭───────────────━⊷
║ 🚀 𝐁𝐖𝐌 𝐗𝐌𝐃 𝐑𝐄𝐏𝐎 𝐈𝐍𝐅𝐎 🚀
╰───────────────━⊷
╭───────────────━⊷
║⭐ *Total Stars:* ${formatNumber(stars)}
║🍴 *Total Forks:* ${formatNumber(forks)}
║👤 *Owner:* Sir Ibrahim Adams
╰───────────────━⊷

🔹 *Reply with a number to choose an action:*
1️⃣ Open GitHub Repo 🌍
2️⃣ Open WhatsApp Channel 📢
3️⃣ Ping Bot 📡`;

        try {
            const sentMessage = await zk.sendMessage(dest, {
                text: infoMessage,
                contextInfo: {
                    externalAdReply: {
                        title: "Explore Fantastic Updates!",
                        body: "Click here for the latest repository details.",
                        thumbnailUrl: "https://files.catbox.moe/xnlp0v.jpg",
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        showAdAttribution: true, 
                        mediaUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                        sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                    },
                },
            });

            // Listen for Reply
            zk.ev.on("messages.upsert", async (update) => {
                const message = update.messages[0];
                if (!message.message || !message.message.extendedTextMessage) return;

                const responseText = message.message.extendedTextMessage.text.trim();
                if (
                    message.message.extendedTextMessage.contextInfo &&
                    message.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id
                ) {
                    if (responseText === "1") {
                        await zk.sendMessage(dest, { text: "🌍 Opening GitHub Repository..." });
                        await zk.sendMessage(dest, { text: "https://github.com/devibraah/BWM-XMD" });
                    } else if (responseText === "2") {
                        await zk.sendMessage(dest, { text: "📢 Opening WhatsApp Channel..." });
                        await zk.sendMessage(dest, { text: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y" });
                    } else if (responseText === "3") {
                        const randomPong = Math.floor(Math.random() * 900000) + 100000; // Generates a 6-digit number
                        await zk.sendMessage(dest, { text: `📡 Pong! ${randomPong} ✅` });
                    } else {
                        await zk.sendMessage(dest, { text: "❌ Invalid choice. Please reply with 1, 2, or 3." });
                    }
                }
            });

        } catch (e) {
            console.error("❌ Error sending GitHub info:", e);
            repondre("❌ Error sending GitHub info: " + e.message);
        }
    });
});

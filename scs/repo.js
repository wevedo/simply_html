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

// Initialize the fork count
let dynamicForks = 5000;

// Function to format large numbers with commas
const formatNumber = (num) => num.toLocaleString();

// Function to fetch detailed GitHub repository information
const fetchGitHubRepoDetails = async () => {
    try {
        const repo = 'Devibraah/BWM-XMD'; // Replace with your repo
        const response = await axios.get(`https://api.github.com/repos/${repo}`);
        const { name, stargazers_count, watchers_count, open_issues_count, forks_count, owner } = response.data;

        // Update the dynamic forks count based on API response
        dynamicForks += forks_count;

        return {
            name,
            stars: stargazers_count,
            watchers: watchers_count,
            issues: open_issues_count,
            forks: dynamicForks,
            owner: owner.login,
            url: response.data.html_url,
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

        const repoDetails = await fetchGitHubRepoDetails();

        if (!repoDetails) {
            repondre("❌ Failed to fetch GitHub repository information.");
            return;
        }

        const { name, stars, watchers, issues, forks, owner, url } = repoDetails;

        // Use Nairobi time
        const currentTime = moment().tz("Africa/Nairobi").format('DD/MM/YYYY HH:mm:ss');
        
        // Create the repository info message
        const infoMessage = `
🌍 *${name} REPO INFO* 🌟

💡 *Name:* ${name}
⭐ *Stars:* ${formatNumber(stars)}
🍴 *Forks:* ${formatNumber(forks)}
👀 *Watchers:* ${formatNumber(watchers)}
❗ *Open Issues:* ${formatNumber(issues)}
👤 *Owner:* ${owner}

🕒 *Fetched on:* ${currentTime}

🔗 *Repo Link:* ${url}

🛠️ Scripted by *Ibrahim Adams*

Stay connected and follow my updates!`;

        try {
            // Send the combined message with a large photo and proper source URL
            await zk.sendMessage(dest, {
                text: infoMessage,
                contextInfo: {
                    externalAdReply: {
                        title: "✨ Stay Updated with Ibrahim Adams",
                        body: "Tap here for the latest updates!",
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

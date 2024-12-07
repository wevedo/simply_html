
const fs = require('fs');
const path = require('path');
const vm = require('vm'); // Optional, for safer script execution

const scriptsFolder = path.join(__dirname, 'scs');  // Folder where your script files are stored

// Function to fetch and execute a specific script file
async function fetchAndExecuteScript(fileName) {
    try {
        const scriptPath = path.join(scriptsFolder, fileName);

        // Check if the file exists
        if (!fs.existsSync(scriptPath)) {
            throw new Error(`Script file ${fileName} does not exist.`);
        }

        // Read the script content from the file
        const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
        console.log(`${fileName} loaded successfully.`);

        // Create a sandboxed context for executing the script (optional)
        const sandbox = {
            console: console,
            atbverifierEtatJid: atbverifierEtatJid,
        };

        vm.createContext(sandbox); // Isolate the script environment
        vm.runInContext(scriptContent, sandbox); // Execute the script in the sandbox

        console.log(`${fileName} executed successfully.`);
    } catch (error) {
        console.error(`Error fetching or executing ${fileName}:`, error.message);
    }
}

// Example function for validating JID
function atbverifierEtatJid(jid) {
    if (!jid.endsWith('@s.whatsapp.net')) {
        console.error('Invalid JID format:', jid);
        return false;
    }
    console.log('JID verified:', jid);
    return true;
}

// List of script files to load and execute
const scriptFiles = [
    'REPO_URL.js',
    'ALIVE_URL.js',
    'ADAMS_URL.js',
    'SCAN_URL.js',
    'MENU_URL.js',
    'GROUP_URL.js',
    'GPT4_URL.js',
    'PAIR_URL.js',
    'YUO_URL.js',
    'VAR_URL.js',
    'PLAY_URL.js',
    'VCF_URL.js',
    'TO_URL.js',
    'HACK_URL.js',
];

// Fetch and execute all scripts in sequence
(async function executeScripts() {
    for (const scriptFile of scriptFiles) {
        await fetchAndExecuteScript(scriptFile);
    }
})();
/*
'use strict';

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






/*

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







































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































*/


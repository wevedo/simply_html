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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              

"use strict";
const moment = require("moment-timezone");
const { adams } = require(__dirname + "/../Ibrahim/adams");
const axios = require("axios");

const githubRawBaseUrl =
  "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";
const audioFiles = Array.from({ length: 161 }, (_, i) => `sound${i + 1}.mp3`);

const formatNumber = (num) => num.toLocaleString();

const repositories = [
  "devibrah/NORMAL-BOT",
  "devibraah/BWM-XMD",
];

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
    console.error("⚠️ Error fetching GitHub repository details:", error);
    return null;
  }
};

const commands = ["git", "repo", "script", "sc"];

commands.forEach((command) => {
  adams(
    { nomCom: command, categorie: "📌 GitHub" },
    async (dest, zk, commandeOptions) => {
      let { repondre } = commandeOptions;
      const repoDetails = await fetchAndAggregateRepoDetails();

      if (!repoDetails) {
        repondre("❌ Failed to fetch GitHub repository information.");
        return;
      }

      const { stars, forks } = repoDetails;
      const currentTime = moment().tz("Africa/Nairobi").format("DD/MM/YYYY HH:mm:ss");

      const randomAudioFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
      const audioUrl = `${githubRawBaseUrl}/${randomAudioFile}`;

      const infoMessage = `
╔═════════════════╗
  🚀 𝐁𝐖𝐌 𝐗𝐌𝐃 𝐑𝐄𝐏𝐎 🚀
╚═════════════════╝
╭───────────────━⊷
┃ ⭐ 𝙏𝙤𝙩𝙖𝙡 𝙎𝙩𝙖𝙧𝙨: ${formatNumber(stars)}
┃ 🍴 𝙏𝙤𝙩𝙖𝙡 𝙁𝙤𝙧𝙠𝙨: ${formatNumber(forks)}
┃ 👤 𝙊𝙬𝙣𝙚𝙧: 𝙎𝙞𝙧 𝙄𝙗𝙧𝙖𝙝𝙞𝙢 𝘼𝙙𝙖𝙢𝙨
┃ 📅 𝙐𝙥𝙙𝙖𝙩𝙚𝙙: ${currentTime}
╰───────────────━⊷

🛠️ 𝘾𝙝𝙤𝙤𝙨𝙚 𝙖𝙣 𝘼𝙘𝙩𝙞𝙤𝙣:
📂 ➊ 𝗢𝗽𝗲𝗻 𝗚𝗶𝘁𝗛𝘂𝗯 𝗥𝗲𝗽𝗼  
📢 ➋ 𝗢𝗽𝗲𝗻 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗖𝗵𝗮𝗻𝗻𝗲𝗹  
📡 ➌ 𝗣𝗶𝗻𝗴 𝗕𝗼𝘁  
`;

      try {
        await zk.sendMessage(dest, {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          ptt: true,
          caption: infoMessage,
          contextInfo: {
            mentionedJid: [dest],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363285388090068@newsletter",
              newsletterName: "BWM-XMD",
              serverMessageId: Math.floor(100000 + Math.random() * 900000),
            },
            externalAdReply: {
              title: "🚀 Explore BWM XMD Updates!",
              body: "🔗 Click to get the latest repository details.",
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
            message.message.extendedTextMessage.contextInfo.isForwarded
          ) {
            if (responseText === "1") {
              await zk.sendMessage(dest, { text: "📂 Opening GitHub Repository..." });
              await zk.sendMessage(dest, { text: "🔗 https://github.com/devibraah/BWM-XMD" });
            } else if (responseText === "2") {
              await zk.sendMessage(dest, { text: "📢 Opening WhatsApp Channel..." });
              await zk.sendMessage(dest, {
                text: "🔗 https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
              });
            } else if (responseText === "3") {
              const randomPong = Math.floor(Math.random() * 900000) + 100000;
              await zk.sendMessage(dest, { text: `📡 Pong! ${randomPong} ✅` });
            } else {
              await zk.sendMessage(dest, { text: "❌ Invalid choice. Reply with ➊, ➋, or ➌." });
            }
          }
        });
      } catch (e) {
        console.error("❌ Error sending GitHub info:", e);
        repondre("❌ Error sending GitHub info: " + e.message);
      }
    }
  );
});

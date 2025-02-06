const util = require('util');
const fs = require('fs-extra');
const axios = require('axios');
const { adams } = require(__dirname + "/../Ibrahim/adams");
const { format } = require(__dirname + "/../Ibrahim/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../config");

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

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

// Function to fetch GitHub repo data
const fetchGitHubStats = async () => {
    try {
        const repo = 'Devibraah/BWM-XMD'; // Replace with your repo
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

adams({ nomCom: "virusi", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage } = commandeOptions;
    let { cm } = require(__dirname + "/../framework//zokou");
    var coms = {};
    var mode = (s.MODE.toLowerCase() !== "yes") ? "private" : "public";

    cm.map((com) => {
        if (!coms[com.categorie]) coms[com.categorie] = [];
        coms[com.categorie].push(com.nomCom);
    });

    moment.tz.setDefault("Africa/Nairobi");
    const temps = moment().format('HH:mm:ss');
    const date = moment().format('DD/MM/YYYY');

    // Determine greeting based on time
    const hour = moment().hour();
    let greeting = "";
    
    if (hour >= 5 && hour < 12) {
        greeting = "🌅☀️ Good morning! Hope you have a fantastic day! 🌞";
    } else if (hour >= 12 && hour < 17) {
        greeting = "☀️😎 Good afternoon! Stay energized! 🌿";
    } else if (hour >= 17 && hour < 21) {
        greeting = "🌆✨ Good evening! Hope you had a great day! 🌙";
    } else {
        greeting = "🌙😴 Good night! Sweet dreams! 💫";
    }

    // Generate commands list
    let commandList = "\n\nAvailable Commands";
    for (let category in coms) {
        commandList += `\n\n*${category}*\n`;
        commandList += coms[category].map((cmd) => `- ${prefixe}${cmd}`).join("\n");
    }

    let infoMsg = `
╔════════════════════════╗
  ✦ ʙᴏᴛ ɴᴀᴍᴇ : ᴠɪʀᴜsɪ ᴍʙᴀʏᴀ ✦
  ✦ ᴠᴇʀsɪᴏɴ  : ${s.VERSION} ✦
╚════════════════════════╝

▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
  📅 ᴅᴀᴛᴇ : ${date}
  ⏰ ᴛɪᴍᴇ : ${temps}
  ⚡ ᴍᴏᴅᴇ : ${mode.toUpperCase()}
  🔮 ᴘʀᴇғɪx : [ ${prefixe} ]
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰

✦ ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}
✦ ᴘʟᴀᴛғᴏʀᴍ : ${os.platform().toUpperCase()}
✦ ᴍᴇᴍᴏʀʏ : ${format(os.totalmem() - os.freemem())} / ${format(os.totalmem())}

╭───────────────────────────╮
   ${greeting}, ${nomAuteurMessage.split("@")[0]}!
╰───────────────────────────╯\n\n`;

    let menuMsg = `${readmore}
╔══════════════⊶⋆☬⋆⊷══════════════╗
          🌀𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧🌀
╚══════════════⊶⋆☬⋆⊷══════════════╝\n`;

    const sortedCategories = Object.keys(coms).sort();
    sortedCategories.forEach((cat) => {
        menuMsg += `
┌───≪ ✥ ≫───┐
   📂 ${cat}
└───≪ ✥ ≫───┘
${coms[cat].map(cmd => `│   ➺ ${cmd}`).join('\n')}
│
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
    });

    menuMsg += `
╔══════════════════════════════╗
   🧬 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦
   👥 𝗨𝗦𝗘𝗥𝗦 : ${formattedTotalUsers}+
   ⌚ 𝗨𝗣𝗧𝗜𝗠𝗘 : ${runtime(process.uptime())}
╚══════════════════════════════╝

▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃
   𝗧𝘆𝗽𝗲 ${prefixe}𝗵𝗲𝗹𝗽 <𝗰𝗼𝗺𝗺𝗮𝗻𝗱>
   𝗳𝗼𝗿 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗱𝗲𝘁𝗮𝗶𝗹𝘀
▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃

✦͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙✦͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙✦
         🧪 𝗩𝗜𝗥𝗨𝗦𝗜 𝗠𝗕𝗔𝗬𝗔
✦͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙✦͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙✦`;

    try {
        // Keep the message sending logic the same
        // Update thumbnail URL and audio URL as needed

        await zk.sendMessage(dest, { 
            text: infoMsg + menuMsg,
            contextInfo: {
                mentionedJid: [nomAuteurMessage],
                externalAdReply: {
                    body: "🔬 𝗩𝗜𝗥𝗨𝗦𝗜 𝗠𝗕𝗔𝗬𝗔 🔍",
                    thumbnailUrl: "https://files.catbox.moe/xyz123.jpg", // Update thumbnail
                    sourceUrl: 'https://whatsapp.com/channel/...',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

        // Audio message remains similar
        await zk.sendMessage(dest, { 
            audio: { 
                url: "https://files.catbox.moe/new_audio.mp3" 
            },
            mimetype: 'audio/mp4',
            caption: "🎶 𝗕𝗠𝗪 𝗠𝗗 𝗧𝗛𝗘𝗠𝗘 🎵",
            // ... rest of audio message context
        });

    } catch (e) {
        console.log("⚠️ 𝗠𝗘𝗡𝗨 𝗘𝗥𝗥𝗢𝗥: " + e);
        repondre("⚠️ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝘀𝗲𝗻𝗱 𝗺𝗲𝗻𝘂: " + e);
    }
});

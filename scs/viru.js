const util = require('util');
const fs = require('fs-extra');
const axios = require('axios');
const os = require("os");
const moment = require("moment-timezone");
const { adams } = require(__dirname + "/../Ibrahim/adams");
const { format } = require(__dirname + "/../Ibrahim/mesfonctions");
const s = require(__dirname + "/../config");

// Constants
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

// Runtime function
const runtime = function (seconds) { 
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return `${d ? `${d}d, ` : ""}${h ? `${h}h, ` : ""}${m ? `${m}m, ` : ""}${s ? `${s}s` : ""}`;
};

// Fetch GitHub stats function
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

// Main command handler
adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim/adams");
    
    var coms = {};
    var mode = s.MODE.toLowerCase() === "public" ? "public" : "private";

    // Categorizing commands
    cm.forEach((com) => {
        const categoryUpper = com.categorie.toUpperCase();
        if (!coms[categoryUpper]) coms[categoryUpper] = [];
        coms[categoryUpper].push(com.nomCom);
    });

    moment.tz.setDefault(`${s.TZ}`);
    const temps = moment().format('HH:mm:ss');
    const date = moment().format('DD/MM/YYYY');
    const hour = moment().hour();

    let greeting = "Good night";
    if (hour >= 0 && hour <= 11) greeting = "Good morning";
    else if (hour >= 12 && hour <= 16) greeting = "Good afternoon";
    else if (hour >= 16 && hour <= 21) greeting = "Good evening";

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    let infoMsg = `
╔════════════════════════╗
  ✦ ʙᴏᴛ ɴᴀᴍᴇ : ᴠɪʀᴜsɪ ᴍʙᴀʏᴀ ✦
  ✦ ᴠᴇʀsɪᴏɴ  : ${s.VERSION} ✦
╚════════════════════════╝

📅 ᴅᴀᴛᴇ : ${date}
⏰ ᴛɪᴍᴇ : ${temps}
⚡ ᴍᴏᴅᴇ : ${mode.toUpperCase()}
🔮 ᴘʀᴇғɪx : [ ${prefixe} ]

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

✦͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙✦
         🧪 𝗩𝗜𝗥𝗨𝗦𝗜 𝗠𝗕𝗔𝗬𝗔
✦͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙͙✦`;

    try {
        await zk.sendMessage(dest, { 
            text: infoMsg + menuMsg,
            contextInfo: {
                mentionedJid: [nomAuteurMessage],
                externalAdReply: {
                    body: "🔬 𝗩𝗜𝗥𝗨𝗦𝗜 𝗠𝗕𝗔𝗬𝗔 🔍",
                    thumbnailUrl: "https://files.catbox.moe/xyz123.jpg",
                    sourceUrl: 'https://whatsapp.com/channel/...',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

        await zk.sendMessage(dest, { 
            audio: { url: "https://files.catbox.moe/new_audio.mp3" },
            mimetype: 'audio/mp4',
            caption: "🎶 𝗕𝗠𝗪 𝗠𝗗 𝗧𝗛𝗘𝗠𝗘 🎵",
        });

    } catch (e) {
        console.log("⚠️ 𝗠𝗘𝗡𝗨 𝗘𝗥𝗥𝗢𝗥: " + e);
        repondre("⚠️ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝘀𝗲𝗻𝗱 𝗺𝗲𝗻𝘂: " + e);
    }
});

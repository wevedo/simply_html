const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const fs = require("fs");
const os = require("os");
const s = require(__dirname + "/../config");
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require("@whiskeysockets/baileys");

// Utility functions from friend's code
const formatBytes = (bytes) => {
  if (bytes >= Math.pow(1024, 3)) return (bytes / Math.pow(1024, 3)).toFixed(2) + ' GB';
  else if (bytes >= Math.pow(1024, 2)) return (bytes / Math.pow(1024, 2)).toFixed(2) + ' MB';
  else if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return bytes.toFixed(2) + ' bytes';
};

// GitHub raw audio links
const githubRawBaseUrl = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";
const audioFiles = Array.from({ length: 100 }, (_, i) => `sound${i + 1}.mp3`);
const getRandomAudio = () => audioFiles[Math.floor(Math.random() * audioFiles.length)];

// Menu images
const menuImages = [
    "https://bwm-xmd-files.vercel.app/bwmxmd_lzgu8w.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd_9s9jr8.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd_psaclm.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd_1tksj5.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd_v4jirh.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd_d8cv2v.png",
    "https://files.catbox.moe/jwwjd3.jpeg",
    "https://files.catbox.moe/3k35q4.jpeg",
    "https://files.catbox.moe/sgl022.jpeg",
    "https://files.catbox.moe/xx6ags.jpeg",
];
const randomImage = () => menuImages[Math.floor(Math.random() * menuImages.length)];
const footer = "\n\n©Sir Ibrahim Adams\n\nᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ ʙᴇʟᴏᴡ ᴛᴏ ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ https://shorturl.at/z3b8v\n\n®2025 ʙᴡᴍ xᴍᴅ 🔥";

// GitHub repo stats
const fetchGitHubStats = async () => {
    try {
        const repo = "devibraah/BWM-XMD";
        const response = await axios.get(`https://api.github.com/repos/${repo}`);
        const forks = response.data.forks_count || 0;
        const stars = response.data.stargazers_count || 0;
        return (forks * 2) + (stars * 2);
    } catch (error) {
        console.error("Error fetching GitHub stats:", error);
        return 0;
    }
};

// Command list storage (ensures commands are stored only once)
const commandList = {};
let commandsStored = false;

adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { nomAuteurMessage, ms, repondre, prefixe } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim/adams");

    // Store commands only once
    if (!commandsStored) {
        cm.forEach((com) => {
            const categoryUpper = com.categorie.toUpperCase();
            if (!commandList[categoryUpper]) commandList[categoryUpper] = [];
            commandList[categoryUpper].push(`🟢 ${com.nomCom}`);
        });
        commandsStored = true; // Prevents further storing
    }

    moment.tz.setDefault(s.TZ || "Africa/Nairobi");
    const date = moment().format("DD/MM/YYYY");
    const time = moment().format("HH:mm:ss");
    const totalUsers = await fetchGitHubStats();
    const image = randomImage();

    // Dynamic Greeting Based on Time
    const hour = moment().hour();
    let greeting = "🌙 *Good Night! See you tomorrow!*";
    if (hour >= 5 && hour < 12) greeting = "🌅 *Good Morning! Let's kickstart your day!*";
    else if (hour >= 12 && hour < 18) greeting = "☀️ *Good Afternoon! Stay productive*";
    else if (hour >= 18 && hour < 22) greeting = "🌆 *Good Evening! Time to relax!*";

    // Custom Categories with Emojis
    const categoryGroups = {
        "🤖 AI MENU": ["ABU"],
        "🎵 AUTO EDIT MENU": ["AUDIO-EDIT"],
        "📥 DOWNLOAD MENU": ["BMW PICS", "SEARCH", "DOWNLOAD"],
        "🛠️ CONTROL MENU": ["CONTROL", "STICKCMD", "TOOLS"],
        "💬 CONVERSATION MENU": ["CONVERSION", "MPESA"],
        "😂 FUN MENU": ["HENTAI", "FUN", "REACTION"],
        "🎮 GAMES MENU": ["GAMES"],
        "🌍 GENERAL MENU": ["GENERAL"],
        "👨‍👨‍👦‍👦 GROUP MENU": ["GROUP"],
        "💻 GITHUB MENU": ["GITHUB"],
        "🖼️ IMAGE MENU": ["IMAGE-EDIT"],
        "🔤 LOGO MENU": ["LOGO"],
        "🛑 MODS MENU": ["MODS"],
        "📰 NEWS MENU": ["NEWS", "AI"],
        "🔗 CONNECTOR MENU": ["PAIR", "USER"],
        "🔍 SEARCH MENU": ["NEWS", "IA"],
        "🗣️ TTS MENU": ["TTS"],
        "⚙️ UTILITY MENU": ["UTILITY"],
        "🎌 ANIME MENU": ["WEEB"],
    };

    // Get memory info
    const totalMemoryBytes = os.totalmem();
    const freeMemoryBytes = os.freemem();

    // Create interactive message with buttons
    const msg = generateWAMessageFromContent(dest, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: `╭─────────────━┈⊷
│🤖 ʙᴏᴛ ɴᴀᴍᴇ: *ʙᴡᴍ-xᴍᴅ*
│📍 ᴠᴇʀꜱɪᴏɴ: 2.0.0
│👨‍💻 ᴏᴡɴᴇʀ : *sɪʀ ɪʙʀᴀʜɪᴍ*      
│👤 ɴᴜᴍʙᴇʀ: ${s.NUMERO_OWNER}
│📡 ᴘʟᴀᴛғᴏʀᴍ: *${os.platform()}*
│🛡 ᴍᴏᴅᴇ: *${process.env.MODE || "default"}*
│💫 ᴘʀᴇғɪx: *[${prefixe}]*
╰─────────────━┈⊷`
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: "© Powered By BWM-XMD"
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        ...(await prepareWAMessageMedia({ image: fs.readFileSync('./src/your_image.jpg') }, { upload: zk.waUploadToServer })),
                        title: ``,
                        gifPlayback: true,
                        subtitle: "",
                        hasMediaAttachment: false  
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [
                            {
                                "name": "single_select",
                                "buttonParamsJson": `{
                                    "title":"🔖 BWM-XMD MAIN MENU",
                                    "sections": [
                                        {
                                            "title":"😎 BWM-XMD ALL MENUS",
                                            "highlight_label":"🤩 ALL MENUS",
                                            "rows": [
                                                {
                                                    "header":"",
                                                    "title":"🔰 ᴀʟʟ ᴍᴇɴᴜ",
                                                    "description":"🎨 ALL COMMANDS IN ONE PLACE 🎨",
                                                    "id":"View All Menu"
                                                },
                                                {
                                                    "header":"",
                                                    "title":"⬇️ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ ᴍᴇɴᴜ",
                                                    "description":"📂 DOWNLOADER COMMANDS 🗂",
                                                    "id":"Downloader Menu"
                                                },
                                                {
                                                    "header":"",
                                                    "title":"👨‍👨‍👧‍👧 ɢʀᴏᴜᴘ ᴍᴇɴᴜ",
                                                    "description":"🥵 GROUP MANAGEMENT COMMANDS 🥵",
                                                    "id":"Group Menu"
                                                },
                                                {
                                                    "header":"",
                                                    "title":"👨‍🔧 ᴛᴏᴏʟ ᴍᴇɴᴜ",
                                                    "description":"🛠 TOOLS AND UTILITIES 🛠",
                                                    "id":"Tool Menu"
                                                },
                                                {
                                                    "header":"",
                                                    "title":"🗿 ᴍᴀɪɴ ᴍᴇɴᴜ",
                                                    "description":"📪 MAIN BOT COMMANDS 🗳",
                                                    "id":"Main Menu"
                                                },
                                                {
                                                    "header":"",
                                                    "title":"👨‍💻 ᴏᴡɴᴇʀ ᴍᴇɴᴜ",
                                                    "description":"😎 OWNER ONLY COMMANDS 👨‍💼",
                                                    "id":"Owner Menu"
                                                },
                                                {
                                                    "header":"",
                                                    "title":"✨ ᴀɪ ᴍᴇɴᴜ",
                                                    "description":"💫 AI COMMANDS 🎇",
                                                    "id":"Ai Menu"
                                                },
                                                {
                                                    "header":"",
                                                    "title":"🔍 sᴇᴀʀᴄʜ ᴍᴇɴᴜ 🔎",
                                                    "description":"♂️ SEARCH COMMANDS",
                                                    "id":"Search Menu"
                                                },
                                                {
                                                    "header":"",
                                                    "title":"🧚‍♂️ sᴛᴀʟᴋ ᴍᴇɴᴜ",
                                                    "description":"👨‍💼 STALKING COMMANDS 🪆",
                                                    "id":"Stalk Menu"
                                                },
                                                {
                                                    "header":"",
                                                    "title":"🥏 ᴄᴏɴᴠᴇʀᴛᴇʀ ᴍᴇɴᴜ",
                                                    "description":"🛷 FILE CONVERTER COMMANDS",
                                                    "id":"Converter Menu"
                                                }
                                            ]
                                        }
                                    ]
                                }`
                            }
                        ]
                    }),
                    contextInfo: {
                        mentionedJid: [ms.key.remoteJid], 
                        forwardingScore: 9999,
                        isForwarded: true,
                    }
                })
            }
        }
    }, {});

    await zk.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });

    // Send Random Audio
    const audioUrl = `${githubRawBaseUrl}/${getRandomAudio()}`;
    await zk.sendMessage(dest, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        ptt: true,
    });

    // Handle button selections
    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];
        if (!message.message || !message.message.templateButtonReplyMessage) return;

        const selectedId = message.message.templateButtonReplyMessage.selectedId;
        const totalMemory = formatBytes(totalMemoryBytes);
        const freeMemory = formatBytes(freeMemoryBytes);
        const serverInfo = `╭───❮ *sᴇʀᴠᴇʀ* ❯
│➥ 𝚃𝙾𝚃𝙰𝙻 𝚁𝙰𝙼: ${totalMemory}
│➥ 𝙵𝚁𝙴𝙴 𝚁𝙰𝙼: ${freeMemory}
╰━━━━━━━━━━━━━━━➥\n`;

        let responseText = "";
        
        switch(selectedId) {
            case "View All Menu":
                responseText = `hey ${nomAuteurMessage} ${greeting}
${serverInfo}
╭━❮ 𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙴𝚁 ❯━╮
┃✰ ${prefixe}𝙰𝚃𝚃𝙿
┃✰ ${prefixe}𝙰𝚃𝚃𝙿2
┃✰ ${prefixe}𝙰𝚃𝚃𝙿3
┃✰ ${prefixe}𝙴𝙱𝙸𝙽𝙰𝚁𝚈
┃✰ ${prefixe}𝙳𝙱𝙸𝙽𝙰𝚁𝚈
┃✰ ${prefixe}𝙴𝙼𝙾𝙹𝙸𝙼𝙸𝚇
┃✰ ${prefixe}𝙼𝙿3
╰━━━━━━━━━━━━━━━⪼
╭━❮ 𝙰𝙸 ❯━╮
┃✰ ${prefixe}𝙰𝚒
┃✰ ${prefixe}𝙱𝚞𝚐
┃✰ ${prefixe}𝚁𝚎𝚙𝚘𝚛𝚝
┃✰ ${prefixe}𝙶𝚙𝚝
┃✰ ${prefixe}𝙳𝚊𝚕𝚕𝚎
┃✰ ${prefixe}𝚁𝚎𝚖𝚒𝚗𝚒
┃✰ ${prefixe}𝙶𝚎𝚖𝚒𝚗𝚒
╰━━━━━━━━━━━━━━━⪼
╭━❮ 𝚃𝙾𝙾𝙻 ❯━╮
┃✰ ${prefixe}𝙲𝚊𝚕𝚌𝚞𝚕𝚊𝚝𝚘𝚛
┃✰ ${prefixe}𝚃𝚎𝚖𝚙𝚖𝚊𝚒𝚕
┃✰ ${prefixe}𝙲𝚑𝚎𝚌𝚔𝚖𝚊𝚒𝚕
┃✰ ${prefixe}𝚃𝚛𝚝
┃✰ ${prefixe}𝚃𝚝𝚜
╰━━━━━━━━━━━━━━━⪼
╭━❮ 𝙶𝚁𝙾𝚄𝙿 ❯━╮
┃✰ ${prefixe}𝙻𝚒𝚗𝚔𝙶𝚛𝚘𝚞𝚙
┃✰ ${prefixe}𝚂𝚎𝚝𝚙𝚙𝚐𝚌
┃✰ ${prefixe}𝚂𝚎𝚝𝚗𝚊𝚖𝚎
┃✰ ${prefixe}𝚂𝚎𝚝𝚍𝚎𝚜𝚌
┃✰ ${prefixe}𝙶𝚛𝚘𝚞𝚙
┃✰ ${prefixe}𝙶𝚌𝚜𝚎𝚝𝚝𝚒𝚗𝚐
┃✰ ${prefixe}𝚆𝚎𝚕𝚌𝚘𝚖𝚎
┃✰ ${prefixe}𝙰𝚍𝚍
┃✰ ${prefixe}𝙺𝚒𝚌𝚔
┃✰ ${prefixe}𝙷𝚒𝚍𝚎𝚃𝚊𝚐
┃✰ ${prefixe}𝚃𝚊𝚐𝚊𝚕𝚕
┃✰ ${prefixe}𝙰𝚗𝚝𝚒𝙻𝚒𝚗𝚔
┃✰ ${prefixe}𝙰𝚗𝚝𝚒𝚃𝚘𝚡𝚒𝚌
┃✰ ${prefixe}𝙿𝚛𝚘𝚖𝚘𝚝𝚎
┃✰ ${prefixe}𝙳𝚎𝚖𝚘𝚝𝚎
┃✰ ${prefixe}𝙶𝚎𝚝𝚋𝚒𝚘
╰━━━━━━━━━━━━━━━⪼
╭━❮ 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 ❯━╮
┃✰ ${prefixe}𝙰𝚙𝚔
┃✰ ${prefixe}𝙵𝚊𝚌𝚎𝚋𝚘𝚘𝚔
┃✰ ${prefixe}𝙼𝚎𝚍𝚒𝚊𝚏𝚒𝚛𝚎
┃✰ ${prefixe}𝙿𝚒𝚗𝚝𝚎𝚛𝚎𝚜𝚝𝚍𝚕
┃✰ ${prefixe}𝙶𝚒𝚝𝚌𝚕𝚘𝚗𝚎
┃✰ ${prefixe}𝙶𝚍𝚛𝚒𝚟𝚎
┃✰ ${prefixe}𝙸𝚗𝚜𝚝𝚊
┃✰ ${prefixe}𝚈𝚝𝚖𝚙3
┃✰ ${prefixe}𝚈𝚝𝚖𝚙4
┃✰ ${prefixe}𝙿𝚕𝚊𝚢
┃✰ ${prefixe}𝚂𝚘𝚗𝚐
┃✰ ${prefixe}𝚅𝚒𝚍𝚎𝚘
┃✰ ${prefixe}𝚈𝚝𝚖𝚙3𝚍𝚘𝚌
┃✰ ${prefixe}𝚈𝚝𝚖𝚙4𝚍𝚘𝚌
┃✰ ${prefixe}𝚃𝚒𝚔𝚝𝚘𝚔
╰━━━━━━━━━━━━━━━⪼
╭━❮ 𝚂𝙴𝙰𝚁𝙲𝙷 ❯━╮
┃✰ ${prefixe}𝙿𝚕𝚊𝚢
┃✰ ${prefixe}𝚈𝚝𝚜
┃✰ ${prefixe}𝙸𝚖𝚍𝚋
┃✰ ${prefixe}𝙶𝚘𝚘𝚐𝚕𝚎
┃✰ ${prefixe}𝙶𝚒𝚖𝚊𝚐𝚎
┃✰ ${prefixe}𝙿𝚒𝚗𝚝𝚎𝚛𝚎𝚜𝚝
┃✰ ${prefixe}𝚆𝚊𝚕𝚕𝚙𝚊𝚙𝚎𝚛
┃✰ ${prefixe}𝚆𝚒𝚔𝚒𝚖𝚎𝚍𝚒𝚊
┃✰ ${prefixe}𝚈𝚝𝚕𝚎𝚊𝚛𝚌𝚑
┃✰ ${prefixe}𝚁𝚒𝚗𝚐𝚝𝚘𝚗𝚎
┃✰ ${prefixe}𝙻𝚢𝚛𝚒𝚌𝚜
╰━━━━━━━━━━━━━━━⪼
╭━❮ 𝙼𝙰𝙸𝙽 ❯━╮
┃✰ ${prefixe}𝙿𝚒𝚗𝚐
┃✰ ${prefixe}𝙰𝚕𝚒𝚟𝚎
┃✰ ${prefixe}𝙾𝚠𝚗𝚎𝚛
┃✰ ${prefixe}𝙼𝚎𝚗𝚞
┃✰ ${prefixe}𝙸𝚗𝚏𝚘𝚋𝚘𝚝
╰━━━━━━━━━━━━━━━⪼
╭━❮ 𝙾𝚆𝙽𝙴𝚁 ❯━╮
┃✰ ${prefixe}𝙹𝚘𝚒𝚗
┃✰ ${prefixe}𝙻𝚎𝚊𝚟𝚎
┃✰ ${prefixe}𝙱𝚕𝚘𝚌𝚔
┃✰ ${prefixe}𝚄𝚗𝚋𝚕𝚘𝚌𝚔
┃✰ ${prefixe}𝚂𝚎𝚝𝚙𝚙𝚋𝚘𝚝
┃✰ ${prefixe}𝙰𝚗𝚝𝚒𝚌𝚊𝚕𝚕
┃✰ ${prefixe}𝚂𝚎𝚝𝚜𝚝𝚊𝚝𝚞𝚜
┃✰ ${prefixe}𝚂𝚎𝚝𝚗𝚊𝚖𝚎𝚋𝚘𝚝
┃✰ ${prefixe}𝙰𝚞𝚝𝚘𝚃𝚢𝚙𝚒𝚗𝚐
┃✰ ${prefixe}𝙰𝚕𝚠𝚊𝚢𝚜𝙾𝚗𝚕𝚒𝚗𝚎
┃✰ ${prefixe}𝙰𝚞𝚝𝚘𝚁𝚎𝚊𝚍
┃✰ ${prefixe}𝚊𝚞𝚝𝚘𝚜𝚟𝚒𝚎𝚠
╰━━━━━━━━━━━━━━━⪼
╭━❮ 𝚂𝚃𝙰𝙻𝙺 ❯━╮
┃✰ ${prefixe}𝚃𝚛𝚞𝚎𝚌𝚊𝚕𝚕𝚎𝚛
┃✰ ${prefixe}𝙸𝚗𝚜𝚝𝚊𝚂𝚝𝚊𝚕𝚔
┃✰ ${prefixe}𝙶𝚒𝚝𝚑𝚞𝚋𝚂𝚝𝚊𝚕𝚔
╰━━━━━━━━━━━━━━━⪼`;
                break;
                
            case "Downloader Menu":
                responseText = `${serverInfo}
╭━❮ 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 ❯━╮
┃✰ ${prefixe}𝙰𝚙𝚔
┃✰ ${prefixe}𝙵𝚊𝚌𝚎𝚋𝚘𝚘𝚔
┃✰ ${prefixe}𝙼𝚎𝚍𝚒𝚊𝚏𝚒𝚛𝚎
┃✰ ${prefixe}𝙿𝚒𝚗𝚝𝚎𝚛𝚎𝚜𝚝𝚍𝚕
┃✰ ${prefixe}𝙶𝚒𝚝𝚌𝚕𝚘𝚗𝚎
┃✰ ${prefixe}𝙶𝚍𝚛𝚒𝚟𝚎
┃✰ ${prefixe}𝙸𝚗𝚜𝚝𝚊
┃✰ ${prefixe}𝚈𝚝𝚖𝚙3
┃✰ ${prefixe}𝚈𝚝𝚖𝚙4
┃✰ ${prefixe}𝙿𝚕𝚊𝚢
┃✰ ${prefixe}𝚂𝚘𝚗𝚐
┃✰ ${prefixe}𝚅𝚒𝚍𝚎𝚘
┃✰ ${prefixe}𝚈𝚝𝚖𝚙3𝚍𝚘𝚌
┃✰ ${prefixe}𝚈𝚝𝚖𝚙4𝚍𝚘𝚌
┃✰ ${prefixe}𝚃𝚒𝚔𝚝𝚘𝚔
╰━━━━━━━━━━━━━━━⪼`;
                break;
                
            case "Group Menu":
                responseText = `${serverInfo}
╭━❮ 𝙶𝚁𝙾𝚄𝙿 ❯━╮
┃✰ ${prefixe}𝙻𝚒𝚗𝚔𝙶𝚛𝚘𝚞𝚙
┃✰ ${prefixe}𝚂𝚎𝚝𝚙𝚙𝚐𝚌
┃✰ ${prefixe}𝚂𝚎𝚝𝚗𝚊𝚖𝚎
┃✰ ${prefixe}𝚂𝚎𝚝𝚍𝚎𝚜𝚌
┃✰ ${prefixe}𝙶𝚛𝚘𝚞𝚙
┃✰ ${prefixe}𝚆𝚎𝚕𝚌𝚘𝚖𝚎
┃✰ ${prefixe}𝙰𝚍𝚍
┃✰ ${prefixe}𝙺𝚒𝚌𝚔
┃✰ ${prefixe}𝙷𝚒𝚍𝚎𝚃𝚊𝚐
┃✰ ${prefixe}𝚃𝚊𝚐𝚊𝚕𝚕
┃✰ ${prefixe}𝙰𝚗𝚝𝚒𝙻𝚒𝚗𝚔
┃✰ ${prefixe}𝙰𝚗𝚝𝚒𝚃𝚘𝚡𝚒𝚌
┃✰ ${prefixe}𝙿𝚛𝚘𝚖𝚘𝚝𝚎
┃✰ ${prefixe}𝙳𝚎𝚖𝚘𝚝𝚎
┃✰ ${prefixe}𝙶𝚎𝚝𝚋𝚒𝚘
╰━━━━━━━━━━━━━━━⪼`;
                break;
                
            case "Main Menu":
                responseText = `${serverInfo}
╭━❮ 𝙼𝙰𝙸𝙽 ❯━╮
┃✰ ${prefixe}𝙿𝚒𝚗𝚐
┃✰ ${prefixe}𝙰𝚕𝚒𝚟𝚎
┃✰ ${prefixe}𝙾𝚠𝚗𝚎𝚛
┃✰ ${prefixe}𝙼𝚎𝚗𝚞
┃✰ ${prefixe}𝙸𝚗𝚏𝚘𝚋𝚘𝚝
╰━━━━━━━━━━━━━━━⪼`;
                break;
                
            case "Owner Menu":
                responseText = `${serverInfo}
╭━❮ 𝙾𝚆𝙽𝙴𝚁 ❯━╮
┃✰ ${prefixe}𝙹𝚘𝚒𝚗
┃✰ ${prefixe}𝙻𝚎𝚊𝚟𝚎
┃✰ ${prefixe}𝙱𝚕𝚘𝚌𝚔
┃✰ ${prefixe}𝚄𝚗𝚋𝚕𝚘𝚌𝚔
┃✰ ${prefixe}𝙱𝚌𝚐𝚛𝚘𝚞𝚙
┃✰ ${prefixe}𝙱𝚌𝚊𝚕𝚕
┃✰ ${prefixe}𝚂𝚎𝚝𝚙𝚙𝚋𝚘𝚝
┃✰ ${prefixe}𝙰𝚗𝚝𝚒𝚌𝚊𝚕𝚕
┃✰ ${prefixe}𝚂𝚎𝚝𝚜𝚝𝚊𝚝𝚞𝚜
┃✰ ${prefixe}𝚂𝚎𝚝𝚗𝚊𝚖𝚎𝚋𝚘𝚝
┃✰ ${prefixe}𝙰𝚞𝚝𝚘𝚃𝚢𝚙𝚒𝚗𝚐
┃✰ ${prefixe}𝙰𝚕𝚠𝚊𝚢𝚜𝙾𝚗𝚕𝚒𝚗𝚎
┃✰ ${prefixe}𝙰𝚞𝚝𝚘𝚁𝚎𝚊𝚍
┃✰ ${prefixe}𝚊𝚞𝚝𝚘𝚜𝚟𝚒𝚎𝚠
╰━━━━━━━━━━━━━━━⪼`;
                break;
                
            case "Search Menu":
                responseText = `${serverInfo}
╭━❮ 𝚂𝙴𝙰𝚁𝙲𝙷 ❯━╮
┃✰ ${prefixe}𝙿𝚕𝚊𝚢
┃✰ ${prefixe}𝚈𝚝𝚜
┃✰ ${prefixe}𝙸𝚖𝚍𝚋
┃✰ ${prefixe}𝙶𝚘𝚘𝚐𝚕𝚎
┃✰ ${prefixe}𝙶𝚒𝚖𝚊𝚐𝚎
┃✰ ${prefixe}𝙿𝚒𝚗𝚝𝚎𝚛𝚎𝚜𝚝
┃✰ ${prefixe}𝚆𝚊𝚕𝚕𝚙𝚊𝚙𝚎𝚛
┃✰ ${prefixe}𝚆𝚒𝚔𝚒𝚖𝚎𝚍𝚒𝚊
┃✰ ${prefixe}𝚈𝚝𝚕𝚎𝚊𝚛𝚌𝚑
┃✰ ${prefixe}𝚁𝚒𝚗𝚐𝚝𝚘𝚗𝚎
┃✰ ${prefixe}𝙻𝚢𝚛𝚒𝚌𝚜
╰━━━━━━━━━━━━━━━⪼`;
                break;
                
            case "Stalk Menu":
                responseText = `${serverInfo}
╭━❮ 𝚂𝚃𝙰𝙻𝙺 ❯━╮
┃✰ ${prefixe}𝙽𝚘𝚠𝚊
┃✰ ${prefixe}𝚃𝚛𝚞𝚎𝚌𝚊𝚕𝚕𝚎𝚛
┃✰ ${prefixe}𝙸𝚗𝚜𝚝𝚊𝚂𝚝𝚊𝚕𝚔
┃✰ ${prefixe}𝙶𝚒𝚝𝚑𝚞𝚋𝚂𝚝𝚊𝚕𝚔
╰━━━━━━━━━━━━━━━⪼`;
                break;
                
            case "Tool Menu":
                responseText = `${serverInfo}
╭━❮ 𝚃𝙾𝙾𝙻 ❯━╮
┃✰ ${prefixe}𝙲𝚊𝚕𝚌𝚞𝚕𝚊𝚝𝚘𝚛
┃✰ ${prefixe}𝚃𝚎𝚖𝚙𝚖𝚊𝚒𝚕
┃✰ ${prefixe}𝙲𝚑𝚎𝚌𝚔𝚖𝚊𝚒𝚕
┃✰ ${prefixe}𝙸𝚗𝚏𝚘
┃✰ ${prefixe}𝚃𝚛𝚝
┃✰ ${prefixe}𝚃𝚝𝚜
╰━━━━━━━━━━━━━━━⪼`;
                break;
                
            case "Ai Menu":
                responseText = `${serverInfo}
╭━❮ 𝙰𝙸 ❯━╮
┃✰ ${prefixe}𝙰𝚒
┃✰ ${prefixe}𝙱𝚞𝚐
┃✰ ${prefixe}𝚁𝚎𝚙𝚘𝚛𝚝
┃✰ ${prefixe}𝙶𝚙𝚝
┃✰ ${prefixe}𝙳𝚊𝚕𝚕𝚎
┃✰ ${prefixe}𝚁𝚎𝚖𝚒𝚗𝚒
┃✰ ${prefixe}𝙶𝚎𝚖𝚒𝚗𝚒
╰━━━━━━━━━━━━━━━⪼`;
                break;
                
            case "Converter Menu":
                responseText = `${serverInfo}
╭━❮ 𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙴𝚁 ❯━╮
┃✰ ${prefixe}𝙰𝚃𝚃𝙿
┃✰ ${prefixe}𝙰𝚃𝚃𝙿2
┃✰ ${prefixe}𝙰𝚃𝚃𝙿3
┃✰ ${prefixe}𝙴𝙱𝙸𝙽𝙰𝚁𝚈
┃✰ ${prefixe}𝙳𝙱𝙸𝙽𝙰𝚁𝚈
┃✰ ${prefixe}𝙴𝙼𝙾𝙹𝙸𝙼𝙸𝚇
┃✰ ${prefixe}𝙼𝙿3
╰━━━━━━━━━━━━━━━⪼`;
                break;
                
            default:
                return;
        }

        await zk.sendMessage(dest, {
            image: { url: randomImage() },
            caption: responseText + footer,
            contextInfo: {
                mentionedJid: [message.key.remoteJid],
                forwardingScore: 9999,
                isForwarded: true
            }
        }, { quoted: message });
    });
});

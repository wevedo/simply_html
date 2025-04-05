const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const os = require("os");
const s = require(__dirname + "/../config");
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require("@whiskeysockets/baileys");

// Menu images from URLs
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

adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { nomAuteurMessage, ms, repondre, prefixe } = commandeOptions;

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

    // Memory info
    const totalMemoryBytes = os.totalmem();
    const freeMemoryBytes = os.freemem();
    const formatBytes = (bytes) => {
        if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return bytes + ' bytes';
    };

    // Create the interactive message with proper button structure
    const msg = {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2
                },
                interactiveMessage: {
                    header: {
                        title: "BWM-XMD MENU",
                        subtitle: "Interactive Menu",
                        hasMediaAttachment: true,
                        ...(await prepareWAMessageMedia({ 
                            image: { url: image } 
                        }, { upload: zk.waUploadToServer }))
                    },
                    body: {
                        text: `╭─❖ 𓆩 ⚡ 𓆪 ❖─╮
       𝐁𝐖𝐌 𝐗𝐌𝐃    
╰─❖ 𓆩 ⚡ 𓆪 ❖─╯  
╭─❖
┃🕵️ ᴜsᴇʀ ɴᴀᴍᴇ: ${nomAuteurMessage}
┃📅 ᴅᴀᴛᴇ: ${date}
┃⏰ ᴛɪᴍᴇ: ${time}
┃👥 ʙᴡᴍ ᴜsᴇʀs: 1${totalUsers}
┃💾 ᴍᴇᴍᴏʀʏ: ${formatBytes(freeMemoryBytes)}/${formatBytes(totalMemoryBytes)}
╰─❖

${greeting}`
                    },
                    footer: {
                        text: "© Powered By BWM-XMD"
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "BWM-XMD MAIN MENU",
                                    sections: [
                                        {
                                            title: "MAIN MENU OPTIONS",
                                            highlight_label: "🤩 SELECT MENU",
                                            rows: [
                                                {
                                                    header: "",
                                                    title: "📜 ALL COMMANDS",
                                                    description: "Show all available commands",
                                                    id: "all_commands"
                                                },
                                                {
                                                    header: "",
                                                    title: "⬇️ DOWNLOADER",
                                                    description: "Media download commands",
                                                    id: "downloader"
                                                },
                                                {
                                                    header: "",
                                                    title: "👥 GROUP",
                                                    description: "Group management commands",
                                                    id: "group"
                                                },
                                                {
                                                    header: "",
                                                    title: "🛠️ TOOLS",
                                                    description: "Utility tools",
                                                    id: "tools"
                                                },
                                                {
                                                    header: "",
                                                    title: "🤖 AI",
                                                    description: "AI commands",
                                                    id: "ai"
                                                },
                                                {
                                                    header: "",
                                                    title: "🔍 SEARCH",
                                                    description: "Search commands",
                                                    id: "search"
                                                },
                                                {
                                                    header: "",
                                                    title: "👑 OWNER",
                                                    description: "Owner-only commands",
                                                    id: "owner"
                                                }
                                            ]
                                        }
                                    ]
                                })
                            }
                        ]
                    },
                    contextInfo: {
                        mentionedJid: [ms.key.remoteJid],
                        forwardingScore: 9999,
                        isForwarded: true
                    }
                }
            }
        }
    };

    // Send the message with buttons
    await zk.sendMessage(dest, msg);

    // Button selection handler
    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];
        if (!message.message) return;

        // Get the selected button ID using your friend's method
        let selectedId;
        const selectedButtonId = message.message?.templateButtonReplyMessage?.selectedId;
        const interactiveResponseMessage = message.message?.interactiveResponseMessage;
        
        if (interactiveResponseMessage) {
            const paramsJson = interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson;
            if (paramsJson) {
                const params = JSON.parse(paramsJson);
                selectedId = params.id;
            }
        }
        selectedId = selectedId || selectedButtonId;

        if (!selectedId) return;

        const serverInfo = `╭───❮ *sᴇʀᴠᴇʀ* ❯
│➥ 𝚃𝙾𝚃𝙰𝙻 𝚁𝙰𝙼: ${formatBytes(totalMemoryBytes)}
│➥ 𝙵𝚁𝙴𝙴 𝚁𝙰𝙼: ${formatBytes(freeMemoryBytes)}
╰━━━━━━━━━━━━━━━➥\n`;

        let responseText = "";
        
        switch(selectedId) {
            case "all_commands":
                responseText = `${serverInfo}
╭━❮ 𝙰𝙻𝙻 𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂 ❯━╮
┃✰ Type ${prefixe}help to see all commands
┃✰ Or select a specific category below
╰━━━━━━━━━━━━━━━⪼`;
                break;
                
            case "downloader":
                responseText = `${serverInfo}
╭━❮ 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁 ❯━╮
┃✰ ${prefixe}apk
┃✰ ${prefixe}facebook
┃✰ ${prefixe}mediafire
┃✰ ${prefixe}ytmp3
┃✰ ${prefixe}ytmp4
┃✰ ${prefixe}play
┃✰ ${prefixe}video
┃✰ ${prefixe}tiktok
╰━━━━━━━━━━━━━━━⪼`;
                break;
                
            case "group":
                responseText = `${serverInfo}
╭━❮ 𝙶𝚁𝙾𝚄𝙿 ❯━╮
┃✰ ${prefixe}linkgroup
┃✰ ${prefixe}setppgc
┃✰ ${prefixe}setname
┃✰ ${prefixe}setdesc
┃✰ ${prefixe}add
┃✰ ${prefixe}kick
┃✰ ${prefixe}promote
┃✰ ${prefixe}demote
╰━━━━━━━━━━━━━━━⪼`;
                break;
                
            case "tools":
                responseText = `${serverInfo}
╭━❮ 𝚃𝙾𝙾𝙻𝚂 ❯━╮
┃✰ ${prefixe}calc
┃✰ ${prefixe}tempmail
┃✰ ${prefixe}checkmail
┃✰ ${prefixe}trt
┃✰ ${prefixe}tts
╰━━━━━━━━━━━━━━━⪼`;
                break;
                
            case "ai":
                responseText = `${serverInfo}
╭━❮ 𝙰𝙸 ❯━╮
┃✰ ${prefixe}ai
┃✰ ${prefixe}gpt
┃✰ ${prefixe}dalle
┃✰ ${prefixe}remini
┃✰ ${prefixe}gemini
╰━━━━━━━━━━━━━━━⪼`;
                break;
                
            case "search":
                responseText = `${serverInfo}
╭━❮ 𝚂𝙴𝙰𝚁𝙲𝙷 ❯━╮
┃✰ ${prefixe}play
┃✰ ${prefixe}yts
┃✰ ${prefixe}google
┃✰ ${prefixe}gimage
┃✰ ${prefixe}pinterest
┃✰ ${prefixe}wallpaper
╰━━━━━━━━━━━━━━━⪼`;
                break;
                
            case "owner":
                responseText = `${serverInfo}
╭━❮ 𝙾𝚆𝙽𝙴𝚁 ❯━╮
┃✰ ${prefixe}join
┃✰ ${prefixe}leave
┃✰ ${prefixe}block
┃✰ ${prefixe}unblock
┃✰ ${prefixe}setppbot
┃✰ ${prefixe}setstatus
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

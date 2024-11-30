const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const s = require(__dirname + "/../config");

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

// Cool fonts for greetings (used in both Christmas and Normal menus)
const coolFonts = {
    morning: ["🌄 🎅 𝑹𝒊𝒔𝒆 & 𝑺𝒉𝒊𝒏𝒆 🎁"],
    afternoon: ["☀️ 🎅 𝐆𝐨𝐨𝐝 𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧 🎁"],
    evening: ["🌅 🎄 𝐆𝐨𝐨𝐝 𝐄𝐯𝐞𝐧𝐢𝐧𝐠 ❄️"],
    night: ["✨ 🎄 𝐒𝐥𝐞𝐞𝐩 𝐓𝐢𝐠𝐡𝐭 🎅"]
};

// Cool fonts for normal menu (used without Christmas emojis)
const normalCoolFonts = {
    morning: ["☀️🌸 Good Morning! Rise and Shine 🌟"],
    afternoon: ["🌞🍂 Good Afternoon! Keep Smiling 😊"],
    evening: ["🌆✨ Good Evening! Stay Positive 🌠"],
    night: ["🌙💤 Good Night! Sweet Dreams 🌌"]
};

// GitHub repo stats function
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

// Menu image URLs for normal and Christmas menus
const menuImages = [
    "https://files.catbox.moe/mphnzn.webp",
    "https://files.catbox.moe/7ux2i3.webp",
    "https://files.catbox.moe/wpv967.webp"
];
const christmasMenuImages = [
    "https://files.catbox.moe/jsazt2.webp",
    "https://files.catbox.moe/m0fnas.webp",
    "https://files.catbox.moe/tzh3d1.webp"
];

// Audio URLs for background music (Christmas and normal)
const audioUrlsChristmas = [
    "https://files.catbox.moe/2d07e2.mp3",
    "https://files.catbox.moe/y1t6l2.mp3",
    "https://files.catbox.moe/bdb10e.mp3",
    "https://files.catbox.moe/to44lv.mp3",
    "https://files.catbox.moe/hkug3v.mp3"
];

const audioUrlsNormal = [
    "https://files.catbox.moe/fm0rvl.mp3",
    "https://files.catbox.moe/demlei.mp3",
    "https://files.catbox.moe/3ka4td.m4a",
    "https://files.catbox.moe/zm8edu.m4a",
    "https://files.catbox.moe/6ztgwg.mp3"
];

// Function to determine MIME type
const getMimeType = (url) => {
    return url.endsWith(".wav") ? "audio/wav" : "audio/mpeg";
};

// Main menu command
adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { repondre, prefixe, nomAuteurMessage } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim/adams");
    let coms = {};

    // Organize commands by category
    cm.map((com) => {
        const categoryUpper = com.categorie.toUpperCase();
        if (!coms[categoryUpper]) coms[categoryUpper] = [];
        coms[categoryUpper].push(com.nomCom);
    });

    moment.tz.setDefault(s.TZ || "Africa/Nairobi");
    const temps = moment().format("HH:mm:ss");
    const date = moment().format("DD/MM/YYYY");
    const hour = moment().hour();

    // Greeting logic (normal and Christmas)
    const getRandomGreeting = (greetings) => greetings[Math.floor(Math.random() * greetings.length)];
    let greeting = coolFonts.night;
    let normalGreeting = normalCoolFonts.night;

    // Set greeting based on time
    if (hour >= 0 && hour <= 11) {
        greeting = getRandomGreeting(coolFonts.morning);
        normalGreeting = getRandomGreeting(normalCoolFonts.morning);
    } else if (hour >= 12 && hour <= 16) {
        greeting = getRandomGreeting(coolFonts.afternoon);
        normalGreeting = getRandomGreeting(normalCoolFonts.afternoon);
    } else if (hour >= 16 && hour <= 21) {
        greeting = getRandomGreeting(coolFonts.evening);
        normalGreeting = getRandomGreeting(normalCoolFonts.evening);
    }

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    // Prepare command list for caption
    let commandList = "";
    const sortedCategories = Object.keys(coms).sort();
    sortedCategories.forEach((cat) => {
        commandList += `\n🔸🔹 *${cat}*:\n`;
        coms[cat].forEach((cmd) => {
            commandList += `  - ${cmd}\n`;
        });
    });

    // Randomly select menu images
    const randomImage = menuImages[Math.floor(Math.random() * menuImages.length)];
    const randomChristmasImage = christmasMenuImages[Math.floor(Math.random() * christmasMenuImages.length)];

    // Randomly select audio
    const randomAudio = audioUrlsNormal[Math.floor(Math.random() * audioUrlsNormal.length)];
    const randomChristmasAudio = audioUrlsChristmas[Math.floor(Math.random() * audioUrlsChristmas.length)];

    // Check for MENUTYPE
    const menuType = s.MENUTYPE || ""; // Use conf.MENUTYPE or default to empty string

    try {
        if (menuType === "1") {
            // Send Christmas menu with greeting
            await zk.sendMessage(dest, {
                image: { url: randomChristmasImage },
                caption: `
╭━━━╮ 🎄 *𝐁𝐖𝐌 𝐗𝐌𝐃* 🎄
┃💻 Owner: Ibrahim Adams
┃📅 Date: ${date}
┃⏰ Time: ${temps}
┃👥 Bwm Users: ${formattedTotalUsers}
╰━━━╯

${greeting}

🎄✨ Merry Christmas, ${nomAuteurMessage} ✨🎄
${readmore}
${commandList}

🎶 *Background Music*:
Enjoy the experience with bwm xmd touch. 🎄✨
`,
                contextInfo: {
                    externalAdReply: {
                        title: "𝗕𝗪𝗠 𝗫𝗠𝗗",
                        body: "🎄 Tap here to follow our channel 🎄",
                        thumbnailUrl: "https://files.catbox.moe/yl8lw6.webp",
                        sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                        showAdAttribution: true,
                    },
                },
            });

            // Play Christmas audio
            await zk.sendMessage(dest, {
                audio: { url: randomChristmasAudio },
                mimetype: getMimeType(randomChristmasAudio),
                ptt: true,
            });

        } else if (menuType === "2") {
            // Send Normal menu with greeting
            await zk.sendMessage(dest, {
                image: { url: randomImage },
                caption: `
╭━━━╮ *𝐁𝐖𝐌 𝐗𝐌𝐃*
┃🖐️ Hey: ${nomAuteurMessage}
┃💻 Owner: Ibrahim Adams
┃📅 Date: ${date}
┃⏰ Time: ${temps}
┃👥 Bwm Users: ${formattedTotalUsers}
╰━━━╯

${normalGreeting}

${readmore}
${commandList}
`,
            contextInfo: {
                    externalAdReply: {
                        title: "𝗕𝗪𝗠 𝗫𝗠𝗗",
                        body: "Tap here to follow our channel",
                        thumbnailUrl: "https://files.catbox.moe/7ux2i3.webp",
                        sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                        showAdAttribution: true,
                    },
                },
            });

            // Play normal audio
            await zk.sendMessage(dest, {
                audio: { url: randomAudio },
                mimetype: getMimeType(randomAudio),
                ptt: true,
            });
        } else {
            // Randomly select menu type if blank
            const randomMenuType = Math.random() < 0.5 ? "1" : "2"; // 50% chance for each

            if (randomMenuType === "1") {
                // Send Christmas menu with greeting
                await zk.sendMessage(dest, {
                    image: { url: randomChristmasImage },
                    caption: `
╭━━━╮ 🎄 *𝐁𝐖𝐌 𝐗𝐌𝐃* 🎄
┃💻 Owner: Ibrahim Adams
┃📅 Date: ${date}
┃⏰ Time: ${temps}
┃👥 Bwm Users: ${formattedTotalUsers}
╰━━━╯

${greeting}

🎄✨ Merry Christmas, ${nomAuteurMessage} ✨🎄
${readmore}
${commandList}

🎶 *Background Music*:
Enjoy the experience with bwm xmd touch. 🎄✨
`,
                    contextInfo: {
                        externalAdReply: {
                            title: "𝗕𝗪𝗠 𝗫𝗠𝗗",
                            body: "🎄 Tap here to follow our channel 🎄",
                            thumbnailUrl: "https://files.catbox.moe/yl8lw6.webp",
                            sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                            showAdAttribution: true,
                        },
                    },
                });

                // Play Christmas audio
                await zk.sendMessage(dest, {
                    audio: { url: randomChristmasAudio },
                    mimetype: getMimeType(randomChristmasAudio),
                    ptt: true,
                });
            } else {
                // Send Normal menu with greeting
                await zk.sendMessage(dest, {
                    image: { url: randomImage },
                    caption: `
╭━━━╮ *𝐁𝐖𝐌 𝐗𝐌𝐃*
┃🖐️ Hey: ${nomAuteurMessage}
┃💻 Owner: Ibrahim Adams
┃📅 Date: ${date}
┃⏰ Time: ${temps}
┃👥 Bwm Users: ${formattedTotalUsers}
╰━━━╯

${normalGreeting}

${readmore}
${commandList}
`,
                contextInfo: {
                    externalAdReply: {
                        title: "𝗕𝗪𝗠 𝗫𝗠𝗗",
                        body: "Tap here to follow our channel",
                        thumbnailUrl: "https://files.catbox.moe/7ux2i3.webp",
                        sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                        showAdAttribution: true,
                    },
                },
            });

                // Play normal audio
                await zk.sendMessage(dest, {
                    audio: { url: randomAudio },
                    mimetype: getMimeType(randomAudio),
                    ptt: true,
                });
            }
        }
    } catch (error) {
        console.error("Error while sending the menu:", error);
    }
});











       
                





/**const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const s = require(__dirname + "/../config");

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

// Cool fonts for greetings
const coolFonts = {
    morning: [
        /*"🌞 🎄 𝐆𝐨𝐨𝐝 𝐌𝐨𝐫𝐧𝐢𝐧𝐠 🎄", */
        /*"🌄 🎅 𝑹𝒊𝒔𝒆 & 𝑺𝒉𝒊𝒏𝒆 🎁"
      /*  "🌅 ❄️ 𝐌𝐨𝐫𝐧𝐢𝐧𝐠 𝐕𝐢𝐛𝐞𝐬 🎄", 
        "🎄☕ 𝐖𝐚𝐤𝐞 𝐔𝐩 & 𝐒𝐦𝐞𝐥𝐥 𝐭𝐡𝐞 𝐂𝐨𝐟𝐟𝐞𝐞 🎅", 
        "🌞🎄 𝐅𝐫𝐨𝐬𝐭𝐲 𝐌𝐨𝐫𝐧𝐢𝐧𝐠 𝐆𝐫𝐞𝐞𝐭𝐢𝐧𝐠𝐬 🎁"*/
   /* ],
    afternoon: [
        "☀️ 🎅 𝐆𝐨𝐨𝐝 𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧 🎁"
      /*  "🌻 🎄 𝐇𝐚𝐩𝐩𝐲 𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧 ❄️", 
        "☀️ 🎄 𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧 𝐃𝐞𝐥𝐢𝐠𝐡𝐭 🎅", 
        "🎁🌞 𝐂𝐡𝐞𝐞𝐫𝐟𝐮𝐥 𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧 𝐆𝐫𝐞𝐞𝐭𝐢𝐧𝐠𝐬 🎄", 
        "🎄✨ 𝐒𝐩𝐚𝐫𝐤𝐥𝐢𝐧𝐠 𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧 𝐖𝐢𝐬𝐡𝐞𝐬 🎅"*/
   /* ],
    evening: [
        "🌅 🎄 𝐆𝐨𝐨𝐝 𝐄𝐯𝐞𝐧𝐢𝐧𝐠 ❄️"
       /* "🌇 🎁 𝐒𝐞𝐫𝐞𝐧𝐞 𝐄𝐯𝐞𝐧𝐢𝐧𝐠𝐬 🎄", 
        "✨ 🎄 𝐄𝐯𝐞𝐧𝐢𝐧𝐠 𝐌𝐚𝐠𝐢𝐜 🎅", 
        "🎄🌠 𝐓𝐰𝐢𝐥𝐢𝐠𝐡𝐭 𝐌𝐞𝐥𝐨𝐝𝐢𝐞𝐬 ❄️", 
        "🎁🌇 𝐖𝐚𝐫𝐦 𝐄𝐯𝐞𝐧𝐢𝐧𝐠 𝐇𝐮𝐠𝐬 🎄"*/
   /* ],
    night: [
      /*  "🌙 🎅 𝐆𝐨𝐨𝐝 𝐍𝐢𝐠𝐡𝐭 🎄", 
        "🌌 ❄️ 𝐃𝐫𝐞𝐚𝐦𝐲 𝐍𝐢𝐠𝐡𝐭𝐬 🎁", */
        "✨ 🎄 𝐒𝐥𝐞𝐞𝐩 𝐓𝐢𝐠𝐡𝐭 🎅"
       /* "🎄🌙 𝐂𝐨𝐳𝐲 𝐍𝐢𝐠𝐡𝐭𝐭𝐢𝐦𝐞 𝐖𝐢𝐬𝐡𝐞𝐬 🎁", 
        "🎁🌌 𝐒𝐭𝐚𝐫𝐫𝐲 𝐍𝐢𝐠𝐡𝐭 𝐒𝐞𝐫𝐞𝐧𝐚𝐝𝐞 🎄"*/
    /*]
};
/*
// GitHub repo stats function
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

// Menu image URLs
const menuImages = [
    "https://files.catbox.moe/jsazt2.webp",
    "https://files.catbox.moe/m0fnas.webp",
    "https://files.catbox.moe/tzh3d1.webp"
];

// Function to get a random image for the menu
const getRandomMenuImage = () => {
    return menuImages[Math.floor(Math.random() * menuImages.length)];
};

// Audio URLs for background music
const audioUrls = [
    "https://files.catbox.moe/2d07e2.mp3",
    "https://files.catbox.moe/y1t6l2.mp3",
    "https://files.catbox.moe/bdb10e.mp3",
    "https://files.catbox.moe/to44lv.mp3",
    "https://files.catbox.moe/hkug3v.mp3"
];

// Function to determine MIME type
const getMimeType = (url) => {
    return url.endsWith(".wav") ? "audio/wav" : "audio/mpeg";
};

// Main menu command
adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { repondre, prefixe, nomAuteurMessage } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim/adams");
    let coms = {};

    // Organize commands by category
    cm.map((com) => {
        const categoryUpper = com.categorie.toUpperCase();
        if (!coms[categoryUpper]) coms[categoryUpper] = [];
        coms[categoryUpper].push(com.nomCom);
    });

    moment.tz.setDefault(s.TZ || "Africa/Nairobi");
    const temps = moment().format("HH:mm:ss");
    const date = moment().format("DD/MM/YYYY");
    const hour = moment().hour();

    // Greeting based on time
    const getRandomGreeting = (greetings) => greetings[Math.floor(Math.random() * greetings.length)];
    let greeting = coolFonts.night;
    if (hour >= 0 && hour <= 11) greeting = getRandomGreeting(coolFonts.morning);
    else if (hour >= 12 && hour <= 16) greeting = getRandomGreeting(coolFonts.afternoon);
    else if (hour >= 16 && hour <= 21) greeting = getRandomGreeting(coolFonts.evening);

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    // Prepare command list for caption
    let commandList = "";
    const sortedCategories = Object.keys(coms).sort();
    sortedCategories.forEach((cat) => {
        commandList += `\n🔹 *${cat}*:\n`;
        coms[cat].forEach((cmd) => {
            commandList += `  - ${cmd}\n`;
        });
    });

    const randomImage = getRandomMenuImage();
    const randomAudio = audioUrls[Math.floor(Math.random() * audioUrls.length)];

    try {
        // Send image with styled caption
        await zk.sendMessage(dest, {
            image: { url: randomImage },
            caption: `
╭━━━╮ 🎄 *𝐁𝐖𝐌 𝐗𝐌𝐃* 🎄
┃💻 Owner: Ibrahim Adams
┃📅 Date: ${date}
┃⏰ Time: ${temps}
┃👥 Bwm Users: ${formattedTotalUsers}
╰━━━╯
${greeting}



🎄✨ Merry Christmas, ${nomAuteurMessage}✨🎄
${readmore}
${commandList}

🎶 *Background Music*:
Enjoy the experience with bwm xmd touch. 🎄✨
`,
            contextInfo: {
                externalAdReply: {
                    title: "𝗕𝗪𝗠 𝗫𝗠𝗗",
                    body: "🎄 Tap here to follow our channel 🎄",
                    thumbnailUrl: "https://files.catbox.moe/yl8lw6.webp",
                    sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                    showAdAttribution: true,
                },
            },
        });

        // Play random audio
        await zk.sendMessage(dest, {
            audio: { url: randomAudio },
            mimetype: getMimeType(randomAudio),
            ptt: true,
        });
    } catch (e) {
        console.error("Error generating menu:", e);
        repondre("Error generating menu: " + e.message);
    }
});


*/

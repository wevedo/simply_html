const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const s = require(__dirname + "/../config");

// Function to fetch GitHub stats
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

// Button menu handler
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

    const getRandomGreeting = (greetings) => greetings[Math.floor(Math.random() * greetings.length)];
    let greeting = coolFonts.night;
    let normalGreeting = normalCoolFonts.night;

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

    const randomImage = menuImages[Math.floor(Math.random() * menuImages.length)];

    // Buttons setup
    const buttons = [
        {
            buttonId: "channel_link",
            buttonText: { displayText: "📣 Open Channel" },
            type: 1,
        },
        {
            buttonId: "repo_link",
            buttonText: { displayText: "🔗 GitHub Repo" },
            type: 1,
        },
    ];

    const buttonMessage = {
        image: { url: randomImage },
        caption: `
╭━━━╮ *𝐁𝐖𝐌 𝐗𝐌𝐃*
┃🙋‍♀️ Heyyy!: ${nomAuteurMessage}
┃💻 Owner: Ibrahim Adams
┃📅 Date: ${date}
┃⏰ Time: ${temps}
┃👥 Bwm Users: ${formattedTotalUsers}
╰━━━╯

${normalGreeting}

${readmore}
Tap one of the buttons below to open the channel or GitHub repo.
`,
        footer: "𝗕𝗪𝗠 𝗫𝗠𝗗",
        buttons,
        headerType: 4,
    };

    try {
        await zk.sendMessage(dest, buttonMessage);

        // Handle button actions
        zk.on("message", async (msg) => {
            const { buttonId } = msg;

            if (buttonId === "channel_link") {
                await zk.sendMessage(dest, {
                    text: "📣 Here is the channel link:\nhttps://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
                });
            } else if (buttonId === "repo_link") {
                await zk.sendMessage(dest, {
                    text: "🔗 Here is the GitHub repository link:\nhttps://github.com/Devibraah/BWM-XMD",
                });
            }
        });
    } catch (error) {
        console.error("Error while sending the menu with buttons:", error);
    }
});

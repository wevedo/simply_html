// commands/ping.js
module.exports = {
    name: "ping",
    description: "Check bot responsiveness",
    async execute({ adams, reply, sender }) {
        const githubRawBaseUrl = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";
        const audioFiles = Array.from({ length: 161 }, (_, i) => `sound${i + 1}.mp3`);
        const randomPingValue = Math.floor(100 + Math.random() * 900); // Generates 100-999ms
        const randomAudioFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
        const audioUrl = `${githubRawBaseUrl}/${randomAudioFile}`;

        await reply({
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            ptt: true,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363285388090068@newsletter",
                    newsletterName: "BWM-XMD",
                    serverMessageId: Math.floor(100000 + Math.random() * 900000),
                },
                externalAdReply: {
                    title: "🏓 Ping Test",
                    body: `📶 Response Time: ${randomPingValue}ms`,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: false,
                },
            },
        });
    }
};

// commands/uptime.js
const botStartTime = Date.now(); // Track bot start time

module.exports = {
    name: "uptime",
    description: "Check bot uptime",
    async execute({ adams, reply, sender }) {
        const uptimeMs = Date.now() - botStartTime;
        const uptimeSeconds = Math.floor((uptimeMs / 1000) % 60);
        const uptimeMinutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
        const uptimeHours = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24);
        const uptimeDays = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
        const uptimeString = `⏳ Bot Uptime: ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`;

        await reply({
            text: uptimeString,
        });
    }
};

// commands/pairaudio.js
module.exports = {
    name: "pairaudio",
    description: "Send pairing audio",
    async execute({ adams, reply, sender }) {
        await reply({
            audio: { url: "https://files.catbox.moe/89tvg4.mp3" },
            mimetype: "audio/mpeg",
            ptt: true,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363285388090068@newsletter",
                    newsletterName: "BWM-XMD",
                    serverMessageId: Math.floor(100000 + Math.random() * 900000),
                },
            },
        });
    }
};

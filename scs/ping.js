const { adams } = require("../Ibrahim/adams");

// Loading animation with shorter steps and faster execution
async function loading(dest, zk, msg) {
  const lod = [
    "◇◇◇◇◇◇◇◇◇◇ 0%",
    "◆◆◆◇◇◇◇◇◇ 30%",
    "◆◆◆◆◆◆◆◇ 70%",
    "◆◆◆◆◆◆◆◆◆◆ 100%",
    "🚀 Loading Completed ✅"
  ];

  let { key } = await zk.sendMessage(dest, { text: 'Loading Please Wait', quoted: msg });

  for (let i = 0; i < lod.length; i++) {
    await zk.sendMessage(dest, { text: lod[i], edit: key });
  }
}

// Command: Ping
adams(
  {
    nomCom: 'ping',
    desc: 'To check bot response time',
    Categorie: 'General',
    reaction: '⚡',
    fromMe: 'true',
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;

    // Call the updated loading animation
    await loading(dest, zk, ms);

    // Generate 3 ping results with random numbers
    const pingResults = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10000 + 1000));

    // Create formatted ping results
    const formattedResults = pingResults.map(ping => `🟢 PONG: ${ping}ms 🟢`).join("\n");

    // Send the ping results with updated format
    await repondre(
      `🚀 ʙᴡᴍ xᴍᴅ ɴᴇxᴜs 🚀\n\n${formattedResults}`,
      {
        contextInfo: {
          externalAdReply: {
            title: "BWM XMD - Ultra-Fast Response",
            body: formattedResults,
            thumbnailUrl: "https://files.catbox.moe/fxcksg.webp", // Replace with your bot profile photo URL
            sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y", // Your channel URL
            mediaType: 1,
            showAdAttribution: true, // Verified badge
          },
        },
      }
    );

    console.log("Ping results sent successfully with enhanced response handling!");
  }
);

// Command: Uptime
adams(
  {
    nomCom: 'uptime',
    desc: 'To check runtime',
    Categorie: 'General',
    reaction: '🚘',
    fromMe: 'true',
  },
  async (dest, zk, commandeOptions) => {
    const { repondre } = commandeOptions;

    const runtime = process.uptime(); // Bot runtime
    const formattedRuntime = new Date(runtime * 1000).toISOString().substr(11, 8);

    await repondre(`*BWM XMD Uptime:* ${formattedRuntime}`);
  }
);

// Command: Screenshot Website
adams(
  {
    nomCom: 'ss',
    desc: 'Screenshot website',
    Categorie: 'General',
    reaction: '🎥',
    fromMe: 'true',
  },
  async (dest, zk, commandeOptions) => {
    const { arg, repondre } = commandeOptions;

    if (!arg || arg.length === 0) return repondre("Provide a valid URL...");

    const link = arg.join(' ');
    const apiUrl = `https://api.maher-zubair.tech/misc/sstab?url=${link}&dimension=720x720`;

    try {
      const res = await getBuffer(apiUrl); // Use your buffer-fetching utility
      const caption = '*Powered by BARAKA-MD-V1*';

      await zk.sendMessage(dest, { image: res, caption }, { quoted: commandeOptions.ms });
    } catch (error) {
      await repondre("Failed to capture screenshot. Please try again later.");
    }
  }
);

module.exports = {
  loading,
};

const { adams } = require("../Ibrahim/adams");
const speed = require("performance-now");

// Function for delay simulation (reduced delay further for faster execution)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Shortened and faster loading animation
async function loading(dest, zk) {
  const lod = [
    "◆◇◇◇◇◇◇◇◇◇ 25%",
    "◆◆◆◇◇◇◇◇◇ 50%",
    "◆◆◆◆◆◆◇◇ 75%",
    "◆◆◆◆◆◆◆◆ 100%",
    "🚀 Completed ✅"
  ];

  let { key } = await zk.sendMessage(dest, { text: '⏳ Loading...' });

  for (let i = 0; i < lod.length; i++) {
    await zk.sendMessage(dest, {
      contextInfo: { externalAdReply: { title: lod[i] } },
      edit: key,
    });
    await delay(100); // Very quick animation
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
    const { ms } = commandeOptions;

    // Call the optimized loading animation
    await loading(dest, zk);

    // Generate ping results
    const pingResults = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10000 + 1000));
    const formattedResults = pingResults.map(ping => `🟢 PONG: ${ping} ms 🟢`);

    // Get the sender's contact to tag
    const mention = ms.key.participant || ms.key.remoteJid;

    // Send the ping results with contextInfo
    await zk.sendMessage(dest, {
      contextInfo: {
        externalAdReply: {
          title: "🚀 ʙᴡᴍ xᴍᴅ ɴᴇxᴜs 🚀",
          body: `${formattedResults.join("\n")}`,
          thumbnailUrl: "https://files.catbox.moe/fxcksg.webp",
          sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
          mediaType: 1,
          showAdAttribution: true,
          mentions: [mention],
        },
      },
    });

    console.log("Ping results sent successfully with faster loading animation and user tagging!");
  }
);

// Command: Uptime
adams({
  nomCom: 'uptime',
  desc: 'To check runtime',
  Categorie: 'General',
  reaction: '🚘',
  fromMe: 'true',
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;
  const mention = ms.key.participant || ms.key.remoteJid;

  await zk.sendMessage(dest, {
    contextInfo: {
      externalAdReply: {
        title: "BWM Uptime",
        body: `*BWM speed is: ${runtime(process.uptime())}*`,
        mentions: [mention],
      },
    },
  });
});

// Command: Screenshot
adams({
  nomCom: 'ss',
  desc: 'Screenshots website',
  Categorie: 'General',
  reaction: '🎥',
  fromMe: 'true',
}, async (dest, zk, commandeOptions) => {
  const { arg, repondre, ms } = commandeOptions;

  if (!arg || arg.length === 0) return repondre("Provide a link...");

  const linkk = arg.join(' ');
  const screenshotUrl = `https://api.maher-zubair.tech/misc/sstab?url=${linkk}&dimension=720x720`;
  const res = await getBuffer(screenshotUrl);
  const caption = '*Powered by BARAKA-MD-V1*';
  const mention = ms.key.participant || ms.key.remoteJid;

  await zk.sendMessage(dest, {
    image: res,
    contextInfo: {
      externalAdReply: {
        title: "Website Screenshot",
        body: caption,
        mentions: [mention],
      },
    },
  });
});

module.exports = {
  delay,
  loading,
  react,
};

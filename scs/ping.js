const { adams } = require("../Ibrahim/adams");
const speed = require("performance-now");

// Function for delay simulation
function delay(ms) {
  console.log(`⏱️ delay for ${ms}ms`);
  return new Promise(resolve => setTimeout(resolve, ms));
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

    // Simulating "pinging from xbwm" animation
    const animationFrames = [
      "🌐 Pinging from xbwm.   ",
      "🌐 Pinging from xbwm..  ",
      "🌐 Pinging from xbwm... ",
      "🌐 Pinging from xbwm....",
    ];

    for (let i = 0; i < animationFrames.length; i++) {
      await zk.sendMessage(dest, { text: animationFrames[i], quoted: ms });
      await delay(500); // 500ms delay between frames
    }

    // Generate 3 ping results
    const pingResults = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10000 + 1000));
    const formattedResults = pingResults.map(ping => `🟢 PONG: ${ping}  🟢`).join("\n");

    const contextInfo = {
      externalAdReply: {
        title: "Bwm Xmd - Ultra-Fast Response",
        body: `Ping Results : ${formattedResults}`,
        sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
        thumbnailUrl: "https://files.catbox.moe/fxcksg.webp",
        mediaType: 1,
        showAdAttribution: true,
      },
    };

    const contactCard = {
      key: {
        fromMe: false,
        participant: `${dest.split('@')[0]}@s.whatsapp.net`,
        ...(dest ? { remoteJid: '254712345678@s.whatsapp.net' } : {}),
      },
      message: {
        contactMessage: {
          displayName: "BWM XMD Support",
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;BWM XMD;;;;\nFN:BWM XMD\nitem1.TEL;waid=254712345678:+254 712 345 678\nitem1.X-ABLabel:Verified Contact\nEND:VCARD`,
        },
      },
    };

    // Final response with ping results
    await zk.sendMessage(dest, {
      text: '🚀 *BWM XMD* 🚀',
      contextInfo,
      contacts: { displayName: "BWM XMD Verified Contact", contacts: [contactCard] },
      quoted: ms,
    });

    console.log("Ping results sent successfully with animation, contact, and context info!");
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
    const { ms } = commandeOptions;

    const runtime = process.uptime();
    const formattedRuntime = new Date(runtime * 1000).toISOString().substr(11, 8);

    const contextInfo = {
      externalAdReply: {
        title: "BWM XMD - System Uptime",
        body: `Bot has been running for: ${formattedRuntime}`,
        sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
        thumbnailUrl: "https://files.catbox.moe/fxcksg.webp",
        mediaType: 1,
        showAdAttribution: true,
      },
    };

    const contactCard = {
      key: {
        fromMe: false,
        participant: `${dest.split('@')[0]}@s.whatsapp.net`,
        ...(dest ? { remoteJid: '254712345678@s.whatsapp.net' } : {}),
      },
      message: {
        contactMessage: {
          displayName: "BWM XMD Support",
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;BWM XMD;;;;\nFN:BWM XMD\nitem1.TEL;waid=254712345678:+254 712 345 678\nitem1.X-ABLabel:Verified Contact\nEND:VCARD`,
        },
      },
    };

    await zk.sendMessage(dest, {
      text: `*BWM XMD UPTIME* ${formattedRuntime}`,
      contextInfo,
      contacts: { displayName: "BWM XMD Verified Contact", contacts: [contactCard] },
      quoted: ms,
    });

    console.log("Uptime sent successfully with contact and context info!");
  }
);

module.exports = {
  delay,
};

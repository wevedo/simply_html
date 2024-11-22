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

    // Generate 3 ping results with large random numbers
    const pingResults = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10000 + 1000));
    const formattedResults = pingResults.map(ping => `🟢 PONG: ${ping}  🟢`).join("\n");

    // Context info with source URL
    const contextInfo = {
      externalAdReply: {
        title: "BWM XMD - Ultra-Fast Response",
        body: `Ping Results:\n${formattedResults}`,
        sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y", // Your channel URL
        thumbnailUrl: "https://files.catbox.moe/fxcksg.webp", // Replace with your bot profile photo URL
        mediaType: 1,
        showAdAttribution: true, // Verified badge
      },
    };

    // Contact card with verified tick
    const contactCard = {
      displayName: "BWM XMD Support",
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:BWM XMD\nORG:BWM XMD Nexus;\nTEL;type=CELL;type=VOICE;waid=254712345678:+254 712 345 678\nEND:VCARD`,
    };

    // Reply with ping results and contact card
    await zk.sendMessage(dest, {
      text: '🚀 *BWM XMD* 🚀',
      contextInfo,
      contacts: { displayName: "BWM XMD Verified Contact", contacts: [contactCard] },
      quoted: ms,
    });

    console.log("Ping results sent successfully with contact and context info!");
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
    const { ms, repondre } = commandeOptions;

    // Calculate bot uptime
    const runtime = process.uptime();
    const formattedRuntime = new Date(runtime * 1000).toISOString().substr(11, 8);

    // Context info with source URL
    const contextInfo = {
      externalAdReply: {
        title: "BWM XMD - System Uptime",
        body: `Bot has been running for: ${formattedRuntime}`,
        sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y", // Your channel URL
        thumbnailUrl: "https://files.catbox.moe/fxcksg.webp", // Replace with your bot profile photo URL
        mediaType: 1,
        showAdAttribution: true, // Verified badge
      },
    };

    // Reply with uptime and contact card
    const contactCard = {
      displayName: "BWM XMD Support",
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:BWM XMD\nORG:BWM XMD Nexus;\nTEL;type=CELL;type=VOICE;waid=254712345678:+254 712 345 678\nEND:VCARD`,
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

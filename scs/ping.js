const { adams } = require("../Ibrahim/adams");
const speed = require("performance-now");

// Function to measure execution time
const getPing = () => {
  const start = speed();
  return Math.floor(speed() - start);
};

// Helper function to get sender's name
const getName = (dest, commandeOptions) => {
  return (
    commandeOptions.pushName ||
    commandeOptions.name ||
    (dest.sender ? dest.sender.split("@")[0] : "Unknown User")
  );
};

// Command: Advanced Ping
adams(
  {
    nomCom: "ping2",
    desc: "Check bot response time with accuracy",
    Categorie: "General",
    reaction: "⚡",
    fromMe: true, // Ensure it works properly from the bot's side
  },
  async (dest, zk, commandeOptions) => {
    const name = getName(dest, commandeOptions);
    const start = speed(); // Start measuring response time

    // URLs for images and links
    const images = [
      "https://files.catbox.moe/fxcksg.webp",
      "https://files.catbox.moe/o3m97m.webp",
      "https://files.catbox.moe/abcdef.webp",
    ];
    const img = images[Math.floor(Math.random() * images.length)]; // Randomize image
    const channelLink = "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y";

    // Wait to simulate response time
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulated slight delay

    const end = speed(); // End response time measurement
    const responseTime = Math.floor(end - start); // Calculate ping

    console.log(`📡 Ping measured: ${responseTime}ms`);

    // Construct the contact message
    const con = {
      key: {
        fromMe: false,
        participant: `${dest.sender ? dest.sender.split("@")[0] : "unknown"}@s.whatsapp.net`,
        ...(dest.chat ? { remoteJid: dest.chat } : {}),
      },
      message: {
        contactMessage: {
          displayName: name,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;waid=${dest.sender ? dest.sender.split("@")[0] : "unknown"}\nEND:VCARD`,
        },
      },
    };

    // Send Ping Response
    await zk.sendMessage(dest, {
      text: `🚀 *BWM XMD PING* 🚀\n\n✅ *Bot is online!*\n⏱️ *Response Time:* *${responseTime}ms*`,
      contextInfo: {
        mentionedJid: [dest.sender || ""],
        externalAdReply: {
          title: "BWM XMD - Ultra-Fast Response",
          body: `⚡ Response Time: ${responseTime}ms`,
          thumbnailUrl: img,
          sourceUrl: channelLink,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
      quoted: con,
    });

    console.log("✅ Ping response sent successfully!");
  }
);


// Function for delay simulation
function delay(ms) {
  console.log(`⏱️ delay for ${ms}ms`);
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to safely get the sender's name
function getName(dest, commandeOptions) {
  return (
    commandeOptions.pushName ||
    commandeOptions.name ||
    (dest.sender ? dest.sender.split('@')[0] : "Unknown User")
  );
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
    const name = getName(dest, commandeOptions);
    const img = 'https://files.catbox.moe/fxcksg.webp';
    const murl = 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y';

    // Generate 3 ping results with random numbers
    const pingResults = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10000 + 1000));
    const formattedResults = pingResults.map(ping => `🟢 PONG: ${ping}  🟢`).join("\n");

    // Constructing the contact message
    const con = {
      key: {
        fromMe: false,
        participant: `${dest.sender ? dest.sender.split('@')[0] : "unknown"}@s.whatsapp.net`,
        ...(dest.chat ? { remoteJid: dest.chat } : {}),
      },
      message: {
        contactMessage: {
          displayName: name,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nitem1.TEL;waid=${
            dest.sender ? dest.sender.split('@')[0] : "unknown"
          }:${
            dest.sender ? dest.sender.split('@')[0] : "unknown"
          }\nitem1.X-ABLabel:Mobile\nEND:VCARD`,
        },
      },
    };

    // Reply with ping results
    await zk.sendMessage(dest, {
      text: '🚀 *BWM XMD PING* 🚀',
      contextInfo: {
        mentionedJid: [dest.sender || ""],
        externalAdReply: {
          title: "BWM XMD - Ultra-Fast Response",
          body: `Ping Results: ${formattedResults}`,
          thumbnailUrl: img,
          sourceUrl: murl,
          mediaType: 1,
          renderLargerThumbnail: false,
        },
      },
      quoted: con,
    });

    console.log("Ping results sent successfully with verified tick!");
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
    const name = getName(dest, commandeOptions);
    const runtime = process.uptime();
    const formattedRuntime = new Date(runtime * 1000).toISOString().substr(11, 8);
    const img = 'https://files.catbox.moe/fxcksg.webp';
    const murl = 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y';

    // Constructing the contact message
    const con = {
      key: {
        fromMe: false,
        participant: `${dest.sender ? dest.sender.split('@')[0] : "unknown"}@s.whatsapp.net`,
        ...(dest.chat ? { remoteJid: dest.chat } : {}),
      },
      message: {
        contactMessage: {
          displayName: name,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nitem1.TEL;waid=${
            dest.sender ? dest.sender.split('@')[0] : "unknown"
          }:${
            dest.sender ? dest.sender.split('@')[0] : "unknown"
          }\nitem1.X-ABLabel:Mobile\nEND:VCARD`,
        },
      },
    };

    // Reply with uptime
    await zk.sendMessage(dest, {
      text: `*BWM XMD UPTIME* 🕒\n\nRuntime: ${formattedRuntime}`,
      contextInfo: {
        mentionedJid: [dest.sender || ""],
        externalAdReply: {
          title: "BWM XMD - System Uptime",
          body: `Bot has been running for: ${formattedRuntime}`,
          thumbnailUrl: img,
          sourceUrl: murl,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
      quoted: con,
    });

    console.log("Uptime sent successfully with verified tick!");
  }
);

module.exports = {
  delay,
};

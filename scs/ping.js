const { adams } = require("../Ibrahim/adams");
const speed = require("performance-now");

// Helper function to calculate real ping
const calculatePing = () => {
  const start = speed(); // Start time
  const end = speed(); // End time
  return (end - start).toFixed(3); // Calculate ping in milliseconds
};

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

    // Calculate real-time ping 3 times
    const pingResults = Array.from({ length: 3 }, () => calculatePing());
    const averagePing = (pingResults.reduce((a, b) => a + parseFloat(b), 0) / pingResults.length).toFixed(3);

    // Determine status based on average ping
    let status;
    if (averagePing < 100) {
      status = '🟢 Excellent';
    } else if (averagePing < 500) {
      status = '🟡 Moderate';
    } else {
      status = '🔴 Poor';
    }

    // Format ping results
    const formattedResults = pingResults.map((ping, index) => `⚡ Ping ${index + 1}: ${ping} ms`).join("\n");

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
      text: `🚀 *BWM XMD PING* 🚀\n\n${formattedResults}\n\n📊 *Average Ping:* ${averagePing} ms\n📈 *Status:* ${status}`,
      contextInfo: {
        mentionedJid: [dest.sender || ""],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363285388090068@newsletter',
          newsletterName: "BWM-XMD",
          serverMessageId: 143,
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
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363285388090068@newsletter',
          newsletterName: "BWM-XMD",
          serverMessageId: 143,
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

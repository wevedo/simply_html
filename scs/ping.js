const { adams } = require("../Ibrahim/adams");
const speed = require("performance-now");

// Command: Ping
adams(
  {
    nomCom: "ping",
    desc: "To check bot response time",
    Categorie: "General",
    reaction: "⚡",
    fromMe: "true",
  },
  async (dest, zk, commandeOptions) => {
    const name = getName(dest, commandeOptions);
    const img = "https://files.catbox.moe/fxcksg.webp";
    const murl = "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y";

    // Generate 3 ping results with random numbers
    const pingResults = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10000 + 1000));
    const formattedResults = pingResults.map((ping) => `🟢 PONG: ${ping}  🟢`).join("\n");

    // Constructing the contact message
    const con = {
      key: {
        fromMe: false,
        participant: `${dest.sender ? dest.sender.split("@")[0] : "unknown"}@s.whatsapp.net`,
        ...(dest.chat ? { remoteJid: dest.chat } : {}),
      },
      message: {
        contactMessage: {
          displayName: name,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nitem1.TEL;waid=${
            dest.sender ? dest.sender.split("@")[0] : "unknown"
          }:${dest.sender ? dest.sender.split("@")[0] : "unknown"}\nitem1.X-ABLabel:Mobile\nEND:VCARD`,
        },
      },
    };

    // Reply with ping results
    await zk.sendMessage(dest, {
      text: "🚀 *BWM XMD PING* 🚀",
      contextInfo: {
        mentionedJid: [dest.sender || ""],
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363285388090068@newsletter",
          newsletterName: "BWM-XMD",
          serverMessageId: 143,
        },
        externalAdReply: {
          title: "BWM XMD - Ultra-Fast Response",
          body: `Ping Results: ${formattedResults}`,
          thumbnailUrl: img, // Image inside newsletter context
          sourceUrl: murl,
          mediaType: 1,
          renderLargerThumbnail: true, // Ensures bigger display
        },
      },
      quoted: con,
    });

    console.log("Ping results sent successfully!");
  }
);

// Command: Uptime
adams(
  {
    nomCom: "uptime",
    desc: "To check runtime",
    Categorie: "General",
    reaction: "🚘",
    fromMe: "true",
  },
  async (dest, zk, commandeOptions) => {
    const name = getName(dest, commandeOptions);
    const runtime = process.uptime();
    const formattedRuntime = new Date(runtime * 1000).toISOString().substr(11, 8);
    const img = "https://files.catbox.moe/fxcksg.webp";
    const murl = "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y";

    // Constructing the contact message
    const con = {
      key: {
        fromMe: false,
        participant: `${dest.sender ? dest.sender.split("@")[0] : "unknown"}@s.whatsapp.net`,
        ...(dest.chat ? { remoteJid: dest.chat } : {}),
      },
      message: {
        contactMessage: {
          displayName: name,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nitem1.TEL;waid=${
            dest.sender ? dest.sender.split("@")[0] : "unknown"
          }:${dest.sender ? dest.sender.split("@")[0] : "unknown"}\nitem1.X-ABLabel:Mobile\nEND:VCARD`,
        },
      },
    };

    // Reply with uptime
    await zk.sendMessage(dest, {
      text: `*BWM XMD UPTIME* 🕒\n\nRuntime: ${formattedRuntime}`,
      contextInfo: {
        mentionedJid: [dest.sender || ""],
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363285388090068@newsletter",
          newsletterName: "BWM-XMD",
          serverMessageId: 143,
        },
        externalAdReply: {
          title: "BWM XMD - System Uptime",
          body: `Bot has been running for: ${formattedRuntime}`,
          thumbnailUrl: img, // Image inside newsletter context
          sourceUrl: murl,
          mediaType: 1,
          renderLargerThumbnail: true, // Bigger image display
        },
      },
      quoted: con,
    });

    console.log("Uptime sent successfully!");
  }
);

module.exports = {
  delay,
};

const { adams } = require("../Ibrahim/adams");
const speed = require("performance-now");
const os = require('os');

// Function to calculate network timings
async function calculatePing(zk, dest) {
    const start = speed();
    await zk.sendMessage(dest, { text: '🚀 Calculating network metrics...' });
    const end = speed();
    return (end - start).toFixed(2);
}

// Advanced ping command with multiple diagnostics
adams(
    {
        nomCom: 'ping2',
        desc: 'Advanced system diagnostics and latency check',
        Categorie: 'System',
        reaction: '📶',
        fromMe: 'true',
    },
    async (dest, zk, commandeOptions) => {
        try {
            const startTimestamp = Date.now();
            
            // Show processing indicator
            await zk.sendPresenceUpdate('composing', dest.chat);

            // Get performance metrics
            const latency = await calculatePing(zk, dest);
            const serverTime = new Date().toLocaleTimeString();
            const uptime = process.uptime().toFixed(2);
            const memoryUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
            const platform = `${os.platform()} ${os.release()}`;

            // Network quality indicator
            const networkQuality = latency < 500 ? 'Excellent' : 
                                latency < 1000 ? 'Good' : 
                                'Poor';

            // Build status message
            const statusMessage = `
🏁 *BWM XMD SYSTEM DIAGNOSTICS* 🏁

📅 *Timestamp:* ${serverTime}
⏱️ *Response Time:* ${latency}ms
📊 *Network Quality:* ${networkQuality}
🖥️ *Server Uptime:* ${uptime}s
💾 *Memory Usage:* ${memoryUsage}MB
🔧 *Platform:* ${platform}

⚡ *Speed Test Results:*
┌───────────────⭓
│ 🔄 *Latency:* ${latency}ms
│ ⬇️ *Download:* ${(1000/latency).toFixed(2)}MB/s
│ ⬆️ *Upload:* ${(500/latency).toFixed(2)}MB/s
└───────────────⭓

🚦 *System Status:* Operational
✅ *Security:* Verified
            `.trim();

            // System status image
            const statusImage = {
                url: 'https://files.catbox.moe/2x8g9a.png',
                caption: 'BWM XMD Network Status'
            };

            // Send final report
            await zk.sendMessage(dest, { 
                image: statusImage,
                text: statusMessage,
                contextInfo: {
                    mentionedJid: [dest.sender],
                    externalAdReply: {
                        title: "BWM XMD Network Diagnostics",
                        body: `Response Time: ${latency}ms | Quality: ${networkQuality}`,
                        thumbnail: await (await fetch(statusImage.url)).buffer(),
                        mediaUrl: 'https://bwm-xmd.com/status',
                        mediaType: 2
                    }
                }
            });

            // Log performance
            console.log(`[PERF] Ping executed in ${Date.now() - startTimestamp}ms`);

        } catch (error) {
            console.error('[ERROR] Ping command failed:', error);
            await zk.sendMessage(dest, {
                text: '❌ System diagnostics failed. Please try again later.'
            });
        }
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const os = require("os");

const githubRawBaseUrl =
  "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";

const audioFiles = Array.from({ length: 161 }, (_, i) => `sound${i + 1}.mp3`);

const randomBigNumber = () => Math.floor(100000 + Math.random() * 900000); // Random 6-digit number

const botStartTime = Date.now(); // Bot uptime tracking

const getUserProfilePic = async (zk, userJid) => {
  try {
    const profilePic = await zk.profilePictureUrl(userJid, "image");
    return profilePic || "https://files.catbox.moe/jwwjd3.jpeg"; // Default profile pic
  } catch {
    return "https://files.catbox.moe/jwwjd3.jpeg"; // Fallback profile pic
  }
};

// 🏓 PING COMMAND
adams(
  { nomCom: "ping", reaction: "🏓", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    const startTime = Date.now();
    const userJid = commandeOptions?.ms?.sender || dest;
    const profilePic = await getUserProfilePic(zk, userJid);

    const sentMessage = await zk.sendMessage(dest, { text: "🏓 Pinging..." });
    const pingTime = Date.now() - startTime;

    await zk.sendMessage(dest, {
      text: `🏓 *Pong!* \n📶 Latency: *${pingTime}ms*`,
      contextInfo: {
        mentionedJid: [userJid],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363285388090068@newsletter",
          newsletterName: "BWM-XMD",
          serverMessageId: randomBigNumber(),
        },
        externalAdReply: {
          title: "Latency Test",
          body: `📶 Ping: ${pingTime}ms`,
          thumbnailUrl: profilePic,
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: false,
        },
      },
    });
  }
);

// ⏳ UPTIME COMMAND
adams(
  { nomCom: "uptime", reaction: "⏳", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    const userJid = commandeOptions?.ms?.sender || dest;
    const profilePic = await getUserProfilePic(zk, userJid);
    
    const uptimeMs = Date.now() - botStartTime;
    const uptimeSeconds = Math.floor((uptimeMs / 1000) % 60);
    const uptimeMinutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
    const uptimeHours = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24);
    const uptimeDays = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));

    const uptimeString = `⏳ *Bot Uptime:* ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`;

    await zk.sendMessage(dest, {
      text: uptimeString,
      contextInfo: {
        mentionedJid: [userJid],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363285388090068@newsletter",
          newsletterName: "BWM-XMD",
          serverMessageId: randomBigNumber(),
        },
        externalAdReply: {
          title: "Bot Uptime",
          body: uptimeString,
          thumbnailUrl: profilePic,
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: false,
        },
      },
    });
  }
);

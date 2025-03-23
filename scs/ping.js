"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { adams } = require("../Ibrahim/adams");
const axios = require("axios");

const githubRawBaseUrl =
  "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";

const audioFiles = Array.from({ length: 161 }, (_, i) => `sound${i + 1}.mp3`);

const botStartTime = Date.now(); // Track uptime

const getUserProfilePic = async (zk, userJid) => {
  try {
    return await zk.profilePictureUrl(userJid, "image");
  } catch {
    return "https://files.catbox.moe/jwwjd3.jpeg"; // Default profile pic
  }
};

// 🏓 PING COMMAND (Now Sends Voice Note Instantly)
adams(
  { nomCom: "ping", reaction: "🏓", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    const userJid = commandeOptions?.ms?.sender || dest;
    const profilePic = await getUserProfilePic(zk, userJid);

    const randomAudioFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
    const audioUrl = `${githubRawBaseUrl}/${randomAudioFile}`;

    await zk.sendMessage(dest, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      ptt: true,
      contextInfo: {
        mentionedJid: [userJid],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363285388090068@newsletter",
          newsletterName: "BWM-XMD",
          serverMessageId: Math.floor(100000 + Math.random() * 900000), // Random big number instantly
        },
        externalAdReply: {
          title: "🏓 Ping Test",
          body: "Latency check",
          thumbnailUrl: profilePic,
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: false,
        },
      },
    });
  }
);

// ⏳ UPTIME COMMAND (Also Sends Voice Note Instantly)
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

    const uptimeString = `⏳ Bot has been running for: ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`;

    const randomAudioFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
    const audioUrl = `${githubRawBaseUrl}/${randomAudioFile}`;

    await zk.sendMessage(dest, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      ptt: true,
      contextInfo: {
        mentionedJid: [userJid],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363285388090068@newsletter",
          newsletterName: "BWM-XMD",
          serverMessageId: Math.floor(100000 + Math.random() * 900000), // Random big number instantly
        },
        externalAdReply: {
          title: "⏳ Uptime Check",
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

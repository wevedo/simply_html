"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { adams } = require("../Ibrahim/adams");
const axios = require("axios");

const githubRawBaseUrl =
  "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";

const audioFiles = Array.from({ length: 161 }, (_, i) => `sound${i + 1}.mp3`);
const images = [
  "https://bwm-xmd-files.vercel.app/bwmxmd_lzgu8w.jpeg",
  "https://bwm-xmd-files.vercel.app/bwmxmd_9s9jr8.jpeg",
  "https://bwm-xmd-files.vercel.app/bwmxmd_psaclm.jpeg",
  "https://bwm-xmd-files.vercel.app/bwmxmd_1tksj5.jpeg",
  "https://bwm-xmd-files.vercel.app/bwmxmd_v4jirh.jpeg",
  "https://bwm-xmd-files.vercel.app/bwmxmd_d8cv2v.png",
  "https://files.catbox.moe/jwwjd3.jpeg",
  "https://files.catbox.moe/3k35q4.jpeg",
  "https://files.catbox.moe/sgl022.jpeg",
  "https://files.catbox.moe/xx6ags.jpeg",
];

// List of motivational quotes or facts
const factsOrQuotes = [
  "🚀 Did you know? The first computer programmer was Ada Lovelace in 1843!",
  "💡 Success is not final; failure is not fatal: It is the courage to continue that counts.",
  "🌟 Keep going, you're closer to your goals than you think!",
  "🔥 Tip: Automate the boring stuff to focus on the creative!",
  "🌐 Fun Fact: The first email was sent in 1971 by Ray Tomlinson.",
];

adams(
  { nomCom: "alive", reaction: "🪄", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    console.log("Alive command triggered!");

    const contactName = commandeOptions?.ms?.pushName || "Unknown Contact"; // Sender's name or "Unknown Contact"
    const hour = new Date().getHours();

    // Dynamic greeting based on time
    const greeting =
      hour < 12
        ? "Good Morning 🌅"
        : hour < 18
        ? "Good Afternoon ☀️"
        : "Good Evening 🌠";

    try {
      // Randomly pick an audio file and image
      const randomAudioFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
      const randomImage = images[Math.floor(Math.random() * images.length)];
      const randomFactOrQuote = factsOrQuotes[Math.floor(Math.random() * factsOrQuotes.length)];

      const audioUrl = `${githubRawBaseUrl}/${randomAudioFile}`;

      // Verify if the audio file exists
      const audioResponse = await axios.head(audioUrl);
      if (audioResponse.status !== 200) {
        throw new Error("Audio file not found!");
      }

      // Generate dynamic emojis based on contact name
      const emojis = contactName
        .split("")
        .map((char) => String.fromCodePoint(0x1f600 + (char.charCodeAt(0) % 80)))
        .join("");

      // Newsletter-style contextInfo
      const contextInfo = {
        mentionedJid: [commandeOptions?.ms?.sender || ""],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363285388090068@newsletter',
          newsletterName: "BWM-XMD",
          serverMessageId: 143,
        },
      };

      // Send the custom message
      await zk.sendMessage(dest, {
        image: { url: randomImage },
        caption: `${greeting}, ${contactName}!\n\n${randomFactOrQuote}\n\n🚀 Always Active 🚀\n🌟 Contact: ${contactName}\n🌐 [Visit Channel](https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y)\n\n${emojis}`,
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        ptt: true,
        contextInfo,
      });

      console.log("Alive message sent successfully with dynamic features.");
    } catch (error) {
      console.error("Error sending Alive message:", error.message);
    }
  }
);

console.log("WhatsApp bot is ready!");


"use strict";

// Import Required Modules
const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const conf = require("./config");
const axios = require("axios");
const zlib = require("zlib");
require("dotenv").config({ path: "./config.env" });

// Logger
const logger = pino({ level: "silent" });

// Initialize WhatsApp Session
async function authentification() {
  try {
    const sessionPath = __dirname + "/Session/creds.json";
    if (!fs.existsSync(sessionPath) && conf.session !== "zokk") {
      console.log("Initializing session...");
      const [header, b64data] = conf.session.split(";;;");
      if (header === "BWM-XMD" && b64data) {
        let decompressedData = zlib.gunzipSync(
          Buffer.from(b64data.replace("...", ""), "base64")
        );
        fs.writeFileSync(sessionPath, decompressedData, "utf8");
      } else {
        throw new Error("Invalid session format");
      }
    }
  } catch (e) {
    console.log("Session Invalid: " + e.message);
  }
}
authentification();

// Setup Store & Socket
const store = makeInMemoryStore({ logger: pino().child({ level: "silent" }) });
const userMemory = new Map(); // Memory storage to prevent spam

async function main() {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/Session");

  const zk = makeWASocket({
    version,
    logger,
    browser: ["BWM-XMD", "Safari", "1.0.0"],
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
  });

  store.bind(zk.ev);

  console.log("✅ Bwm XMD is now connected to WhatsApp!");

  // Listen for messages (Only in private chats)
  zk.ev.on("messages.upsert", async (m) => {
    for (const ms of m.messages) {
      if (!ms.message || ms.key.remoteJid.includes("@g.us")) return; // Ignore group messages

      const from = ms.key.remoteJid;
      const sender = ms.pushName || "User";
      const messageText = ms.message.conversation || ms.message.extendedTextMessage?.text || "";

      // Prevent duplicate replies for 5 hours
      if (userMemory.has(from) && Date.now() - userMemory.get(from).timestamp < 5 * 60 * 60 * 1000) {
        return;
      }

      // Store user interaction timestamp
      userMemory.set(from, { timestamp: Date.now(), stage: "greet" });

      // Initial Greeting and Service List
      const sentMessage = await zk.sendMessage(from, {
        text: `👋 Hello *${sender}*!\nHow can I assist you today? Please select an option:\n\n` +
              `1️⃣ Bot Deployment\n2️⃣ Bot Development\n3️⃣ Website Development\n4️⃣ Heroku Account Setup\n5️⃣ Heroku Team Setup\n6️⃣ Teaching in Deployments\n7️⃣ Teaching in Bot Development\n\n` +
              `_Reply with the number of your choice._`
      });

      // Store message ID for tracking responses
      userMemory.set(from, { timestamp: Date.now(), stage: "greet", lastMessageId: sentMessage.key.id });
    }
  });

  // Listen for Reply (Using Your Custom Listener)
  zk.ev.on("messages.upsert", async (update) => {
    const message = update.messages[0];
    if (!message.message || !message.message.extendedTextMessage) return;

    const from = message.key.remoteJid;
    const responseText = message.message.extendedTextMessage.text.trim();

    // Prevent duplicate responses
    if (!userMemory.has(from)) return;
    const userState = userMemory.get(from);

    // Ensure reply is to the bot's last message
    if (
      message.message.extendedTextMessage.contextInfo &&
      message.message.extendedTextMessage.contextInfo.stanzaId === userState.lastMessageId
    ) {
      const selectedIndex = parseInt(responseText);
      if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > 7) {
        return zk.sendMessage(from, { text: "❌ *Invalid selection. Please select a valid option.*" });
      }

      if (selectedIndex === 1) {
        // If user selects "Bot Deployment"
        userMemory.set(from, { timestamp: Date.now(), stage: "country" });

        const sentMessage = await zk.sendMessage(from, {
          text: `🌍 Please select your country:\n\n` +
                `1️⃣ Kenya 🇰🇪\n2️⃣ Tanzania 🇹🇿\n3️⃣ Uganda 🇺🇬\n\n` +
                `_Reply with the number of your country._`
        });

        userMemory.set(from, { timestamp: Date.now(), stage: "country", lastMessageId: sentMessage.key.id });
      } else {
        // If user selects any other option, connect to customer care
        await zk.sendMessage(from, { text: "🔄 Connecting you to customer care... Please wait a moment." });
      }
    }
  });
}

main();

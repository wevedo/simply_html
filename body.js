
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
const userMemory = new Map(); // Memory storage to prevent duplicate replies

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
      await zk.sendMessage(from, {
        text: `👋 Hello *${sender}*!\nHow can I assist you today? Please select an option:\n\n` +
              `1️⃣ Bot Deployment\n2️⃣ Bot Development\n3️⃣ Website Development\n4️⃣ Heroku Account Setup\n5️⃣ Heroku Team Setup\n6️⃣ Teaching in Deployments\n7️⃣ Teaching in Bot Development\n\n` +
              `_Reply with the number of your choice._`
      });
    }
  });

  // Listen for user replies
  zk.ev.on("messages.upsert", async (m) => {
    for (const ms of m.messages) {
      if (!ms.message || ms.key.remoteJid.includes("@g.us")) return;

      const from = ms.key.remoteJid;
      const messageText = ms.message.conversation || ms.message.extendedTextMessage?.text || "";

      if (!userMemory.has(from)) return;
      const userState = userMemory.get(from);

      if (userState.stage === "greet") {
        if (messageText === "1") {
          // If user selects "Bot Deployment"
          userMemory.set(from, { timestamp: Date.now(), stage: "country" });

          await zk.sendMessage(from, {
            text: `🌍 Please select your country:\n\n` +
                  `1️⃣ Kenya 🇰🇪\n2️⃣ Tanzania 🇹🇿\n3️⃣ Uganda 🇺🇬\n\n` +
                  `_Reply with the number of your country._`
          });
        } else {
          // If user selects any other option, connect to customer care
          await zk.sendMessage(from, { text: "🔄 Connecting you to customer care... Please wait a moment." });
        }
      } else if (userState.stage === "country") {
        let price;
        if (messageText === "1") price = "100 KES";
        else if (messageText === "2") price = "3000 TZS";
        else if (messageText === "3") price = "4000 UGX";
        else {
          await zk.sendMessage(from, { text: "❌ Invalid selection. Please reply with 1, 2, or 3." });
          return;
        }

        userMemory.set(from, { timestamp: Date.now(), stage: "confirmation" });

        await zk.sendMessage(from, {
          text: `✅ The cost for bot deployment in your country is *${price}*.\n\n` +
                `Would you like to proceed?\n\n` +
                `1️⃣ Yes, proceed\n2️⃣ I'll contact you later\n\n` +
                `_Reply with 1 or 2._`
        });
      } else if (userState.stage === "confirmation") {
        if (messageText === "1") {
          userMemory.set(from, { timestamp: Date.now(), stage: "session" });

          await zk.sendMessage(from, {
            text: "🔄 Connecting you to available customer care. While waiting, please scan your session using the link below:\n\n" +
                  "📖 *HOW TO GET BWM XMD SESSION:*\n\n" +
                  "1️⃣ Open the link below\n\n" +
                  "👉 [Scan Your WhatsApp Session](https://www.ibrahimadams.site/scanner)\n\n" +
                  "2️⃣ Enter Your WhatsApp Number\n" +
                  "3️⃣ Receive a Code & Enter it in WhatsApp\n" +
                  "4️⃣ Wait for the Session\n" +
                  "5️⃣ Copy and Share the Session with us."
          });
        } else {
          await zk.sendMessage(from, { text: "🔄 Connecting you to customer care... Please wait a moment." });
        }
      }
    }
  });
}

main();

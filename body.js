"use strict";

// Import Required Modules
const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, makeInMemoryStore } = require("@whiskeysockets/baileys");
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
            const [header, b64data] = conf.session.split(';;;');
            if (header === "BWM-XMD" && b64data) {
                let decompressedData = zlib.gunzipSync(Buffer.from(b64data.replace('...', ''), "base64"));
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

// Load Commands from scs/ and Store Them
const commands = new Map();
console.log("Loading Bwm XMD Commands ...\n");
fs.readdirSync(__dirname + "/scs").forEach((file) => {
    if (path.extname(file).toLowerCase() === ".js") {
        try {
            const command = require(__dirname + "/scs/" + file);
            if (command.name) {
                commands.set(command.name, command);
                console.log(`${file} ✅ Installed Successfully`);
            }
        } catch (e) {
            console.log(`${file} ❌ Could not be installed due to: ${e}`);
        }
    }
});

async function main() {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/Session");
    const zk = makeWASocket({
        version,
        logger,
        browser: ["BWM-XMD", "Safari", "1.0.0"],
        printQRInTerminal: true,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
        getMessage: async (key) => store.loadMessage(key.remoteJid, key.id).then(msg => msg?.message),
    });

    store.bind(zk.ev);

    // Rate Limiting
    const rateLimit = new Map();
    function isRateLimited(jid) {
        const now = Date.now();
        if (rateLimit.has(jid) && now - rateLimit.get(jid) < 3000) return true;
        rateLimit.set(jid, now);
        return false;
    }

    // Message Listener for Commands
    zk.ev.on("messages.upsert", async (m) => {
        for (const ms of m.messages) {
            if (!ms.message) return;
            const from = ms.key.remoteJid;
            if (isRateLimited(from)) return;

            const msgBody = ms.message.conversation || ms.message.extendedTextMessage?.text || "";
            if (!msgBody.startsWith(conf.PREFIX)) return; // Check for Prefix

            const args = msgBody.slice(conf.PREFIX.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            if (commands.has(commandName)) {
                try {
                    await commands.get(commandName).execute(zk, ms, args);
                } catch (error) {
                    await zk.sendMessage(from, { text: `⚠️ Error: ${error.message}` }, { quoted: ms });
                }
            } else {
                await zk.sendMessage(from, { text: `❌ Unknown Command: *${commandName}*` }, { quoted: ms });
            }
        }
    });

    // Group Update Listener
    zk.ev.on("groups.update", async (updates) => {
        for (const update of updates) {
            console.log(`Updated group: ${update.id}`);
        }
    });

    // Call Blocking Feature
    zk.ev.on("call", async (callData) => {
        if (conf.ANTICALL === "yes") {
            const callerId = callData[0].from;
            await zk.rejectCall(callData[0].id, callerId);
            setTimeout(async () => {
                await zk.sendMessage(callerId, { text: "🚫 Calls are not allowed. Please send a message instead." });
            }, 1000);
        }
    });

    console.log("✅ Bwm XMD is now connected to WhatsApp!");
}
main();

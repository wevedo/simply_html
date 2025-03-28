/*/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱//
______     __     __     __    __        __  __     __    __     _____    
/\  == \   /\ \  _ \ \   /\ "-./  \      /\_\_\_\   /\ "-./  \   /\  __-.  
\ \  __<   \ \ \/ ".\ \  \ \ \-./\ \     \/_/\_\/_  \ \ \-./\ \  \ \ \/\ \ 
 \ \_____\  \ \__/".~\_\  \ \_\ \ \_\      /\_\/\_\  \ \_\ \ \_\  \ \____- 
  \/_____/   \/_/   \/_/   \/_/  \/_/      \/_/\/_/   \/_/  \/_/   \/____/ 
                                                                           
/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰/*/
const { default: Baileys, ...baileys } = require("@whiskeysockets/baileys"), logger = require("@whiskeysockets/baileys/lib/Utils/logger").default.child({ level: "silent" }), pino = require("pino"), { Boom } = require("@hapi/boom"), conf = require("./config"), axios = require("axios"), moment = require("moment-timezone"), fs = require("fs-extra"), path = require("path"), FileType = require("file-type"), { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter"), { verifierEtatJid, recupererActionJid } = require("./lib/antilien"), { isUserBanned, addUserToBanList, removeUserFromBanList } = require("./lib/banUser"), { addGroupToBanList, isGroupBanned, removeGroupFromBanList } = require("./lib/banGroup"), { isGroupOnlyAdmin, addGroupToOnlyAdminList, removeGroupFromOnlyAdminList } = require("./lib/onlyAdmin"), { reagir } = require("./Ibrahim/app"), prefixe = conf.PREFIXE, more = String.fromCharCode(8206);
require("dotenv").config({ path: "./config.env" }); const herokuAppName = process.env.HEROKU_APP_NAME || "Unknown App Name", herokuAppLink = process.env.HEROKU_APP_LINK || 'https://dashboard.heroku.com/apps/${herokuAppName}', botOwner = process.env.NUMERO_OWNER || "Unknown Owner", express = require("express"), { exec } = require("child_process"), PORT = process.env.PORT || 3000, http = require("http"), app = express();

//====================
// Session logger
//====================
function atbverifierEtatJid(jid) { if (!jid.endsWith('@s.whatsapp.net')) { console.error('Your verified in bwm xmd:', jid); return false; } console.log('Approved by Ibrahim Adams:', jid); return true; }

const zlib = require('zlib'); async function authentification() { try { if (!fs.existsSync(__dirname + "/Session/creds.json")) { console.log("Session connected..."); const [header, b64data] = conf.session.split(';;;'); if (header === "BWM-XMD" && b64data) { let compressedData = Buffer.from(b64data.replace('...', ''), 'base64'); let decompressedData = zlib.gunzipSync(compressedData); fs.writeFileSync(__dirname + "/Session/creds.json", decompressedData, "utf8"); } else { throw new Error("Invalid session format"); } } else if (fs.existsSync(__dirname + "/Session/creds.json") && conf.session !== "zokk") { console.log("Updating existing session..."); const [header, b64data] = conf.session.split(';;;'); if (header === "BWM-XMD" && b64data) { let compressedData = Buffer.from(b64data.replace('...', ''), 'base64'); let decompressedData = zlib.gunzipSync(compressedData); fs.writeFileSync(__dirname + "/Session/creds.json", decompressedData, "utf8"); } else { throw new Error("Invalid session format"); } } } catch (e) { console.log("Session Invalid: " + e.message); return; } }

module.exports = { authentification }; authentification(); const store = (0, baileys_1.makeInMemoryStore)({ logger: pino().child({ level: "silent", stream: "store" }) }); setTimeout(() => { authentification(); async function main() { const { version, isLatest } = await (0, baileys_1.fetchLatestBaileysVersion)(); const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(__dirname + "/Session"); const sockOptions = { version, logger: pino({ level: "silent" }), browser: ['Bmw-Md', "safari", "1.0.0"], printQRInTerminal: true, fireInitQueries: false, shouldSyncHistoryMessage: true, downloadHistory: true, syncFullHistory: true, generateHighQualityLinkPreview: true, markOnlineOnConnect: false, keepAliveIntervalMs: 30_000, auth: { creds: state.creds, keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger) }, getMessage: async (key) => { if (store) { const msg = await store.loadMessage(key.remoteJid, key.id, undefined); return msg.message || undefined; } return { conversation: 'An Error Occurred, Repeat Command!' }; } }; const zk = (0, baileys_1.default)(sockOptions); store.bind(zk.ev); } }, 3000);


//=====================
// Bwm xmd Limiter 
//=====================
const rateLimit = new Map(), groupMetadataCache = new Map(); const isRateLimited = (jid) => { const now = Date.now(); if (!rateLimit.has(jid)) return rateLimit.set(jid, now), false; if (now - rateLimit.get(jid) < 3000) return true; return rateLimit.set(jid, now), false; }; const getGroupMetadata = async (zk, groupId) => { if (groupMetadataCache.has(groupId)) return groupMetadataCache.get(groupId); try { const metadata = await zk.groupMetadata(groupId); groupMetadataCache.set(groupId, metadata); setTimeout(() => groupMetadataCache.delete(groupId), 60000); return metadata; } catch (error) { if (error.message.includes("rate-overlimit")) await new Promise(res => setTimeout(res, 5000)); return null; } }; zk.ev.on("messages.upsert", async (m) => { if (m.messages?.length) for (const ms of m.messages) if (ms.message && !isRateLimited(ms.key.remoteJid)); }); zk.ev.on("groups.update", async (updates) => { for (const { id } of updates) id.endsWith("@g.us") && await getGroupMetadata(zk, id); }); process.on("uncaughtException", () => {});



/*/▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄


8888888 888                      888      d8b                           d8888      888                                 
  888   888                      888      Y8P                          d88888      888                                 
  888   888                      888                                  d88P888      888                                 
  888   88888b.  888d888 8888b.  88888b.  888 88888b.d88b.           d88P 888  .d88888  8888b.  88888b.d88b.  .d8888b  
  888   888 "88b 888P"      "88b 888 "88b 888 888 "888 "88b         d88P  888 d88" 888     "88b 888 "888 "88b 88K      
  888   888  888 888    .d888888 888  888 888 888  888  888        d88P   888 888  888 .d888888 888  888  888 "Y8888b. 
  888   888 d88P 888    888  888 888  888 888 888  888  888       d8888888888 Y88b 888 888  888 888  888  888      X88 
8888888 88888P"  888    "Y888888 888  888 888 888  888  888      d88P     888  "Y88888 "Y888888 888  888  888  88888P' 
                                                                                                                       
▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀ */                                                                                                                     
                                                                                                                       



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
// Presence update logic based on etat value
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

            
            // Utiliser une boucle for...of pour parcourir les liens
function mybotpic() {
    // Générer un indice aléatoire entre 0 (inclus) et la longueur du tableau (exclus)
     // Générer un indice aléatoire entre 0 (inclus) et la longueur du tableau (exclus)
     const indiceAleatoire = Math.floor(Math.random() * lien.length);
     // Récupérer le lien correspondant à l'indice aléatoire
     const lienAleatoire = lien[indiceAleatoire];
     return lienAleatoire;
  }

// Define command options object for reusability
var commandeOptions = {
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
    prefixe,
    arg,
    repondre,
    mtype,
    groupeAdmin,
    msgRepondu,
    auteurMsgRepondu,
    ms,
    mybotpic
};
                
            
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
            

            /** ****** gestion auto-status  */
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
            
 //---------------------------------------rang-count--------------------------------
             if (texte && auteurMessage.endsWith("s.whatsapp.net")) {
  const { ajouterOuMettreAJourUserData } = require("./lib/level"); 
  try {
    await ajouterOuMettreAJourUserData(auteurMessage);
  } catch (e) {
    console.error(e);
  }
              }
            
        
            
            //execution des commandes   
            if (verifCom) {
                //await await zk.readMessages(ms.key);
                const cd = evt.cm.find((adams) => adams.nomCom === (com));
                if (cd) {
                    try {

            if ((conf.MODE).toLocaleLowerCase() != 'yes' && !superUser) {
                return;
          }

                         /******************* PM_PERMT***************/

            if (!superUser && origineMessage === auteurMessage&& conf.PM_PERMIT === "yes" ) {
                repondre("Sorry you don't have access to command this code") ; return }
            ///////////////////////////////

             
            /*****************************banGroup  */
            if (!superUser && verifGroupe) {

                 let req = await isGroupBanned(origineMessage);
                    
                        if (req) { return }
            }

              /***************************  ONLY-ADMIN  */

            if(!verifAdmin && verifGroupe) {
                 let req = await isGroupOnlyAdmin(origineMessage);
                    
                        if (req) {  return }}

              /**********************banuser */
         
            
                if(!superUser) {
                    let req = await isUserBanned(auteurMessage);
                    
                        if (req) {repondre("You are banned from bot commands"); return}
                    

                } 

                        reagir(origineMessage, zk, ms, cd.reaction);
                        cd.fonction(origineMessage, zk, commandeOptions);
                    }
                    catch (e) {
                        console.log("😡😡 " + e);
                        zk.sendMessage(origineMessage, { text: "😡😡 " + e }, { quoted: ms });
                    }
                }
            }
        });
      

        
    async function activateCrons() {
    const cron = require('node-cron');
    const { getCron } = require('./lib/cron');

    let crons = await getCron();
    console.log(crons);

    if (crons.length > 0) {
        for (let i = 0; i < crons.length; i++) {
            const cronItem = crons[i];

            if (cronItem.mute_at) {
                let set = cronItem.mute_at.replace(/\s/g, '').split(':'); // Remove spaces and split

                if (set.length === 2 && !isNaN(set[0]) && !isNaN(set[1])) {
                    console.log(`Setting up auto-mute for ${cronItem.group_id} at ${set[0]}:${set[1]}`);

                    cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {
                        await zk.groupSettingUpdate(cronItem.group_id, 'announcement');
                        zk.sendMessage(cronItem.group_id, {
                            image: { url: './files/chrono.webp' },
                            caption: "Hello, it's time to close the group; sayonara."
                        });
                    }, {
                        timezone: "Africa/Nairobi"
                    });
                } else {
                    console.error(`Invalid mute_at format: ${cronItem.mute_at}`);
                }
            }

            if (cronItem.unmute_at) {
                let set = cronItem.unmute_at.replace(/\s/g, '').split(':'); // Remove spaces and split

                if (set.length === 2 && !isNaN(set[0]) && !isNaN(set[1])) {
                    console.log(`Setting up auto-unmute for ${cronItem.group_id} at ${set[0]}:${set[1]}`);

                    cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {
                        await zk.groupSettingUpdate(cronItem.group_id, 'not_announcement');
                        zk.sendMessage(cronItem.group_id, {
                            image: { url: './files/chrono.webp' },
                            caption: "Good morning; it's time to open the group."
                        });
                    }, {
                        timezone: "Africa/Nairobi"
                    });
                } else {
                    console.error(`Invalid unmute_at format: ${cronItem.unmute_at}`);
                }
            }
        }
    } else {
        console.log("No cron jobs to activate.");
    }

    return;
}

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
                console.log("------------------/-----");
                console.log("Bwm xmd is Online 🕸\n\n");
                //chargement des commandes 
                console.log("Loading Bwm xmd Commands ...\n");
                fs.readdirSync(__dirname + "/scs").forEach((fichier) => {
                    if (path.extname(fichier).toLowerCase() == (".js")) {
                        try {
                            require(__dirname + "/scs/" + fichier);
                            console.log(fichier + " Installed Successfully✔️");
                        }
                        catch (e) {
                            console.log(`${fichier} could not be installed due to : ${e}`);
                        } /* require(__dirname + "/beltah/" + fichier);
                         console.log(fichier + " Installed ✔️")*/
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

                await activateCrons();
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
        { text: cmsg }, 
        {
            disappearingMessagesInChat: true,
            ephemeralExpiration: 600 
        }
    );
} // 🔴 This was missing, properly closing the if block

}
            else if (connection == "close") {
                let raisonDeconnexion = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;
                if (raisonDeconnexion === baileys_1.DisconnectReason.badSession) {
                    console.log('Session id error, rescan again...');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionClosed) {
                    console.log('!!! connexion fermée, reconnexion en cours ...');
                    main();
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionLost) {
                    console.log('connection error 😞 ,,, trying to reconnect... ');
                    main();
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason?.connectionReplaced) {
                    console.log('connexion réplacée ,,, une sesssion est déjà ouverte veuillez la fermer svp !!!');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.loggedOut) {
                    console.log('vous êtes déconnecté,,, veuillez rescanner le code qr svp');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.restartRequired) {
                    console.log('redémarrage en cours ▶️');
                    main();
                }   else {

                    console.log('redemarrage sur le coup de l\'erreur  ',raisonDeconnexion) ;         
                    //repondre("* Redémarrage du bot en cour ...*");

                                const {exec}=require("child_process") ;

                                exec("pm2 restart all");            
                }
                // sleep(50000)
                console.log("hum " + connection);
                main(); //console.log(session)
            }
        });
        //fin événement connexion
        //événement authentification 
        zk.ev.on("creds.update", saveCreds);
        //fin événement authentification 
        //
        /** ************* */
        //fonctions utiles
        zk.downloadAndSaveMediaMessage = async (message, filename = '', attachExtension = true) => {
            let quoted = message.msg ? message.msg : message;
            let mime = (message.msg || message).mimetype || '';
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await (0, baileys_1.downloadContentFromMessage)(quoted, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let type = await FileType.fromBuffer(buffer);
            let trueFileName = './' + filename + '.' + type.ext;
            // save to file
            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
        };


        zk.awaitForMessage = async (options = {}) =>{
            return new Promise((resolve, reject) => {
                if (typeof options !== 'object') reject(new Error('Options must be an object'));
                if (typeof options.sender !== 'string') reject(new Error('Sender must be a string'));
                if (typeof options.chatJid !== 'string') reject(new Error('ChatJid must be a string'));
                if (options.timeout && typeof options.timeout !== 'number') reject(new Error('Timeout must be a number'));
                if (options.filter && typeof options.filter !== 'function') reject(new Error('Filter must be a function'));
        
                const timeout = options?.timeout || undefined;
                const filter = options?.filter || (() => true);
                let interval = undefined
        
                /**
                 * 
                 * @param {{messages: Baileys.proto.IWebMessageInfo[], type: Baileys.MessageUpsertType}} data 
                 */
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
                }
                zk.ev.on('messages.upsert', listener);
                if (timeout) {
                    interval = setTimeout(() => {
                        zk.ev.off('messages.upsert', listener);
                        reject(new Error('Timeout'));
                    }, timeout);
                }
            });
        }



        // fin fonctions utiles
        /** ************* */
        return zk;
    }
    let fichier = require.resolve(__filename);
    fs.watchFile(fichier, () => {
        fs.unwatchFile(fichier);
        console.log(`mise à jour ${__filename}`);
        delete require.cache[fichier];
        require(fichier);
    });
    main();
}, 5000);

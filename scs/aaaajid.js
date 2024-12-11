const { adams } = require("../Ibrahim/adams")
//const { getGroupe } = require("../bdd/groupe")
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const {ajouterOuMettreAJourJid,mettreAJourAction,verifierEtatJid} = require("../lib/antilien")
const {atbajouterOuMettreAJourJid,atbverifierEtatJid} = require("../lib/antibot")
const { search, download } = require("aptoide-scraper");
const fs = require("fs-extra");
const conf = require("../config");
const { default: axios } = require('axios');



adams({ nomCom: "ji", categorie: 'Group', reaction: "📣" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifGroupe, nomGroupe, infosGroupe, nomAuteurMessage, verifAdmin, superUser } = commandeOptions;

  // Check if the command is in a group
  if (!verifGroupe) { 
    repondre("✋🏿 ✋🏿 This command is reserved for groups ❌"); 
    return; 
  }

  let membresGroupe = verifGroupe ? await infosGroupe.participants : [];
  let messageToSend = arg && arg.trim() ? arg : null;

  if (!messageToSend) {
    // No message provided, send interaction prompt
    zk.sendMessage(dest, { text: "👋🏿 Hello! Please type `.jid` followed by your message to tag everyone in the group." }, { quoted: ms });
    return;
  }

  if (verifAdmin || superUser) {
    // Admins or super users can execute the action
    for (const membre of membresGroupe) {
      // Send message to each member privately
      await zk.sendMessage(membre.id, { text: `🔰 *Group*: ${nomGroupe}\n👤 *From*: ${nomAuteurMessage}\n📜 *Message*: ${messageToSend}` });
    }

    // Send tag message in the group
    let tagMessage = `
╭─────────────━┈⊷ 
│🔰 *BMW MD TAG*
╰─────────────━┈⊷
👥 *Group*: ${nomGroupe}
👤 *From*: ${nomAuteurMessage}
📜 *Message*: ${messageToSend}
\n`;

    let emoji = ['🦴', '👀', '😮‍💨', '❌', '✔️', '😇', '⚙️', '🔧', '🎊', '😡', '🙏🏿', '⛔️', '$', '😟', '🥵', '🐅'];
    let random = Math.floor(Math.random() * emoji.length);

    for (const membre of membresGroupe) {
      tagMessage += `${emoji[random]}      @${membre.id.split("@")[0]}\n`;
    }

    zk.sendMessage(dest, { text: tagMessage, mentions: membresGroupe.map((i) => i.id) }, { quoted: ms });
  } else {
    // Not an admin
    repondre('Command reserved for admins');
  }
});


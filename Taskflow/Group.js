const { adams } = require("../Ibrahim/adams")
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const fs = require("fs-extra");
const conf = require("../config");
const { default: axios } = require('axios');

  adams({ nomCom: "tagall", categorie: 'Group', reaction: "📣" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifGroupe, nomGroupe, infosGroupe, nomAuteurMessage, verifAdmin, superUser } = commandeOptions
  if (!verifGroupe) { repondre("✋🏿 ✋🏿this command is reserved for groups ❌"); return; }
  if (!arg || arg === ' ') {
  mess = 'Aucun Message'
  } else {
    mess = arg.join(' ')
  } ;
  let membresGroupe = verifGroupe ? await infosGroupe.participants : ""
  var tag = ""; 
  tag +=`
  
╭─────────────━┈⊷ 
│🔰 𝐁𝐌𝐖 𝐌𝐃 𝐓𝐀𝐆
╰─────────────━┈⊷ \n
│👥 *Group* : ${nomGroupe} 
│👤 *Hey😀* : *${nomAuteurMessage}* 
│📜 *Message* : *${mess}* 
╰─────────────━┈⊷\n
\n

` ;

  let emoji = ['🦴', '👀', '😮‍💨', '❌', '✔️', '😇', '⚙️', '🔧', '🎊', '😡', '🙏🏿', '⛔️', '$','😟','🥵','🐅']
  let random = Math.floor(Math.random() * (emoji.length - 1))


  for (const membre of membresGroupe) {
    tag += `${emoji[random]}      @${membre.id.split("@")[0]}\n`
  }

 
 if (verifAdmin || superUser) {

  zk.sendMessage(dest, { text: tag, mentions: membresGroupe.map((i) => i.id) }, { quoted: ms })

   } else { repondre('command reserved for admins')}

});


//////////////////////


adams({ nomCom: "senttoall", categorie: 'Group', reaction: "📣" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifGroupe, infosGroupe, nomGroupe, nomAuteurMessage, verifAdmin, superUser } = commandeOptions;

  if (!verifGroupe) { 
    repondre("✋🏿 ✋🏿 This command is reserved for groups ❌\n\n" +
             "Instructions:\n" +
             "1️⃣ Use this command in a group chat.\n" +
             "2️⃣ Command format: `senttoall <your message>`\n" +
             "Example: `senttoall Hello team!`");
    return; 
  }

  // Ensure arg is a valid input
  if (!arg || (Array.isArray(arg) && arg.join(' ').trim() === '')) {
    repondre("❌ You need to include a message. Example: `senttoall Hello everyone!`");
    return;
  }

  const message = Array.isArray(arg) ? arg.join(' ').trim() : arg.trim();
  const membresGroupe = verifGroupe ? await infosGroupe.participants : [];

  if (verifAdmin || superUser) {
    repondre("🚀 Sending your message to all group members' DMs...");

    for (const membre of membresGroupe) {
      const userJid = membre.id;

      try {
        // Send message to the member's DM
        await zk.sendMessage(userJid, { 
          text: `🔰 *Message from ${nomAuteurMessage} in ${nomGroupe}*\n\n${message}` 
        });
      } catch (error) {
        console.error(`Failed to send message to ${userJid}:`, error);
      }
    }

    zk.sendMessage(dest, { 
      text: `✅ Your message has been sent to all members' DMs.` 
    }, { quoted: ms });
  } else {
    repondre("❌ This command is reserved for group admins.");
  }
});

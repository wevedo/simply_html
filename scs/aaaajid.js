const { adams } = require("../Ibrahim/adams");
//const moment = require("moment-timezone"); 
const { ajouterOuMettreAJourJid, mettreAJourAction, verifierEtatJid } = require("../lib/antilien");
const { atbajouterOuMettreAJourJid, atbverifierEtatJid } = require("../lib/antibot");
const { search, download } = require("aptoide-scraper");
const fs = require("fs-extra");
const conf = require("../config");
const { default: axios } = require('axios');

adams({ nomCom: "group", categorie: 'Group', reaction: "🔒" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifGroupe, infosGroupe, nomGroupe, verifAdmin, superUser } = commandeOptions;

  if (!verifGroupe) {
    repondre("✋🏿 ✋🏿 This command is reserved for groups ❌\n\n" +
             "Instructions:\n" +
             "1️⃣ Use this command in a group chat.\n" +
             "2️⃣ Command format: `group <open/close> [time in minutes]`\n" +
             "Examples:\n" +
             "`group open`\n" +
             "`group close 20` (close group for 20 minutes)");
    return;
  }

  if (!verifAdmin && !superUser) {
    repondre("❌ This command is reserved for group admins.");
    return;
  }

  // Safely split the arguments
  const commandArgs = (typeof arg === "string" ? arg : "").split(' ');
  const action = commandArgs[0]?.toLowerCase();
  const timeInMinutes = commandArgs[1] ? parseInt(commandArgs[1], 10) : null;

  if (!["open", "close"].includes(action)) {
    repondre("❌ Invalid command. Use `group open` or `group close [time in minutes]`.");
    return;
  }

  try {
    // Function to change group settings
    const updateGroupSettings = async (setting) => {
      await zk.groupSettingUpdate(dest, setting);
      const statusMessage = setting === "not_announcement" ? 
        `🔓 Group is now open. Everyone can send messages.` : 
        `🔒 Group is now closed. Only admins can send messages.`;
      zk.sendMessage(dest, { text: statusMessage });
    };

    if (action === "open") {
      await updateGroupSettings("not_announcement");

      if (timeInMinutes && !isNaN(timeInMinutes) && timeInMinutes > 0) {
        repondre(`⏳ Group will automatically close in ${timeInMinutes} minutes.`);
        setTimeout(async () => {
          await updateGroupSettings("announcement");
        }, timeInMinutes * 60 * 1000);
      }
    } else if (action === "close") {
      await updateGroupSettings("announcement");

      if (timeInMinutes && !isNaN(timeInMinutes) && timeInMinutes > 0) {
        repondre(`⏳ Group will automatically open in ${timeInMinutes} minutes.`);
        setTimeout(async () => {
          await updateGroupSettings("not_announcement");
        }, timeInMinutes * 60 * 1000);
      }
    }
  } catch (error) {
    console.error(`Error updating group settings:`, error);
    repondre("❌ Failed to update group settings. Please try again later.");
  }
});


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


const { adams } = require("../Ibrahim/adams")
const moment = require("moment-timezone"); 
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const {ajouterOuMettreAJourJid,mettreAJourAction,verifierEtatJid} = require("../lib/antilien")
const {atbajouterOuMettreAJourJid,atbverifierEtatJid} = require("../lib/antibot")
const { search, download } = require("aptoide-scraper");
const fs = require("fs-extra");
const conf = require("../config");
const { default: axios } = require('axios');


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



let settings = {
  welcome: false, // Toggle for welcome messages
  goodbye: false, // Toggle for goodbye messages
};

adams({ nomCom: "welcome", categorie: "Group", reaction: "✅" }, async (dest, zk, commandeOptions) => {
  const { arg, repondre } = commandeOptions;

  if (!arg) {
    repondre("❌ Please specify `true` or `false` for the welcome setting. Example: `welcome true`.");
    return;
  }

  const toggle = arg.trim().toLowerCase();
  if (toggle === "true") {
    settings.welcome = true;
    repondre("✅ Welcome messages have been enabled.");
  } else if (toggle === "false") {
    settings.welcome = false;
    repondre("✅ Welcome messages have been disabled.");
  } else {
    repondre("❌ Invalid argument. Use `true` or `false`.");
  }
});

adams({ nomCom: "goodbye", categorie: "Group", reaction: "✅" }, async (dest, zk, commandeOptions) => {
  const { arg, repondre } = commandeOptions;

  if (!arg) {
    repondre("❌ Please specify `true` or `false` for the goodbye setting. Example: `goodbye true`.");
    return;
  }

  const toggle = arg.trim().toLowerCase();
  if (toggle === "true") {
    settings.goodbye = true;
    repondre("✅ Goodbye messages have been enabled.");
  } else if (toggle === "false") {
    settings.goodbye = false;
    repondre("✅ Goodbye messages have been disabled.");
  } else {
    repondre("❌ Invalid argument. Use `true` or `false`.");
  }
});

// Event listener for group participants
adams({ nomCom: "participants", categorie: "Group" }, async (dest, zk, eventData) => {
  const { participantsAdded, participantsRemoved, nomGroupe, infosGroupe } = eventData;

  // Get current time in Nairobi timezone
  const currentTime = moment().tz("Africa/Nairobi").format("HH:mm:ss, MMMM Do YYYY");

  if (settings.welcome && participantsAdded.length > 0) {
    for (const participant of participantsAdded) {
      const memberNumber = infosGroupe.participants.length; // Get total members count
      const userJid = participant.id;

      try {
        await zk.sendMessage(dest, {
          text: `👋 Welcome @${userJid.split("@")[0]} to *${nomGroupe}*! 🎉\n🕒 Time: ${currentTime}\n👥 You are member number ${memberNumber}.\n\nWelcome aboard!`,
          mentions: [userJid], // Tag the user
        });
      } catch (error) {
        console.error("Failed to send welcome message:", error);
      }
    }
  }

  if (settings.goodbye && participantsRemoved.length > 0) {
    for (const participant of participantsRemoved) {
      const userJid = participant.id;

      try {
        await zk.sendMessage(dest, {
          text: `😢 Goodbye @${userJid.split("@")[0]}! We're sad to see you leave *${nomGroupe}*.\n🕒 Time: ${currentTime}\n\nTake care!`,
          mentions: [userJid], // Tag the user
        });
      } catch (error) {
        console.error("Failed to send goodbye message:", error);
      }
    }
  }
});

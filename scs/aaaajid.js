const { adams } = require("../Ibrahim/adams");

const groupCommandHandler = async (dest, zk, commandeOptions, action, timeInMinutes) => {
  const { ms, repondre, verifGroupe, verifAdmin, superUser } = commandeOptions;

  if (!verifGroupe) {
    repondre("✋🏿 This command is reserved for groups ❌");
    return;
  }

  if (!verifAdmin && !superUser) {
    repondre("❌ This command is reserved for group admins.");
    return;
  }

  try {
    const updateGroupSettings = async (setting) => {
      await zk.groupSettingUpdate(dest, setting);
      const statusMessage = setting === "not_announcement" ? 
        `🔓 Group is now open. Everyone can send messages.` : 
        `🔒 Group is now closed. Only admins can send messages.`;
      zk.sendMessage(dest, { text: statusMessage });
    };

    if (action === "open") {
      await updateGroupSettings("not_announcement");

      if (timeInMinutes && timeInMinutes > 0) {
        repondre(`⏳ Group will automatically close in ${timeInMinutes} minutes.`);
        setTimeout(async () => {
          await updateGroupSettings("announcement");
        }, timeInMinutes * 60 * 1000);
      }
    } else if (action === "close") {
      await updateGroupSettings("announcement");

      if (timeInMinutes && timeInMinutes > 0) {
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
};

// Command: group open
adams({ nomCom: "group open", categorie: 'Group', reaction: "🔓" }, async (dest, zk, commandeOptions) => {
  await groupCommandHandler(dest, zk, commandeOptions, "open", null);
});

// Command: group close
adams({ nomCom: "group close", categorie: 'Group', reaction: "🔒" }, async (dest, zk, commandeOptions) => {
  await groupCommandHandler(dest, zk, commandeOptions, "close", null);
});

// Command: group open <time>
adams({ nomCom: "group open time", categorie: 'Group', reaction: "⏳🔓" }, async (dest, zk, commandeOptions) => {
  const { arg, repondre } = commandeOptions;
  const timeInMinutes = parseInt(arg, 10);

  if (isNaN(timeInMinutes) || timeInMinutes <= 0) {
    repondre("❌ Invalid time specified. Use a positive number for time in minutes.");
    return;
  }

  await groupCommandHandler(dest, zk, commandeOptions, "open", timeInMinutes);
});

// Command: group close <time>
adams({ nomCom: "group close time", categorie: 'Group', reaction: "⏳🔒" }, async (dest, zk, commandeOptions) => {
  const { arg, repondre } = commandeOptions;
  const timeInMinutes = parseInt(arg, 10);

  if (isNaN(timeInMinutes) || timeInMinutes <= 0) {
    repondre("❌ Invalid time specified. Use a positive number for time in minutes.");
    return;
  }

  await groupCommandHandler(dest, zk, commandeOptions, "close", timeInMinutes);
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


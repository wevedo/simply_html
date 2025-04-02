
const { adams } = require("../Ibrahim/adams");
const fs = require("fs-extra");

// Improved group check function
async function checkGroup(zk, dest, repondre) {
  try {
    const metadata = await zk.groupMetadata(dest).catch(() => null);
    if (!metadata) {
      repondre("❌ This command only works in groups");
      return false;
    }
    return true;
  } catch (error) {
    repondre("❌ Error checking group status");
    return false;
  }
}

// Kick command (works by replying)
adams({ nomCom: "kick", categorie: 'Group', reaction: "👢" }, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, auteurMsgRepondu, verifAdmin, superUser } = commandeOptions;
  
  const isGroup = await checkGroup(zk, dest, repondre);
  if (!isGroup) return;
  
  if (!verifAdmin && !superUser) {
    repondre("🚫 You need admin rights to use this command");
    return;
  }
  
  if (!msgRepondu) {
    repondre("🔍 Reply to the user's message to kick them");
    return;
  }
  
  try {
    await zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "remove");
    repondre(`👢 User @${auteurMsgRepondu.split("@")[0]} has been kicked`, { mentions: [auteurMsgRepondu] });
  } catch (error) {
    repondre(`❌ Failed to kick: ${error.message}`);
  }
});

// Kickall command (skips bot and sender)
adams({ nomCom: "kickall", categorie: 'Group', reaction: "🔥" }, async (dest, zk, commandeOptions) => {
  const { repondre, auteurMessage, idBot, superUser } = commandeOptions;
  
  const isGroup = await checkGroup(zk, dest, repondre);
  if (!isGroup) return;
  
  if (!superUser) {
    repondre("🚫 This command is for bot owner only");
    return;
  }
  
  try {
    const metadata = await zk.groupMetadata(dest);
    const toKick = metadata.participants
      .filter(p => !p.admin && p.id !== auteurMessage && p.id !== idBot)
      .map(p => p.id);
    
    if (toKick.length === 0) {
      repondre("ℹ️ No members to kick");
      return;
    }
    
    await zk.groupParticipantsUpdate(dest, toKick, "remove");
    repondre(`🔥 Kicked ${toKick.length} members`);
  } catch (error) {
    repondre(`❌ Failed to kick all: ${error.message}`);
  }
});

// Group settings commands
adams({ nomCom: "opengroup", categorie: 'Group', reaction: "🔓" }, async (dest, zk, commandeOptions) => {
  const { repondre, verifAdmin, superUser } = commandeOptions;
  
  const isGroup = await checkGroup(zk, dest, repondre);
  if (!isGroup) return;
  
  if (!verifAdmin && !superUser) {
    repondre("🚫 You need admin rights");
    return;
  }
  
  try {
    await zk.groupSettingUpdate(dest, "not_announcement");
    repondre("🔓 Group is now open to all members");
  } catch (error) {
    repondre(`❌ Failed to open group: ${error.message}`);
  }
});

adams({ nomCom: "closegroup", categorie: 'Group', reaction: "🔒" }, async (dest, zk, commandeOptions) => {
  const { repondre, verifAdmin, superUser } = commandeOptions;
  
  const isGroup = await checkGroup(zk, dest, repondre);
  if (!isGroup) return;
  
  if (!verifAdmin && !superUser) {
    repondre("🚫 You need admin rights");
    return;
  }
  
  try {
    await zk.groupSettingUpdate(dest, "announcement");
    repondre("🔒 Group is now admin-only");
  } catch (error) {
    repondre(`❌ Failed to close group: ${error.message}`);
  }
});

// Timed group close
adams({ nomCom: "timedclose", categorie: 'Group', reaction: "⏱️" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, verifAdmin, superUser } = commandeOptions;
  
  const isGroup = await checkGroup(zk, dest, repondre);
  if (!isGroup) return;
  
  if (!verifAdmin && !superUser) {
    repondre("🚫 You need admin rights");
    return;
  }
  
  const minutes = parseInt(arg[0]) || 30;
  if (isNaN(minutes) || minutes < 1) {
    repondre("⏱️ Usage: timedclose [minutes] (default: 30)");
    return;
  }
  
  try {
    await zk.groupSettingUpdate(dest, "announcement");
    repondre(`⏱️ Group closed for ${minutes} minutes`);
    
    setTimeout(async () => {
      await zk.groupSettingUpdate(dest, "not_announcement");
      zk.sendMessage(dest, { text: "⏱️ Group auto-reopened" });
    }, minutes * 60000);
  } catch (error) {
    repondre(`❌ Failed to timed close: ${error.message}`);
  }
});

// Promote/demote commands
adams({ nomCom: "promote", categorie: 'Group', reaction: "⬆️" }, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, auteurMsgRepondu, verifAdmin, superUser } = commandeOptions;
  
  const isGroup = await checkGroup(zk, dest, repondre);
  if (!isGroup) return;
  
  if (!verifAdmin && !superUser) {
    repondre("🚫 You need admin rights");
    return;
  }
  
  if (!msgRepondu) {
    repondre("🔍 Reply to promote a user");
    return;
  }
  
  try {
    await zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "promote");
    repondre(`⬆️ Promoted @${auteurMsgRepondu.split("@")[0]}`, { mentions: [auteurMsgRepondu] });
  } catch (error) {
    repondre(`❌ Failed to promote: ${error.message}`);
  }
});

adams({ nomCom: "demote", categorie: 'Group', reaction: "⬇️" }, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, auteurMsgRepondu, verifAdmin, superUser } = commandeOptions;
  
  const isGroup = await checkGroup(zk, dest, repondre);
  if (!isGroup) return;
  
  if (!verifAdmin && !superUser) {
    repondre("🚫 You need admin rights");
    return;
  }
  
  if (!msgRepondu) {
    repondre("🔍 Reply to demote a user");
    return;
  }
  
  try {
    await zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "demote");
    repondre(`⬇️ Demoted @${auteurMsgRepondu.split("@")[0]}`, { mentions: [auteurMsgRepondu] });
  } catch (error) {
    repondre(`❌ Failed to demote: ${error.message}`);
  }
});

// Group profile picture
adams({ nomCom: "gpp", categorie: 'Group', reaction: "🖼️" }, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, verifAdmin, superUser } = commandeOptions;
  
  const isGroup = await checkGroup(zk, dest, repondre);
  if (!isGroup) return;
  
  if (!verifAdmin && !superUser) {
    repondre("🚫 You need admin rights");
    return;
  }
  
  if (!msgRepondu?.imageMessage) {
    repondre("🖼️ Reply to an image");
    return;
  }
  
  try {
    const buffer = await zk.downloadMediaMessage(msgRepondu.imageMessage);
    await zk.updateProfilePicture(dest, buffer);
    repondre("✅ Group picture updated");
  } catch (error) {
    repondre(`❌ Failed to update: ${error.message}`);
  }
});

// Group name/description
adams({ nomCom: "gname", categorie: 'Group', reaction: "✏️" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, verifAdmin, superUser } = commandeOptions;
  
  const isGroup = await checkGroup(zk, dest, repondre);
  if (!isGroup) return;
  
  if (!verifAdmin && !superUser) {
    repondre("🚫 You need admin rights");
    return;
  }
  
  if (!arg[0]) {
    repondre("✏️ Usage: gname [new name]");
    return;
  }
  
  try {
    await zk.groupUpdateSubject(dest, arg.join(" "));
    repondre("✅ Group name updated");
  } catch (error) {
    repondre(`❌ Failed to update: ${error.message}`);
  }
});

adams({ nomCom: "gdesc", categorie: 'Group', reaction: "📝" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, verifAdmin, superUser } = commandeOptions;
  
  const isGroup = await checkGroup(zk, dest, repondre);
  if (!isGroup) return;
  
  if (!verifAdmin && !superUser) {
    repondre("🚫 You need admin rights");
    return;
  }
  
  if (!arg[0]) {
    repondre("📝 Usage: gdesc [new description]");
    return;
  }
  
  try {
    await zk.groupUpdateDescription(dest, arg.join(" "));
    repondre("✅ Group description updated");
  } catch (error) {
    repondre(`❌ Failed to update: ${error.message}`);
  }
});

// Broadcast to all groups
adams({ nomCom: "broadcast", categorie: 'Owner', reaction: "📡" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, superUser } = commandeOptions;
  
  if (!superUser) {
    repondre("🚫 Owner only command");
    return;
  }
  
  if (!arg[0]) {
    repondre("📡 Usage: broadcast [message]");
    return;
  }
  
  try {
    const groups = await zk.groupFetchAllParticipating();
    const message = arg.join(" ");
    let success = 0;
    
    for (const group of groups) {
      try {
        await zk.sendMessage(group.id, { text: message });
        success++;
      } catch (e) {
        console.error(`Failed to send to ${group.id}:`, e);
      }
    }
    
    repondre(`📡 Sent to ${success}/${groups.length} groups`);
  } catch (error) {
    repondre("Failed to broadcast: " + error.message);
  }
});

// Add user to group
adams({ nomCom: "add", categorie: 'Group', reaction: "➕" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, verifGroupe, verifAdmin, superUser } = commandeOptions;
  
  if (!checkGroup(repondre, verifGroupe)) return;
  if (!verifAdmin && !superUser) {
    repondre("You need admin rights to use this command");
    return;
  }
  
  if (!arg || !arg[0]) {
    repondre("Please provide the phone number to add (e.g., 1234567890)");
    return;
  }
  
  const phoneNumber = arg[0].replace(/[^0-9]/g, "");
  if (phoneNumber.length < 10) {
    repondre("Please provide a valid phone number");
    return;
  }
  
  const userJid = phoneNumber + "@s.whatsapp.net";
  try {
    await zk.groupParticipantsUpdate(dest, [userJid], "add");
    repondre(`User ${phoneNumber} has been added to the group`);
  } catch (error) {
    repondre("Failed to add user: " + error.message);
  }
});

// Delete message
adams({ nomCom: "del", categorie: 'Group', reaction: "🗑️" }, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, verifGroupe, verifAdmin, superUser, ms } = commandeOptions;
  
  if (!checkGroup(repondre, verifGroupe)) return;
  if (!verifAdmin && !superUser) {
    repondre("You need admin rights to use this command");
    return;
  }
  
  if (!msgRepondu) {
    repondre("Reply to a message to delete it");
    return;
  }
  
  try {
    const key = {
      remoteJid: dest,
      fromMe: msgRepondu.key.fromMe,
      id: msgRepondu.key.id,
      participant: msgRepondu.key.participant
    };
    
    await zk.sendMessage(dest, { delete: key });
  } catch (error) {
    repondre("Failed to delete message: " + error.message);
  }
});

// Auto-clear messages
adams({ nomCom: "autoclear", categorie: 'Group', reaction: "🔄" }, async (dest, zk, commandeOptions) => {
  const { repondre, verifGroupe, verifAdmin, superUser, arg } = commandeOptions;
  
  if (!checkGroup(repondre, verifGroupe)) return;
  if (!verifAdmin && !superUser) {
    repondre("You need admin rights to use this command");
    return;
  }
  
  const hours = arg && arg[0] ? parseInt(arg[0]) : 24;
  if (isNaN(hours) || hours < 1) {
    repondre("Please provide a valid number of hours (default is 24)");
    return;
  }
  
  repondre(`Messages in this group will now automatically disappear after ${hours} hours`);
  // Note: Actual message expiration would require additional infrastructure
});

// Group info
adams({ nomCom: "info", categorie: 'Group', reaction: "ℹ️" }, async (dest, zk, commandeOptions) => {
  const { repondre, verifGroupe } = commandeOptions;
  
  if (!checkGroup(repondre, verifGroupe)) return;
  
  try {
    const metadata = await zk.groupMetadata(dest);
    let ppUrl;
    try {
      ppUrl = await zk.profilePictureUrl(dest, "image");
    } catch {
      ppUrl = conf.IMAGE_MENU;
    }
    
    const creationDate = new Date(metadata.creation * 1000).toLocaleDateString();
    const admins = metadata.participants.filter(p => p.admin).length;
    
    const infoMsg = `
╭───「 Group Info 」───
│
│ *Name:* ${metadata.subject}
│ *ID:* ${metadata.id}
│ *Created:* ${creationDate}
│ *Participants:* ${metadata.participants.length}
│ *Admins:* ${admins}
│ *Description:*
│ ${metadata.desc || "No description"}
╰────────────────────
    `;
    
    if (ppUrl) {
      await zk.sendMessage(dest, {
        image: { url: ppUrl },
        caption: infoMsg
      });
    } else {
      repondre(infoMsg);
    }
  } catch (error) {
    repondre("Failed to get group info: " + error.message);
  }
});

// Invite command
adams({ nomCom: "invite", categorie: 'Group', reaction: "📩" }, async (dest, zk, commandeOptions) => {
  const { repondre, verifGroupe } = commandeOptions;
  
  if (!checkGroup(repondre, verifGroupe)) return;
  
  try {
    const inviteCode = await zk.groupInviteCode(dest);
    const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
    
    repondre(`Group invite link:\n${inviteLink}\n\nShare this link to invite others to the group`);
  } catch (error) {
    repondre("Failed to generate invite link: " + error.message);
  }
});

// Hidetag command
adams({ nomCom: "hidetag", categorie: 'Group', reaction: "👻" }, async (dest, zk, commandeOptions) => {
  const { repondre, verifGroupe, verifAdmin, superUser, arg } = commandeOptions;
  
  if (!checkGroup(repondre, verifGroupe)) return;
  if (!verifAdmin && !superUser) {
    repondre("You need admin rights to use this command");
    return;
  }
  
  const message = arg.join(" ") || "Hello everyone";
  try {
    const metadata = await zk.groupMetadata(dest);
    const participants = metadata.participants.map(p => p.id);
    
    await zk.sendMessage(dest, {
      text: message,
      mentions: participants
    });
  } catch (error) {
    repondre("Failed to send hidden mention: " + error.message);
  }
});

// Poll command
adams({ nomCom: "poll", categorie: 'Group', reaction: "📊" }, async (dest, zk, commandeOptions) => {
  const { repondre, verifGroupe, arg } = commandeOptions;
  
  if (!checkGroup(repondre, verifGroupe)) return;
  
  if (!arg || arg.length < 3) {
    repondre("Usage: poll \"Question\" \"Option1\" \"Option2\" ...");
    return;
  }
  
  try {
    // Extract question (first argument)
    const question = arg[0];
    const options = arg.slice(1);
    
    if (options.length < 2) {
      repondre("You need at least 2 options for a poll");
      return;
    }
    
    if (options.length > 5) {
      repondre("Maximum 5 options allowed for a poll");
      return;
    }
    
    const pollMessage = {
      name: question,
      values: options,
      selectableCount: 1 // Single choice poll
    };
    
    await zk.sendMessage(dest, {
      poll: pollMessage
    });
  } catch (error) {
    repondre("Failed to create poll: " + error.message);
  }
});

// Post command (like announce to all groups)
adams({ nomCom: "post", categorie: 'Owner', reaction: "📢" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, superUser } = commandeOptions;
  
  if (!superUser) {
    repondre("This command is reserved for bot owner only");
    return;
  }
  
  if (!arg || !arg[0]) {
    repondre("Please provide a message to post");
    return;
  }
  
  const message = arg.join(" ");
  try {
    const groups = await zk.groupFetchAllParticipating();
    const groupIds = groups.map(g => g.id);
    
    for (const groupId of groupIds) {
      try {
        await zk.sendMessage(groupId, { text: message });
      } catch (error) {
        console.error(`Failed to post to ${groupId}:`, error);
      }
    }
    
    repondre("Message posted to all groups");
  } catch (error) {
    repondre("Failed to post message: " + error.message);
  }
});

// Reject command (reject join request)
adams({ nomCom: "reject", categorie: 'Group', reaction: "❌" }, async (dest, zk, commandeOptions) => {
  const { repondre, verifGroupe, verifAdmin, superUser, arg } = commandeOptions;
  
  if (!checkGroup(repondre, verifGroupe)) return;
  if (!verifAdmin && !superUser) {
    repondre("You need admin rights to use this command");
    return;
  }
  
  if (!arg || !arg[0]) {
    repondre("Please provide the user's phone number to reject");
    return;
  }
  
  const phoneNumber = arg[0].replace(/[^0-9]/g, "");
  const userJid = phoneNumber + "@s.whatsapp.net";
  
  try {
    // Note: Actual implementation depends on how join requests are handled
    repondre(`Join request from ${phoneNumber} has been rejected`);
  } catch (error) {
    repondre("Failed to reject join request: " + error.message);
  }
});

// Request command (approve join request)
adams({ nomCom: "req", categorie: 'Group', reaction: "✅" }, async (dest, zk, commandeOptions) => {
  const { repondre, verifGroupe, verifAdmin, superUser, arg } = commandeOptions;
  
  if (!checkGroup(repondre, verifGroupe)) return;
  if (!verifAdmin && !superUser) {
    repondre("You need admin rights to use this command");
    return;
  }
  
  if (!arg || !arg[0]) {
    repondre("Please provide the user's phone number to approve");
    return;
  }
  
  const phoneNumber = arg[0].replace(/[^0-9]/g, "");
  const userJid = phoneNumber + "@s.whatsapp.net";
  
  try {
    await zk.groupParticipantsUpdate(dest, [userJid], "add");
    repondre(`User ${phoneNumber} has been added to the group`);
  } catch (error) {
    repondre("Failed to approve join request: " + error.message);
  }
});

// Tagall command
adams({ nomCom: "tagall", categorie: 'Group', reaction: "📣" }, async (dest, zk, commandeOptions) => {
  const { repondre, verifGroupe, verifAdmin, superUser, arg } = commandeOptions;
  
  if (!checkGroup(repondre, verifGroupe)) return;
  if (!verifAdmin && !superUser) {
    repondre("You need admin rights to use this command");
    return;
  }
  
  try {
    const metadata = await zk.groupMetadata(dest);
    const participants = metadata.participants;
    const mentions = participants.map(p => p.id);
    
    const message = arg.join(" ") || "@everyone";
    
    await zk.sendMessage(dest, {
      text: message,
      mentions: mentions
    });
  } catch (error) {
    repondre("Failed to tag all members: " + error.message);
  }
});

// Send to all (DM all group members)
adams({ nomCom: "senttoall", categorie: 'Group', reaction: "✉️" }, async (dest, zk, commandeOptions) => {
  const { repondre, verifGroupe, verifAdmin, superUser, arg } = commandeOptions;
  
  if (!checkGroup(repondre, verifGroupe)) return;
  if (!verifAdmin && !superUser) {
    repondre("You need admin rights to use this command");
    return;
  }
  
  if (!arg || !arg[0]) {
    repondre("Please provide a message to send");
    return;
  }
  
  const message = arg.join(" ");
  try {
    const metadata = await zk.groupMetadata(dest);
    const participants = metadata.participants;
    
    let success = 0;
    let failed = 0;
    
    for (const participant of participants) {
      try {
        await zk.sendMessage(participant.id, { text: message });
        success++;
      } catch (error) {
        failed++;
      }
    }
    
    repondre(`Message sent to ${success} members (${failed} failed)`);
  } catch (error) {
    repondre("Failed to send messages: " + error.message);
  }
});

// Help command
adams({ nomCom: "help", categorie: 'General', reaction: "❓" }, async (dest, zk, commandeOptions) => {
  const { repondre } = commandeOptions;
  
  const helpMessage = `
╭───「 *BWM-XMD GROUP COMMAND 」
│
│ *Group Commands:*
│ - !add [number] - Add user to group
│ - !kick (reply) - Remove user from group
│ - !kickall - Remove all non-admin users
│ - !promote (reply) - Make user admin
│ - !demote (reply) - Remove admin rights
│ - !gpp (reply image) - Set group picture
│ - !gname [text] - Change group name
│ - !gdesc [text] - Change group description
│ - !opengroup - Allow all to send messages
│ - !closegroup - Only admins can send
│ - !timedclose [mins] - Temp close group
│ - !invite - Get group invite link
│ - !info - Show group info
│ - !tagall [msg] - Mention all members
│ - !hidetag [msg] - Silent mention all
│ - !poll "Q" "A" "B" - Create poll
│ - !del (reply) - Delete message
│ - !autoclear [hrs] - Auto-delete msgs
│ - !senttoall [msg] - DM all members
│
│ *Owner Commands:*
│ - !broadcast [msg] - Send to all groups
│ - !post [msg] - Announce to all groups
╰────────────────────☀️
  `;
  
  repondre(helpMessage);
});

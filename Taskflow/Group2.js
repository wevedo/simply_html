const { adams } = require("../Ibrahim/adams");

// ======================
// GLOBAL STATE STORE
// ======================
const groupState = new Map();

function setGroupState(groupId, state) {
  // Clear any existing timeout
  const current = groupState.get(groupId);
  if (current?.timeout) clearTimeout(current.timeout);
  
  // Set new state
  groupState.set(groupId, {
    ...state,
    timeout: state.timeoutId ? setTimeout(state.action, state.duration) : null
  });
}

function getGroupState(groupId) {
  return groupState.get(groupId) || {};
}

// ======================
// TIMED GROUP COMMANDS
// ======================
adams({ nomCom: "opentime", reaction: "⏱️", nomFichier: __filename }, async (dest, zk, { repondre, arg, verifAdmin }) => {
  if (!verifAdmin) return repondre("❌ Admin only command");
  
  const duration = parseDuration(arg[0]);
  if (!duration) return repondre("ℹ️ Usage: !opentime 5m (minutes) or !opentime 1h (hours)");

  // Set closed state immediately
  await zk.groupSettingUpdate(dest, "announcement");
  
  setGroupState(dest, {
    action: async () => {
      await zk.groupSettingUpdate(dest, "not_announcement");
      zk.sendMessage(dest, { text: "🔓 Group automatically opened" });
    },
    duration: duration,
    type: "scheduled_open",
    expiresAt: Date.now() + duration
  });

  repondre(`⏱️ Group will auto-open in ${formatDuration(duration)}`);
});

adams({ nomCom: "closetime", reaction: "⏱️", nomFichier: __filename }, async (dest, zk, { repondre, arg, verifAdmin }) => {
  if (!verifAdmin) return repondre("❌ Admin only command");
  
  const duration = parseDuration(arg[0]);
  if (!duration) return repondre("ℹ️ Usage: !closetime 5m (minutes) or !closetime 1h (hours)");

  // Set open state immediately
  await zk.groupSettingUpdate(dest, "not_announcement");
  
  setGroupState(dest, {
    action: async () => {
      await zk.groupSettingUpdate(dest, "announcement");
      zk.sendMessage(dest, { text: "🔒 Group automatically closed" });
    },
    duration: duration,
    type: "scheduled_close", 
    expiresAt: Date.now() + duration
  });

  repondre(`⏱️ Group will auto-close in ${formatDuration(duration)}`);
});

// ======================
// DISAPPEARING MESSAGES
// ======================
adams({ nomCom: "disap", reaction: "⏳", nomFichier: __filename }, async (dest, zk, { repondre, verifAdmin }) => {
  if (!verifAdmin) return repondre("❌ Admin only command");
  
  repondre([
    "⏳ *Disappearing Messages*",
    "Choose duration:",
    "• `!disap1` - 1 day",
    "• `!disap7` - 7 days", 
    "• `!disap90` - 90 days",
    "• `!disap-off` - Turn off"
  ].join("\n"));
});

// Handler for all durations
const setupDisappearing = (cmd, days) => {
  adams({ nomCom: cmd, reaction: "⏳", nomFichier: __filename }, async (dest, zk, { repondre, verifAdmin }) => {
    if (!verifAdmin) return repondre("❌ Admin only command");
    
    try {
      await zk.groupSettingUpdate(dest, "ephemeral", days * 86400);
      repondre(`✅ Messages will disappear after ${days} day${days !== 1 ? 's' : ''}`);
    } catch (error) {
      repondre(`❌ Failed: ${error.message}`);
    }
  });
};

setupDisappearing("disap1", 1);
setupDisappearing("disap7", 7); 
setupDisappearing("disap90", 90);

// Turn off disappearing messages
adams({ nomCom: "disap-off", reaction: "⏳", nomFichier: __filename }, async (dest, zk, { repondre, verifAdmin }) => {
  if (!verifAdmin) return repondre("❌ Admin only command");
  
  try {
    await zk.groupSettingUpdate(dest, "ephemeral", 0);
    repondre("✅ Disappearing messages turned off");
  } catch (error) {
    repondre(`❌ Failed: ${error.message}`);
  }
});

// ======================
// HELPER FUNCTIONS
// ======================
function parseDuration(input) {
  if (!input) return null;
  const match = input.match(/^(\d+)([mh])$/i);
  if (!match) return null;
  
  const val = parseInt(match[1]);
  return match[2] === 'm' ? val * 60000 : val * 3600000;
}

function formatDuration(ms) {
  const mins = Math.floor(ms / 60000);
  return mins < 60 ? `${mins} minute${mins !== 1 ? 's' : ''}` : `${Math.floor(mins/60)} hour${mins >= 120 ? 's' : ''}`;
}


adams({ nomCom: "online", reaction: "🟢", nomFichier: __filename }, async (dest, zk, commandeOptions) => {
  const { repondre } = commandeOptions;
  
  try {
    const metadata = await zk.groupMetadata(dest);
    const onlineMembers = [];
    
    // Check presence for each member
    await Promise.all(metadata.participants.map(async (member) => {
      try {
        const presence = await zk.presenceSubscribe(member.id);
        if (presence.lastSeen === null || Date.now() - presence.lastSeen < 300000) { // 5 min threshold
          onlineMembers.push({
            id: member.id,
            name: member.id.split('@')[0],
            lastSeen: presence.lastSeen,
            status: presence.lastSeen === null ? "Online Now" : "Recently Active"
          });
        }
      } catch (error) {
        console.error(`Presence check failed for ${member.id}:`, error);
      }
    }));
    
    // Format message
    let message = "🟢 *Online Members* 🟢\n\n";
    message += `Total: ${onlineMembers.length}/${metadata.participants.length}\n\n`;
    
    onlineMembers.forEach((member, index) => {
      message += `${index+1}. @${member.name} - ${member.status}\n`;
    });
    
    await zk.sendMessage(dest, {
      text: message,
      mentions: onlineMembers.map(m => m.id)
    });
    
  } catch (error) {
    repondre(`❌ Failed to check online status: ${error.message}`);
  }
});


adams({ nomCom: "info", categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe } = commandeOptions;
  if (!verifGroupe) { repondre("order reserved for the group only"); return };

 try { ppgroup = await zk.profilePictureUrl(dest ,'image') ; } catch { ppgroup = conf.IMAGE_MENU}

    const info = await zk.groupMetadata(dest)

    /*console.log(metadata.id + ", title: " + metadata.subject + ", description: " + metadata.desc)*/


    let mess = {
      image: { url: ppgroup },
      caption:  `*━━━━『Group Info』━━━━*\n\n*🎐Name:* ${info.subject}\n\n*🔩Group's ID:* ${dest}\n\n*🔍Desc:* \n\n${info.desc}`
    }


    zk.sendMessage(dest, mess, { quoted: ms })
  });


adams({ nomCom: "lockdown", reaction: "🚫", nomFichier: __filename }, async (chatId, zk, { repondre, verifAdmin }) => {
  try {
    if (!verifAdmin) return repondre("❌ Admin privileges required");
    
    await zk.groupSettingUpdate(chatId, "locked");
    repondre("🚫 Group locked - only admins can change settings");
    
  } catch (error) {
    repondre(`❌ Failed to lockdown group: ${error.message}`);
  }
});

adams({ nomCom: "tagadmin", reaction: "🛡️", nomFichier: __filename }, async (chatId, zk, { repondre, arg }) => {
  try {
    const metadata = await zk.groupMetadata(chatId);
    const admins = metadata.participants.filter(p => p.admin);
    
    if (admins.length === 0) {
      return repondre("ℹ️ This group has no admins");
    }

    const message = arg?.join(' ') || "Attention admins!";
    
    await zk.sendMessage(chatId, {
      text: `🛡️ *Admin Mention* 🛡️\n\n${message}\n\n${admins.map(a => `◎ @${a.id.split('@')[0]}`).join('\n')}`,
      mentions: admins.map(a => a.id)
    });
    
  } catch (error) {
    repondre(`❌ Failed to tag admins: ${error.message}`);
  }
});

adams({ nomCom: "resetlink", reaction: "🔄", nomFichier: __filename }, async (chatId, zk, { repondre, verifAdmin }) => {
  try {
    if (!verifAdmin) {
      return repondre("❌ You need admin privileges to reset invite link");
    }

    // Revoke old link and create new one
    await zk.groupRevokeInvite(chatId);
    const newInvite = await zk.groupInviteCode(chatId);
    const inviteLink = `https://chat.whatsapp.com/${newInvite}`;
    
    repondre(`🔄 *New Group Invite Link*\n\n${inviteLink}\n\nPrevious links are now invalid`);
    
  } catch (error) {
    repondre(`❌ Failed to reset invite link: ${error.message}`);
  }
});

adams({ nomCom: "poll", reaction: "📊", nomFichier: __filename }, async (chatId, zk, { repondre, arg, verifAdmin }) => {
  try {
    if (!verifAdmin) {
      return repondre("❌ You need admin privileges to create polls");
    }

    if (!arg || arg.length < 3) {
      return repondre("ℹ️ Usage: !poll \"Question\" \"Option1\" \"Option2\" ...\nExample: !poll \"Best Time for Meeting\" \"Morning\" \"Afternoon\" \"Evening\"");
    }

    const question = arg[0].replace(/"/g, '');
    const options = arg.slice(1).map(opt => opt.replace(/"/g, ''));

    await zk.sendMessage(chatId, {
      poll: {
        name: question,
        values: options,
        selectableCount: 1 // Single choice poll
      }
    });
    
  } catch (error) {
    repondre(`❌ Failed to create poll: ${error.message}`);
  }
});

adams({ nomCom: "resetlink", reaction: "🔄", nomFichier: __filename }, async (chatId, zk, { repondre, verifAdmin }) => {
  try {
    if (!verifAdmin) {
      return repondre("❌ You need admin privileges to reset invite link");
    }

    // Revoke old link and create new one
    await zk.groupRevokeInvite(chatId);
    const newInvite = await zk.groupInviteCode(chatId);
    const inviteLink = `https://chat.whatsapp.com/${newInvite}`;
    
    repondre(`🔄 *New Group Invite Link*\n\n${inviteLink}\n\nPrevious links are now invalid`);
    
  } catch (error) {
    repondre(`❌ Failed to reset invite link: ${error.message}`);
  }
});

adams({ nomCom: "poll", reaction: "📊", nomFichier: __filename }, async (chatId, zk, { repondre, arg, verifAdmin }) => {
  try {
    if (!verifAdmin) {
      return repondre("❌ You need admin privileges to create polls");
    }

    if (!arg || arg.length < 3) {
      return repondre("ℹ️ Usage: !poll \"Question\" \"Option1\" \"Option2\" ...\nExample: !poll \"Best Time for Meeting\" \"Morning\" \"Afternoon\" \"Evening\"");
    }

    const question = arg[0].replace(/"/g, '');
    const options = arg.slice(1).map(opt => opt.replace(/"/g, ''));

    await zk.sendMessage(chatId, {
      poll: {
        name: question,
        values: options,
        selectableCount: 1 // Single choice poll
      }
    });
    
  } catch (error) {
    repondre(`❌ Failed to create poll: ${error.message}`);
  }
});

adams({ nomCom: "setgrouppic", reaction: "🖼️", nomFichier: __filename }, async (dest, zk, commandeOptions) => {
  const { ms, repondre } = commandeOptions;
  
  if (!ms.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
    return repondre("ℹ️ Reply to an image message to set as group picture");
  }

  try {
    const buffer = await zk.downloadMediaMessage(ms.message.extendedTextMessage.contextInfo.quotedMessage);
    await zk.updateProfilePicture(dest, buffer);
    repondre("✅ Group picture updated successfully");
  } catch (error) {
    repondre(`❌ Failed to update: ${error.message}`);
  }
});

adams({ nomCom: "countries", reaction: "🌍", nomFichier: __filename }, async (chatId, zk, { repondre }) => {
  try {
    const metadata = await zk.groupMetadata(chatId);
    const members = metadata.participants;
    
    // Group members by country code (first few digits of their number)
    const countryGroups = members.reduce((acc, member) => {
      const countryCode = member.id.split('@')[0].substring(0, 3); // Adjust based on your country code length
      acc[countryCode] = acc[countryCode] || [];
      acc[countryCode].push(`@${member.id.split('@')[0]}`);
      return acc;
    }, {});

    // Format the output
    let message = "🌍 *Group Members by Country* 🌍\n\n";
    for (const [country, members] of Object.entries(countryGroups)) {
      message += `🇺🇳 ${country} (${members.length} members):\n${members.join(', ')}\n\n`;
    }

    await zk.sendMessage(chatId, {
      text: message,
      mentions: members.map(m => m.id)
    });
    
  } catch (error) {
    repondre(`❌ Failed to group members by country: ${error.message}`);
  }
});

adams({ nomCom: "ephemeral", reaction: "⏳", nomFichier: __filename }, async (dest, zk, commandeOptions) => {
  const { repondre, arg } = commandeOptions;
  
  const durations = {
    '1h': 3600,
    '24h': 86400,
    '7d': 604800
  };
  
  if (!arg[0] || !durations[arg[0]]) {
    return repondre("ℹ️ Usage: !ephemeral 1h/24h/7d\nDisappears after: 1 hour, 24 hours, or 7 days");
  }
  
  try {
    await zk.groupSettingUpdate(dest, "ephemeral", durations[arg[0]]);
    repondre(`✅ Messages will now disappear after ${arg[0]}`);
  } catch (error) {
    repondre(`❌ Failed to set: ${error.message}`);
  }
});

adams({ nomCom: "del", reaction: "🗑️", nomFichier: __filename }, async (dest, zk, commandeOptions) => {
  const { ms, repondre } = commandeOptions;
  
  if (!ms.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    return repondre("ℹ️ Reply to a message to delete it");
  }

  try {
    const key = {
      remoteJid: dest,
      fromMe: ms.message.extendedTextMessage.contextInfo.participant === zk.user.id,
      id: ms.message.extendedTextMessage.contextInfo.stanzaId,
      participant: ms.message.extendedTextMessage.contextInfo.participant
    };
    
    await zk.sendMessage(dest, { delete: key });
    const confirmation = await repondre("✅ Message deleted");
    
    // Auto-delete confirmation after 5 seconds
    setTimeout(async () => {
      try {
        await zk.sendMessage(dest, { delete: confirmation.key });
      } catch (e) {}
    }, 5000);
    
  } catch (error) {
    repondre(`❌ Failed to delete: ${error.message}`);
  }
});

adams({ nomCom: "reject", reaction: "❌", nomFichier: __filename }, async (chatId, zk, { repondre, verifAdmin }) => {
  try {
    if (!verifAdmin) {
      return repondre("❌ You need admin privileges to reject join requests");
    }

    // Get pending requests
    const pendingRequests = await zk.groupRequestParticipantsList(chatId);
    
    if (!pendingRequests || pendingRequests.length === 0) {
      return repondre("ℹ️ No pending join requests found");
    }

    // Reject all pending requests
    await zk.groupRequestParticipantsUpdate(chatId, pendingRequests, "reject");
    repondre(`❌ Rejected ${pendingRequests.length} join request(s)`);
    
  } catch (error) {
    repondre(`❌ Failed to reject requests: ${error.message}`);
  }
});

adams({ nomCom: "approve", reaction: "✅", nomFichier: __filename }, async (chatId, zk, { repondre, verifAdmin }) => {
  try {
    if (!verifAdmin) {
      return repondre("❌ You need admin privileges to approve join requests");
    }

    // Get pending requests (implementation may vary based on your WhatsApp library)
    const pendingRequests = await zk.groupRequestParticipantsList(chatId);
    
    if (!pendingRequests || pendingRequests.length === 0) {
      return repondre("ℹ️ No pending join requests found");
    }

    // Approve all pending requests
    await zk.groupRequestParticipantsUpdate(chatId, pendingRequests, "approve");
    repondre(`✅ Approved ${pendingRequests.length} join request(s)`);
    
  } catch (error) {
    repondre(`❌ Failed to approve requests: ${error.message}`);
  }
});



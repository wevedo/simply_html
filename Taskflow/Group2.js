const { adams } = require("../Ibrahim/adams");
const BOT_NAME = "BWM_XMD";
const BOT_TAGLINE = "Next-Gen WhatsApp Automation";
const EMOJI_THEME = {
  success: "⚡",
  error: "💢",
  info: "ℹ️",
  processing: "🔄"
};
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');

  // Global store for timed operations
const groupTimers = new Map();

// Helper function to parse duration
const parseDuration = (input) => {
  const match = input.match(/^(\d+)([mh])$/i);
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  return unit === 'm' ? value * 60 * 1000 : value * 60 * 60 * 1000;
};

// Helper function to format duration
const formatDuration = (ms) => {
  const minutes = Math.floor(ms / (60 * 1000));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return hours > 0 
    ? `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` and ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}` : ''}`
    : `${minutes} minute${minutes > 1 ? 's' : ''}`;
};

// Open Group with Delay
adams({ nomCom: "opentime",categorie: "Group", reaction: "⏱️", nomFichier: __filename }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, verifAdmin, superUser } = commandeOptions;
  
  // Check permissions
  if (!verifAdmin && !superUser) {
    return repondre("❌ You need admin privileges to schedule group opening");
  }

  // Validate input
  if (!arg || !arg[0]) {
    return repondre("ℹ️ Usage: !opentime 5m (minutes) or !opentime 1h (hours)");
  }

  const durationMs = parseDuration(arg[0]);
  if (!durationMs || durationMs < 60000) {
    return repondre("❌ Minimum duration is 1 minute (1m)");
  }

  try {
    // Check current state
    const metadata = await zk.groupMetadata(dest);
    if (metadata.announce === false) {
      return repondre("ℹ️ Group is already open");
    }

    // Clear any existing timer
    if (groupTimers.has(dest)) {
      clearTimeout(groupTimers.get(dest));
      groupTimers.delete(dest);
    }

    // Schedule opening
    repondre(`🕒 Group will open in ${formatDuration(durationMs)}`);

    const timer = setTimeout(async () => {
      try {
        await zk.groupSettingUpdate(dest, "not_announcement");
        zk.sendMessage(dest, { text: "🔓 Group has been automatically opened" });
        groupTimers.delete(dest);
      } catch (error) {
        console.error("Auto-open failed:", error);
      }
    }, durationMs);

    // Store timer reference
    groupTimers.set(dest, timer);

  } catch (error) {
    repondre(`❌ Failed to schedule opening: ${error.message}`);
  }
});

// Close Group with Delay
adams({ nomCom: "closetime", categorie: "Group",reaction: "⏱️", nomFichier: __filename }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, verifAdmin, superUser } = commandeOptions;
  
  // Check permissions
  if (!verifAdmin && !superUser) {
    return repondre("❌ You need admin privileges to schedule group closing");
  }

  // Validate input
  if (!arg || !arg[0]) {
    return repondre("ℹ️ Usage: !closetime 5m (minutes) or !closetime 1h (hours)");
  }

  const durationMs = parseDuration(arg[0]);
  if (!durationMs || durationMs < 60000) {
    return repondre("❌ Minimum duration is 1 minute (1m)");
  }

  try {
    // Check current state
    const metadata = await zk.groupMetadata(dest);
    if (metadata.announce === true) {
      return repondre("ℹ️ Group is already closed");
    }

    // Clear any existing timer
    if (groupTimers.has(dest)) {
      clearTimeout(groupTimers.get(dest));
      groupTimers.delete(dest);
    }

    // Schedule closing
    repondre(`🕒 Group will close in ${formatDuration(durationMs)}`);

    const timer = setTimeout(async () => {
      try {
        await zk.groupSettingUpdate(dest, "announcement");
        zk.sendMessage(dest, { text: "🔒 Group has been automatically closed" });
        groupTimers.delete(dest);
      } catch (error) {
        console.error("Auto-close failed:", error);
      }
    }, durationMs);

    // Store timer reference
    groupTimers.set(dest, timer);

  } catch (error) {
    repondre(`❌ Failed to schedule closing: ${error.message}`);
  }
});

// Cancel Scheduled Operation
adams({ nomCom: "canceltimer", categorie: "Group",reaction: "❌", nomFichier: __filename }, async (dest, zk, commandeOptions) => {
  const { repondre, verifAdmin, superUser } = commandeOptions;
  
  if (!verifAdmin && !superUser) {
    return repondre("❌ You need admin privileges to cancel scheduled operations");
  }

  if (groupTimers.has(dest)) {
    clearTimeout(groupTimers.get(dest));
    groupTimers.delete(dest);
    repondre("✅ Cancelled pending group state change");
  } else {
    repondre("ℹ️ No scheduled operations found for this group");
  }
});


adams({ 
  nomCom: "online", 
  categorie: "Group",
  reaction: "🟢", 
  nomFichier: __filename 
}, async (dest, zk, commandeOptions) => {
  const { repondre } = commandeOptions;
  
  try {
    const metadata = await zk.groupMetadata(dest);
    const onlineMembers = [];
    const offlineMembers = [];
    
    // Check presence for each member
    await Promise.all(metadata.participants.map(async (member) => {
      try {
        // Get presence data safely
        const presence = await zk.presenceSubscribe(member.id).catch(() => null);
        
        if (!presence || !presence.lastKnownPresence) {
          offlineMembers.push({
            id: member.id,
            name: member.id.split('@')[0],
            status: "Status Unknown"
          });
          return;
        }
        
        const isOnline = presence.lastKnownPresence === 'available';
        const isRecent = presence.lastSeen && (Date.now() - presence.lastSeen < 300000); // 5 min threshold
        
        if (isOnline || isRecent) {
          onlineMembers.push({
            id: member.id,
            name: member.id.split('@')[0],
            status: isOnline ? "Online Now" : "Recently Active"
          });
        } else {
          offlineMembers.push({
            id: member.id,
            name: member.id.split('@')[0],
            status: "Offline"
          });
        }
      } catch (error) {
        console.error(`Presence check failed for ${member.id}:`, error);
        offlineMembers.push({
          id: member.id,
          name: member.id.split('@')[0],
          status: "Error Checking Status"
        });
      }
    }));

    // Format the response
    let responseText = `🟢 *${BOT_NAME} Online Check* 🟢\n\n`;
    responseText += `👥 *Group:* ${metadata.subject}\n`;
    responseText += `🟢 *Online Members (${onlineMembers.length}):*\n`;
    
    onlineMembers.forEach((member, index) => {
      responseText += `${index + 1}. @${member.name} (${member.status})\n`;
    });
    
    responseText += `\n⚫ *Offline/Unknown (${offlineMembers.length})*\n`;
    
    if (onlineMembers.length === 0) {
      responseText += `\nNo members currently online or recently active.`;
    }

    // Send the response with mentions
    await repondre({
      text: responseText,
      mentions: onlineMembers.map(member => member.id)
    });

  } catch (error) {
    console.error('Error in online command:', error);
    await repondre({
      text: `${EMOJI_THEME.error} *Failed to check online status*\n${error.message}`
    });
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


adams({ nomCom: "lockdown", categorie: "Group",reaction: "🚫", nomFichier: __filename }, async (chatId, zk, { repondre, verifAdmin }) => {
  try {
    if (!verifAdmin) return repondre("❌ Admin privileges required");
    
    await zk.groupSettingUpdate(chatId, "locked");
    repondre("🚫 Group locked - only admins can change settings");
    
  } catch (error) {
    repondre(`❌ Failed to lockdown group: ${error.message}`);
  }
});

adams({ nomCom: "tagadmin", categorie: "Group",reaction: "🛡️", nomFichier: __filename }, async (chatId, zk, { repondre, arg }) => {
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

adams({ nomCom: "resetlink",categorie: "Group", reaction: "🔄", nomFichier: __filename }, async (chatId, zk, { repondre, verifAdmin }) => {
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

adams({ nomCom: "poll", categorie: "Group",reaction: "📊", nomFichier: __filename }, async (chatId, zk, { repondre, arg, verifAdmin }) => {
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

adams({ nomCom: "resetlink", categorie: "Group",reaction: "🔄", nomFichier: __filename }, async (chatId, zk, { repondre, verifAdmin }) => {
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

adams({ nomCom: "poll",categorie: "Group", reaction: "📊", nomFichier: __filename }, async (chatId, zk, { repondre, arg, verifAdmin }) => {
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


adams({ nomCom: "setgrouppic", categorie: "Group", reaction: "🖼️", nomFichier: __filename }, async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;
  
    // Check if the message is a quoted image
    const quotedMsg = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg?.imageMessage) {
        return repondre("ℹ️ Please reply to an image message to set as group picture");
    }

    let mediaPath;
    
    try {
        // Download and save the media file (image)
        const stream = await zk.downloadContentFromMessage(quotedMsg.imageMessage, 'image');
        const buffer = await streamToBuffer(stream);

        // Save image to a temporary file
        const tempPath = path.join(__dirname, `temp_${Date.now()}.jpg`);
        await fs.writeFile(tempPath, buffer);

        // Update group profile picture with the downloaded image
        await zk.groupUpdatePicture(dest, buffer);
        
        // Cleanup temporary file
        fs.unlinkSync(tempPath);

        repondre("✅ Group picture updated successfully");
    } catch (error) {
        console.error("Error updating group picture:", error);
        repondre(`❌ Failed to update group picture: ${error.message}`);
        
        // Cleanup if an error occurs and the temporary file exists
        if (mediaPath && fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath);
        }
    }
});

// Utility function to convert stream to buffer
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}
adams({ nomCom: "countries",categorie: "Group", reaction: "🌍", nomFichier: __filename }, async (chatId, zk, { repondre }) => {
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

adams({ nomCom: "ephemeral",categorie: "Group", reaction: "⏳", nomFichier: __filename }, async (dest, zk, commandeOptions) => {
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

adams({ nomCom: "del", categorie: "Group",reaction: "🗑️", nomFichier: __filename }, async (dest, zk, commandeOptions) => {
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

adams({ nomCom: "reject", categorie: "Group",reaction: "❌", nomFichier: __filename }, async (chatId, zk, { repondre, verifAdmin }) => {
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

adams({ nomCom: "approve", categorie: "Group",reaction: "✅", nomFichier: __filename }, async (chatId, zk, { repondre, verifAdmin }) => {
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



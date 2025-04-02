const { adams } = require("../Ibrahim/adams");


adams({ nomCom: "online", reaction: "🟢", nomFichier: __filename }, async (chatId, zk, { repondre }) => {
  try {
    // Get group metadata and participants
    const metadata = await zk.groupMetadata(chatId);
    const participants = metadata.participants;
    
    // Array to store online members
    const onlineMembers = [];
    
    // Check presence for each member
    await Promise.all(participants.map(async (member) => {
      try {
        const presence = await zk.presenceSubscribe(member.id);
        if (presence.lastSeen === null || presence.lastSeen > Date.now() - 300000) { // 5 minutes threshold
          onlineMembers.push({
            id: member.id,
            lastSeen: presence.lastSeen,
            isOnline: presence.lastSeen === null
          });
        }
      } catch (error) {
        console.error(`Error checking presence for ${member.id}:`, error);
      }
    }));
    
    // Sort by online status (currently online first)
    onlineMembers.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return b.lastSeen - a.lastSeen; // Most recent first
    });
    
    // Format the message
    let message = "🟢 *Online Members* 🟢\n\n";
    message += `Total Online/Recent: ${onlineMembers.length}/${participants.length}\n\n`;
    
    onlineMembers.forEach((member, index) => {
      const phoneNumber = member.id.split('@')[0];
      const status = member.isOnline 
        ? "🟢 Currently Online" 
        : `🕒 Last seen: ${formatTimeAgo(member.lastSeen)}`;
      message += `${index + 1}. @${phoneNumber} - ${status}\n`;
    });
    
    // Send the message with mentions
    await zk.sendMessage(chatId, {
      text: message,
      mentions: onlineMembers.map(m => m.id)
    });
    
  } catch (error) {
    repondre(`❌ Failed to check online members: ${error.message}`);
  }
});

// Helper function to format time
function formatTimeAgo(timestamp) {
  if (!timestamp) return "Unknown";
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds/60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds/3600)} hours ago`;
  return `${Math.floor(seconds/86400)} days ago`;
}

adams({ nomCom: "report", reaction: "🚨", nomFichier: __filename }, async (chatId, zk, { repondre, msgRepondu }) => {
  try {
    if (!msgRepondu) return repondre("ℹ️ Reply to message to report");
    
    const userJid = msgRepondu.key.participant;
    const admins = (await zk.groupMetadata(chatId)).participants.filter(p => p.admin);
    
    await zk.sendMessage(chatId, {
      text: `🚨 REPORTED MESSAGE\n\nReported by: @${zk.user.id.split('@')[0]}\n\nAdmins please review`,
      mentions: admins.map(a => a.id)
    }, { quoted: msgRepondu });
    
    repondre("✅ Reported to admins");
    
  } catch (error) {
    repondre(`❌ Report failed: ${error.message}`);
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

adams({ nomCom: "setgroupphoto", reaction: "🖼️", nomFichier: __filename }, async (chatId, zk, { repondre, msgRepondu, verifAdmin }) => {
  try {
    if (!verifAdmin) {
      return repondre("❌ You need admin privileges to change group photo");
    }

    if (!msgRepondu?.imageMessage) {
      return repondre("ℹ️ Please reply to an image message to set as group photo");
    }

    // Download the image
    const buffer = await zk.downloadMediaMessage(msgRepondu.imageMessage);
    
    // Set as group picture
    await zk.updateProfilePicture(chatId, buffer);
    repondre("✅ Group photo updated successfully");
    
  } catch (error) {
    repondre(`❌ Failed to update group photo: ${error.message}`);
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

adams({ nomCom: "ephemeral", reaction: "⏳", nomFichier: __filename }, async (chatId, zk, { repondre, arg, verifAdmin }) => {
  try {
    if (!verifAdmin) {
      return repondre("❌ You need admin privileges to change message settings");
    }

    const durations = {
      '24h': 86400,
      '7d': 604800,
      '90d': 7776000
    };

    const duration = arg[0]?.toLowerCase();
    
    if (!duration || !durations[duration]) {
      return repondre("ℹ️ Usage: !ephemeral 24h/7d/90d\nExample: !ephemeral 24h");
    }

    await zk.groupSettingUpdate(chatId, "ephemeral", durations[duration]);
    repondre(`✅ Messages will now disappear after ${duration}`);
    
  } catch (error) {
    repondre(`❌ Failed to set disappearing messages: ${error.message}`);
  }
});

adams({ nomCom: "del", reaction: "🗑️", nomFichier: __filename }, async (chatId, zk, { repondre, msgRepondu, verifAdmin }) => {
  try {
    if (!verifAdmin) {
      return repondre("❌ You need admin privileges to delete messages");
    }

    if (!msgRepondu) {
      return repondre("ℹ️ Reply to a message to delete it");
    }

    // Delete the quoted message
    const deleteKey = {
      remoteJid: chatId,
      fromMe: msgRepondu.key.fromMe,
      id: msgRepondu.key.id,
      participant: msgRepondu.key.participant
    };
    
    await zk.sendMessage(chatId, { delete: deleteKey });
    repondre("✅ Message deleted");
    
    // Auto-delete the confirmation after 5 seconds
    setTimeout(async () => {
      try {
        await zk.sendMessage(chatId, { delete: repondre.key });
      } catch (e) {}
    }, 5000);
    
  } catch (error) {
    repondre(`❌ Failed to delete message: ${error.message}`);
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



const { adams } = require("../Ibrahim/adams");
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const fs = require("fs-extra");
const conf = require("../config");
const { default: axios } = require('axios');
const { createContext } = require("../utils/helper");

// Helper function to decode JID
function decodeJid(jid) {
  return jid?.decodeJid?.() || jid;
}

// Constants for the new branding
const BOT_NAME = "BWM_XMD";
const BOT_TAGLINE = "Next-Gen WhatsApp Automation";
const DEFAULT_THUMBNAIL = "https://files.catbox.moe/sd49da.jpg";
const EMOJI_THEME = {
  success: "⚡",
  error: "💢",
  warning: "⚠️",
  info: "ℹ️",
  admin: "🛡️",
  group: "👥",
  broadcast: "📡"
};

// Enhanced group verification with proper metadata extraction
async function verifyGroup(zk, dest, repondre, ms) {
  try {
    const metadata = await zk.groupMetadata(dest);
    
    // Extract sender information
    const senderJid = ms.key.participant || ms.key.remoteJid;
    const senderName = ms.pushName || "User";
    
    return {
      isGroup: true,
      metadata,
      groupName: metadata.subject || "Unknown Group",
      senderName
    };
  } catch (error) {
    const context = createContext(dest, {
      title: "Group Verification Failed",
      body: "This command requires a group chat"
    });
    
    repondre({
      text: `${EMOJI_THEME.error} *Command Restricted*\nThis feature only works in group chats`,
      ...context
    });
    return { isGroup: false };
  }
}

// Premium tagall command with fixed metadata
adams({ nomCom: "tagall", categorie: 'Group', reaction: "📣" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifAdmin, superUser } = commandeOptions;
  
  // Get proper group metadata
  const { isGroup, metadata, groupName, senderName } = await verifyGroup(zk, dest, repondre, ms);
  if (!isGroup) return;

  const message = arg?.join(' ') || 'Notification from admin';
  const members = metadata.participants;
  
  if (!verifAdmin && !superUser) {
    const context = createContext(dest, {
      title: "Admin Privileges Required",
      body: "Tagall command restricted"
    });
    
    return repondre({
      text: `${EMOJI_THEME.admin} *Access Denied*\nThis command requires admin privileges`,
      ...context
    });
  }

  const tagMessage = `
🟣 *${BOT_NAME} Group Mention* 🟣

📌 *Group:* ${groupName}
👤 *From:* ${senderName}
📝 *Message:* ${message}

${members.map(m => `◎ @${m.id.split('@')[0]}`).join('\n')}
  `;

  const context = createContext(dest, {
    title: "Group Mention Alert",
    body: `New mention in ${groupName}`
  });

  await zk.sendMessage(dest, {
    text: tagMessage,
    mentions: members.map(m => m.id),
    ...context
  }, { quoted: ms });
});

// Fixed hidetag command with proper names
adams({ nomCom: "hidetag", categorie: 'Group', reaction: "👻" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifAdmin, superUser } = commandeOptions;
  
  const { isGroup, metadata, groupName, senderName } = await verifyGroup(zk, dest, repondre, ms);
  if (!isGroup) return;

  if (!verifAdmin && !superUser) {
    const context = createContext(dest, {
      title: "Admin Privileges Required",
      body: "Hidetag command restricted"
    });
    
    return repondre({
      text: `${EMOJI_THEME.admin} *Access Denied*\nStealth mentions require admin privileges`,
      ...context
    });
  }

  const message = arg?.join(' ') || 'Important silent notification';
  const members = metadata.participants;
  const hiddenMentions = Array(members.length).fill('‎').join('\n'); // Zero-width spaces

  const context = createContext(dest, {
    title: "Stealth Notification",
    body: `Silent alert in ${groupName}`
  });

  await zk.sendMessage(dest, {
    text: `🔇 *${BOT_NAME} Silent Alert*\n\n${message}\n${hiddenMentions}`,
    mentions: members.map(m => m.id),
    ...context
  }, { quoted: ms });
});

// Fixed senttoall command with proper names
adams({ nomCom: "senttoall", categorie: 'Group', reaction: "📨" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifAdmin, superUser } = commandeOptions;
  
  const { isGroup, metadata, groupName, senderName } = await verifyGroup(zk, dest, repondre, ms);
  if (!isGroup) return;

  if (!verifAdmin && !superUser) {
    const context = createContext(dest, {
      title: "Admin Privileges Required",
      body: "Broadcast command restricted"
    });
    
    return repondre({
      text: `${EMOJI_THEME.admin} *Access Denied*\nMass messaging requires admin privileges`,
      ...context
    });
  }

  if (!arg?.length) {
    const context = createContext(dest, {
      title: "Usage Instructions",
      body: "How to use senttoall"
    });
    
    return repondre({
      text: `${EMOJI_THEME.info} *Command Usage*\nExample: !senttoall Check your email for updates`,
      ...context
    });
  }

  const message = arg.join(' ');
  const members = metadata.participants;
  
  const progressMsg = await repondre({
    text: `${EMOJI_THEME.broadcast} *Mass DM Initiated*\nProcessing ${members.length} recipients...`,
    ...createContext(dest, {
      title: "Mass DM in Progress",
      body: "Sending individual messages"
    })
  });

  let success = 0;
  const failed = [];
  
  for (const member of members) {
    try {
      await zk.sendMessage(member.id, {
        text: `✉️ *Message from ${senderName} in ${groupName}*\n\nMessage: ${message}\n\n_${BOT_TAGLINE}_`,
        ...createContext(member.id, {
          title: `Message from ${groupName}`,
          body: senderName
        })
      });
      success++;
    } catch (error) {
      failed.push(member.id.split('@')[0]);
    }
  }

  const resultText = [
    `${EMOJI_THEME.success} *Broadcast Complete*`,
    `✅ Success: ${success}`,
    failed.length ? `❌ Failed: ${failed.length}\n${failed.slice(0, 5).join(', ')}${failed.length > 5 ? '...' : ''}` : ''
  ].filter(Boolean).join('\n');

  await zk.sendMessage(dest, {
    text: resultText,
    ...createContext(dest, {
      title: "Broadcast Results",
      body: `Delivered to ${success} members`
    })
  }, { quoted: ms });

  if (progressMsg?.key) {
    await zk.sendMessage(dest, { delete: progressMsg.key });
  }
});


/////////////!!////!/!////////!/!!/!!!!///!/!///////!!!!/!!!!!


adams({ nomCom: "promote", categorie: 'Group', reaction: "⬆️" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, msgRepondu, verifAdmin, superUser } = commandeOptions;
  
  // Verify group status using the improved function
  const { isGroup, metadata, groupName, senderName } = await verifyGroup(zk, dest, repondre, ms);
  if (!isGroup) return;

  if (!verifAdmin && !superUser) {
    const context = createContext(dest, {
      title: "Admin Privileges Required",
      body: "Promote command restricted"
    });
    return repondre({
      text: `${EMOJI_THEME.admin} *Access Denied*\nYou need admin rights to use this command`,
      ...context
    });
  }

  if (!msgRepondu) {
    const context = createContext(dest, {
      title: "Usage Instructions",
      body: "How to use promote"
    });
    return repondre({
      text: `${EMOJI_THEME.info} *Command Usage*\nReply to a user's message to promote them`,
      ...context
    });
  }

  const targetUser = msgRepondu.key.participant || msgRepondu.key.remoteJid;
  const targetUsername = msgRepondu.pushName || "User";

  try {
    // Check if bot is admin
    const botAdmin = metadata.participants.find(p => p.id === zk.user.id)?.admin;
    if (!botAdmin) {
      const context = createContext(dest, {
        title: "Bot Privileges Required",
        body: "Bot needs admin rights"
      });
      return repondre({
        text: `${EMOJI_THEME.error} *Bot Not Admin*\nI need admin rights to perform this action`,
        ...context
      });
    }

    // Check if user is already admin
    const isAlreadyAdmin = metadata.participants.find(p => p.id === targetUser)?.admin;
    if (isAlreadyAdmin) {
      const context = createContext(dest, {
        title: "Already Admin",
        body: "User is already admin"
      });
      return repondre({
        text: `${EMOJI_THEME.warning} @${targetUser.split('@')[0]} is already an admin`,
        mentions: [targetUser],
        ...context
      });
    }

    // Promote the user
    await zk.groupParticipantsUpdate(dest, [targetUser], "promote");
    
    const context = createContext(dest, {
      title: "Admin Promotion",
      body: `${targetUsername} promoted in ${groupName}`
    });
    
    await zk.sendMessage(dest, {
      text: `${EMOJI_THEME.success} *Admin Promotion*\n\n@${targetUser.split('@')[0]} has been promoted to admin by ${senderName}`,
      mentions: [targetUser],
      ...context
    }, { quoted: ms });

  } catch (error) {
    const context = createContext(dest, {
      title: "Promotion Failed",
      body: "Error promoting user"
    });
    repondre({
      text: `${EMOJI_THEME.error} *Promotion Failed*\n${error.message}`,
      ...context
    });
  }
});

adams({ nomCom: "demote", categorie: 'Group', reaction: "⬇️" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, msgRepondu, verifAdmin, superUser } = commandeOptions;
  
  // Verify group status using the improved function
  const { isGroup, metadata, groupName, senderName } = await verifyGroup(zk, dest, repondre, ms);
  if (!isGroup) return;

  if (!verifAdmin && !superUser) {
    const context = createContext(dest, {
      title: "Admin Privileges Required",
      body: "Demote command restricted"
    });
    return repondre({
      text: `${EMOJI_THEME.admin} *Access Denied*\nYou need admin rights to use this command`,
      ...context
    });
  }

  if (!msgRepondu) {
    const context = createContext(dest, {
      title: "Usage Instructions",
      body: "How to use demote"
    });
    return repondre({
      text: `${EMOJI_THEME.info} *Command Usage*\nReply to a user's message to demote them`,
      ...context
    });
  }

  const targetUser = msgRepondu.key.participant || msgRepondu.key.remoteJid;
  const targetUsername = msgRepondu.pushName || "User";

  try {
    // Check if bot is admin
    const botAdmin = metadata.participants.find(p => p.id === zk.user.id)?.admin;
    if (!botAdmin) {
      const context = createContext(dest, {
        title: "Bot Privileges Required",
        body: "Bot needs admin rights"
      });
      return repondre({
        text: `${EMOJI_THEME.error} *Bot Not Admin*\nI need admin rights to perform this action`,
        ...context
      });
    }

    // Check if user is actually admin
    const isAdmin = metadata.participants.find(p => p.id === targetUser)?.admin;
    if (!isAdmin) {
      const context = createContext(dest, {
        title: "Not an Admin",
        body: "User is not admin"
      });
      return repondre({
        text: `${EMOJI_THEME.warning} @${targetUser.split('@')[0]} is not an admin`,
        mentions: [targetUser],
        ...context
      });
    }

    // Demote the user
    await zk.groupParticipantsUpdate(dest, [targetUser], "demote");
    
    const context = createContext(dest, {
      title: "Admin Demotion",
      body: `${targetUsername} demoted in ${groupName}`
    });
    
    await zk.sendMessage(dest, {
      text: `${EMOJI_THEME.success} *Admin Demotion*\n\n@${targetUser.split('@')[0]} has been demoted by ${senderName}`,
      mentions: [targetUser],
      ...context
    }, { quoted: ms });

  } catch (error) {
    const context = createContext(dest, {
      title: "Demotion Failed",
      body: "Error demoting user"
    });
    repondre({
      text: `${EMOJI_THEME.error} *Demotion Failed*\n${error.message}`,
      ...context
    });
  }
});

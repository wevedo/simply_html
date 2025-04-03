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

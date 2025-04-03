const { adams } = require("../Ibrahim/adams");
const fs = require("fs-extra");
const conf = require("../config");
const { createContext } = require("../utils/helper");

// Helper function to decode JID and ensure string type
function decodeJid(jid) {
  const decoded = jid?.decodeJid?.() || jid;
  return typeof decoded === 'string' ? decoded : String(decoded);
}

// Constants
const BOT_NAME = "BWM_XMD";
const BOT_TAGLINE = "Next-Gen WhatsApp Automation";
const EMOJI_THEME = {
  success: "⚡",
  error: "💢",
  admin: "🛡️",
  broadcast: "📡"
};

// Safe string conversion
function ensureString(input) {
  if (typeof input === 'string') return input;
  if (input && typeof input.toString === 'function') return input.toString();
  return String(input);
}

// Group verification with proper string handling
async function verifyGroup(zk, dest, repondre, ms) {
  try {
    const metadata = await zk.groupMetadata(dest);
    const senderJid = ms.key.participant || ms.key.remoteJid;
    const senderName = ensureString(ms.pushName || "User");
    
    return {
      isGroup: true,
      metadata,
      groupName: ensureString(metadata.subject || "Unknown Group"),
      senderName
    };
  } catch (error) {
    repondre({
      text: `${EMOJI_THEME.error} *Command Restricted*\nThis feature only works in group chats`
    });
    return { isGroup: false };
  }
}

// Senttoall command with proper string handling
adams({ nomCom: "senttoall", categorie: 'Group', reaction: "📨" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, verifAdmin, superUser } = commandeOptions;
  
  const { isGroup, metadata, groupName, senderName } = await verifyGroup(zk, dest, repondre, ms);
  if (!isGroup) return;

  if (!verifAdmin && !superUser) {
    return repondre({
      text: `${EMOJI_THEME.admin} *Access Denied*\nMass messaging requires admin privileges`
    });
  }

  const message = Array.isArray(arg) ? arg.join(' ') : ensureString(arg || '');
  if (!message.trim()) {
    return repondre({
      text: `${EMOJI_THEME.info} *Command Usage*\nExample: !senttoall Check your email for updates`
    });
  }

  const members = metadata.participants;
  const progressMsg = await repondre({
    text: `${EMOJI_THEME.broadcast} *Mass DM Initiated*\nProcessing ${members.length} recipients...`
  });

  let success = 0;
  const failed = [];
  
  for (const member of members) {
    try {
      await zk.sendMessage(member.id, {
        text: `✉️ *Message from ${senderName} in ${groupName}*\n\n${message}\n\n_${BOT_TAGLINE}_`
      });
      success++;
    } catch (error) {
      failed.push(ensureString(member.id).split('@')[0]);
    }
  }

  const resultText = [
    `${EMOJI_THEME.success} *Broadcast Complete*`,
    `✅ Success: ${success}`,
    failed.length ? `❌ Failed: ${failed.length}\n${failed.slice(0, 5).join(', ')}${failed.length > 5 ? '...' : ''}` : ''
  ].filter(Boolean).join('\n');

  await zk.sendMessage(dest, { text: resultText }, { quoted: ms });

  if (progressMsg?.key) {
    await zk.sendMessage(dest, { delete: progressMsg.key });
  }
});

// Vcard command with robust string handling
adams({ nomCom: "vcard", categorie: 'Group', reaction: "📇" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre } = commandeOptions;
  
  const { isGroup, metadata } = await verifyGroup(zk, dest, repondre, ms);
  if (!isGroup) return;

  const baseName = "Cool General";
  const specialNumbers = {
    "254727716045": "Sir Ibrahim Adams",
    "254106727593": "Sir Ibrahim Adams", 
    "254710772666": "Sir Ibrahim Adams"
  };

  try {
    await repondre({ text: "⌛ Generating vCard file for all group members..." });

    const participants = metadata.participants;
    const groupSubject = ensureString(metadata.subject || "group").replace(/\s+/g, '_');
    const fileName = `${baseName}_${groupSubject}.vcf`;
    const vCardPath = `./${fileName}`;

    const fileStream = fs.createWriteStream(vCardPath);

    participants.forEach((participant) => {
      const phoneNumber = ensureString(participant.id).split('@')[0];
      const name = specialNumbers[phoneNumber] || `${baseName} Member`;
      
      fileStream.write(
        `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${phoneNumber}:+${phoneNumber}\nEND:VCARD\n\n`
      );
    });

    fileStream.end();

    await new Promise((resolve) => fileStream.on('finish', resolve));

    await zk.sendMessage(dest, {
      document: { url: vCardPath },
      mimetype: 'text/vcard',
      fileName: fileName,
      caption: `📇 *Group Contacts*\n\nTotal members: ${participants.length}\nGroup: ${ensureString(metadata.subject)}\n\n_${BOT_TAGLINE}_`
    }, { quoted: ms });

    fs.unlinkSync(vCardPath);
  } catch (error) {
    console.error("Vcard error:", error);
    repondre({ text: "❌ Failed to generate vCard file. Please try again later." });
  }
});

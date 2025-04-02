const { adams } = require("../Ibrahim/adams");

// Kick all members (owner only)
adams({ nomCom: "kickall", reaction: "🔥", nomFichier: __filename }, async (chatId, zk, { repondre, superUser, auteurMessage }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  try {
    const metadata = await zk.groupMetadata(chatId);
    const botJid = zk.user.id; // Get bot's JID
    const users = metadata.participants
      .filter(p => p.id !== auteurMessage && p.id !== botJid) // Exclude yourself and bot
      .map(p => p.id);
    
    if (users.length === 0) {
      return repondre("ℹ️ No members to kick (only you and the bot are in the group)");
    }
    
    await zk.groupParticipantsUpdate(chatId, users, "remove");
    repondre(`✅ Kicked ${users.length} members (you and the bot were not removed)`);
  } catch (error) {
    repondre(`❌ Failed to kick members: ${error.message}`);
  }
});

// Open group settings (owner only)
adams({ nomCom: "opengroup", reaction: "🔓", nomFichier: __filename }, async (chatId, zk, { repondre, superUser }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  try {
    await zk.groupSettingUpdate(chatId, "not_announcement");
    repondre("✅ Group is now open - all members can send messages");
  } catch (error) {
    repondre(`❌ Failed to open group: ${error.message}`);
  }
});

// Close group settings (owner only)
adams({ nomCom: "closegroup", reaction: "🔒", nomFichier: __filename }, async (chatId, zk, { repondre, superUser }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  try {
    await zk.groupSettingUpdate(chatId, "announcement");
    repondre("✅ Group is now closed - only admins can send messages");
  } catch (error) {
    repondre(`❌ Failed to close group: ${error.message}`);
  }
});

// Tag all members
adams({ nomCom: "tagall", reaction: "📢", nomFichier: __filename }, async (chatId, zk, { repondre, arg }) => { 
  try {
    const metadata = await zk.groupMetadata(chatId);
    const mentions = metadata.participants.map(p => p.id);
    const message = arg?.join(' ') || "@everyone";
    
    await zk.sendMessage(chatId, { 
      text: `📢 ${message}\n\n` + ' '.repeat(mentions.length),
      mentions 
    });
  } catch (error) {
    repondre(`❌ Failed to tag members: ${error.message}`);
  }
});

// Promote member (owner only)
adams({ nomCom: "promote", reaction: "⬆️", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  if (!arg || !arg[0]) {
    return repondre("ℹ️ Usage: .promote @user");
  }
  
  try {
    const user = arg[0].replace(/[@+]/g, "") + "@s.whatsapp.net";
    await zk.groupParticipantsUpdate(chatId, [user], "promote");
    repondre(`✅ @${user.split('@')[0]} has been promoted to admin`, { mentions: [user] });
  } catch (error) {
    repondre(`❌ Failed to promote user: ${error.message}`);
  }
});

// Demote member (owner only)
adams({ nomCom: "demote", reaction: "⬇️", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  if (!arg || !arg[0]) {
    return repondre("ℹ️ Usage: demote @user");
  }
  
  try {
    const user = arg[0].replace(/[@+]/g, "") + "@s.whatsapp.net";
    await zk.groupParticipantsUpdate(chatId, [user], "demote");
    repondre(`✅ @${user.split('@')[0]} has been demoted`, { mentions: [user] });
  } catch (error) {
    repondre(`❌ Failed to demote user: ${error.message}`);
  }
});

// Change group name (owner only)
adams({ nomCom: "groupn", reaction: "✏️", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  if (!arg || !arg[0]) {
    return repondre("ℹ️ Usage: !groupn New Group Name\nExample: !groupn BWM XMD Group");
  }
  
  try {
    const newName = arg.join(" ");
    await zk.groupUpdateSubject(chatId, newName);
    repondre(`✅ Group name changed to: ${newName}`);
  } catch (error) {
    repondre(`❌ Failed to change group name: ${error.message}`);
  }
});

// Change group description (owner only)
adams({ nomCom: "groupd", reaction: "📝", nomFichier: __filename }, async (chatId, zk, { repondre, arg, superUser }) => { 
  if (!superUser) {
    return repondre("❌ This command is reserved for the bot owner only");
  }
  
  if (!arg || !arg[0]) {
    return repondre("ℹ️ Usage: !groupd New Description\nExample: !groupd Official BWM XMD community group");
  }
  
  try {
    const newDesc = arg.join(" ");
    await zk.groupUpdateDescription(chatId, newDesc);
    repondre("✅ Group description has been updated");
  } catch (error) {
    repondre(`❌ Failed to update description: ${error.message}`);
  }
});

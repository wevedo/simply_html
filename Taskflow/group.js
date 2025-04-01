const { adams } = require("../Ibrahim/adams");

// Kick a specific member
adams( { nomCom: "kick", reaction: "👢", nomFichier: __filename }, async (chatId, adams, { ms, arg, repondre, superUser }) => { if (!superUser) return repondre("❌ You don't have permission!"); if (!ms.participant) return repondre("Mention a user to kick!"); await adams.groupParticipantsUpdate(chatId, [ms.participant], "remove"); repondre("✅ User removed!"); } );

// Kick all members
adams( { nomCom: "kickall", reaction: "🔥", nomFichier: __filename }, async (chatId, adams, { repondre, superUser }) => { if (!superUser) return repondre("❌ You don't have permission!"); const group = await adams.groupMetadata(chatId); const members = group.participants.map((p) => p.id); await adams.groupParticipantsUpdate(chatId, members, "remove"); repondre("✅ All members removed!"); } );

// Open group to everyone
adams( { nomCom: "opengroup", reaction: "🔓", nomFichier: __filename }, async (chatId, adams, { repondre, superUser }) => { if (!superUser) return repondre("❌ You don't have permission!"); await adams.groupSettingUpdate(chatId, "not_announcement"); repondre("✅ Group is now open to everyone!"); } );

// Close group to admins
only adams( { nomCom: "closegroup", reaction: "🔒", nomFichier: __filename }, async (chatId, adams, { repondre, superUser }) => { if (!superUser) return repondre("❌ You don't have permission!"); await adams.groupSettingUpdate(chatId, "announcement"); repondre("✅ Group is now admin-only!"); } );

// Tag all members
adams( { nomCom: "tagall", reaction: "📢", nomFichier: __filename }, async (chatId, adams, { repondre }) => { const group = await adams.groupMetadata(chatId); const members = group.participants.map((p) => @${p.id.split("@")[0]}).join(" "); await adams.sendMessage(chatId, { text: 📣 Tagging everyone: ${members}, mentions: group.participants.map((p) => p.id) }); } );

// Promote member to admin
adams( { nomCom: "promote", reaction: "⬆️", nomFichier: __filename }, async (chatId, adams, { ms, repondre, superUser }) => { if (!superUser) return repondre("❌ You don't have permission!"); if (!ms.participant) return repondre("Mention a user to promote!"); await adams.groupParticipantsUpdate(chatId, [ms.participant], "promote"); repondre("✅ User promoted to admin!"); } );

// Demote admin to member
adams( { nomCom: "demote", reaction: "⬇️", nomFichier: __filename }, async (chatId, adams, { ms, repondre, superUser }) => { if (!superUser) return repondre("❌ You don't have permission!"); if (!ms.participant) return repondre("Mention a user to demote!"); await adams.groupParticipantsUpdate(chatId, [ms.participant], "demote"); repondre("✅ User demoted to member!"); } );

// Change group profile picture
adams( { nomCom: "gpp", reaction: "🖼️", nomFichier: __filename }, async (chatId, adams, { ms, repondre, superUser }) => { if (!superUser) return repondre("❌ You don't have permission!"); if (!ms.imageMessage) return repondre("Send an image with the command!"); const buffer = await adams.downloadMediaMessage(ms.imageMessage); await adams.updateProfilePicture(chatId, buffer); repondre("✅ Group profile updated!"); } );

// Change group name 
adams( { nomCom: "groupname", reaction: "✏️", nomFichier: __filename }, async (chatId, adams, { arg, repondre, superUser }) => { if (!superUser) return repondre("❌ You don't have permission!"); if (!arg.length) return repondre("Enter a new group name!"); await adams.groupUpdateSubject(chatId, arg.join(" ")); repondre("✅ Group name changed!"); } );

// Change group description
adams( { nomCom: "groupd", reaction: "📝", nomFichier: __filename }, async (chatId, adams, { arg, repondre, superUser }) => { if (!superUser) return repondre("❌ You don't have permission!"); if (!arg.length) return repondre("Enter a new group description!"); await adams.groupUpdateDescription(chatId, arg.join(" ")); repondre("✅ Group description changed!"); } );

// Broadcast message to all groups
adams( { nomCom: "broadcast", reaction: "📢", nomFichier: __filename }, async (chatId, adams, { arg, repondre, superUser }) => { if (!superUser) return repondre("❌ You don't have permission!"); if (!arg.length) return repondre("Enter a message to broadcast!"); const message = arg.join(" "); const groups = await adams.groupFetchAllParticipating(); for (const group of Object.values(groups)) { await adams.sendMessage(group.id, { text: message }); } repondre("✅ Message broadcasted to all groups!"); } );


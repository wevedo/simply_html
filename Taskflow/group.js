const { adams } = require("../Ibrahim/adams");

adams({ nomCom: "kick", reaction: "👢", nomFichier: __filename }, async (chatId, zk, { ms, arg, repondre, superUser }) => { if (!ms.key.participant.includes("@g.us")) return repondre("This command can only be used in groups."); if (!ms.key.participant.includes(superUser)) return repondre("Only admins can use this command."); if (!arg[0]) return repondre("Tag the user to remove."); await zk.groupParticipantsUpdate(chatId, [arg[0] + "@s.whatsapp.net"], "remove"); repondre(Removed ${arg[0]}); });

adams({ nomCom: "kickall", reaction: "💥", nomFichier: __filename }, async (chatId, zk, { ms, repondre, superUser }) => { if (!ms.key.participant.includes("@g.us")) return repondre("This command can only be used in groups."); if (!ms.key.participant.includes(superUser)) return repondre("Only admins can use this command."); let participants = (await zk.groupMetadata(chatId)).participants.map(user => user.id); await zk.groupParticipantsUpdate(chatId, participants, "remove"); repondre("All members removed."); });

adams({ nomCom: "opengroup", reaction: "🔓", nomFichier: __filename }, async (chatId, zk, { repondre, superUser }) => { await zk.groupSettingUpdate(chatId, "not_announcement"); repondre("Group is now open for everyone."); });

adams({ nomCom: "closegroup", reaction: "🔒", nomFichier: __filename }, async (chatId, zk, { repondre, superUser }) => { await zk.groupSettingUpdate(chatId, "announcement"); repondre("Group is now restricted to admins only."); });

adams({ nomCom: "tagall", reaction: "📢", nomFichier: __filename }, async (chatId, zk, { repondre }) => { let members = (await zk.groupMetadata(chatId)).participants.map(user => @${user.id.split("@")[0]}).join(" "); repondre(members); });

adams({ nomCom: "gpp", reaction: "🖼", nomFichier: __filename }, async (chatId, zk, { ms, repondre }) => { if (!ms.message.imageMessage) return repondre("Send an image with this command to change group picture."); const imageBuffer = await zk.downloadMediaMessage(ms.message.imageMessage); await zk.updateProfilePicture(chatId, imageBuffer); repondre("Group picture updated."); });

adams({ nomCom: "groupname", reaction: "✏️", nomFichier: __filename }, async (chatId, zk, { arg, repondre }) => { if (!arg.length) return repondre("Provide a new group name."); await zk.groupUpdateSubject(chatId, arg.join(" ")); repondre("Group name updated."); });

adams({ nomCom: "groupd", reaction: "📜", nomFichier: __filename }, async (chatId, zk, { arg, repondre }) => { if (!arg.length) return repondre("Provide a new group description."); await zk.groupUpdateDescription(chatId, arg.join(" ")); repondre("Group description updated."); });

adams({ nomCom: "broadcast", reaction: "📡", nomFichier: __filename }, async (chatId, zk, { arg, repondre }) => { if (!arg.length) return repondre("Provide a message to broadcast."); let groups = (await zk.groupFetchAllParticipating()).map(group => group.id); for (let group of groups) { await zk.sendMessage(group, { text: arg.join(" ") }); } repondre("Broadcast sent to all groups."); });


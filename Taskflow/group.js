const { adams } = require("../Ibrahim/adams");

adams({ nomCom: "kick", reaction: "👢", nomFichier: __filename }, async (chatId, zk, { ms, arg, superUser }) => { if (!ms.key.participant.endsWith('@g.us')) return; if (!superUser && !(await zk.groupMetadata(chatId)).participants.find(p => p.id === ms.key.participant)?.admin) return; const user = arg[0]?.replace(/[@+]/g, "") + "@s.whatsapp.net"; if (!user) return zk.sendMessage(chatId, { text: "Tag someone to kick." }); await zk.groupParticipantsUpdate(chatId, [user], "remove"); });

adams({ nomCom: "kickall", reaction: "🔥", nomFichier: __filename }, async (chatId, zk, { superUser }) => { if (!superUser) return; const metadata = await zk.groupMetadata(chatId); const users = metadata.participants.map(p => p.id); await zk.groupParticipantsUpdate(chatId, users, "remove"); });

adams({ nomCom: "opengroup", reaction: "🔓", nomFichier: __filename }, async (chatId, zk, { superUser }) => { if (!superUser) return; await zk.groupSettingUpdate(chatId, "not_announcement"); });

adams({ nomCom: "closegroup", reaction: "🔒", nomFichier: __filename }, async (chatId, zk, { superUser }) => { if (!superUser) return; await zk.groupSettingUpdate(chatId, "announcement"); });

adams({ nomCom: "tagall", reaction: "📢", nomFichier: __filename }, async (chatId, zk) => { const metadata = await zk.groupMetadata(chatId); const mentions = metadata.participants.map(p => p.id); const message = "@everyone"; await zk.sendMessage(chatId, { text: message, mentions }); });

adams({ nomCom: "promote", reaction: "⬆️", nomFichier: __filename }, async (chatId, zk, { arg, superUser }) => { if (!superUser) return; const user = arg[0]?.replace(/[@+]/g, "") + "@s.whatsapp.net"; if (!user) return zk.sendMessage(chatId, { text: "Tag someone to promote." }); await zk.groupParticipantsUpdate(chatId, [user], "promote"); });

adams({ nomCom: "demote", reaction: "⬇️", nomFichier: __filename }, async (chatId, zk, { arg, superUser }) => { if (!superUser) return; const user = arg[0]?.replace(/[@+]/g, "") + "@s.whatsapp.net"; if (!user) return zk.sendMessage(chatId, { text: "Tag someone to demote." }); await zk.groupParticipantsUpdate(chatId, [user], "demote"); });

adams({ nomCom: "gpp", reaction: "🖼️", nomFichier: __filename }, async (chatId, zk, { ms, superUser }) => { if (!superUser || !ms.message.imageMessage) return; const buffer = await zk.downloadMediaMessage(ms.message.imageMessage); await zk.updateProfilePicture(chatId, buffer); });

adams({ nomCom: "groupname", reaction: "✏️", nomFichier: __filename }, async (chatId, zk, { arg, superUser }) => { if (!superUser) return; const newName = arg.join(" "); if (!newName) return zk.sendMessage(chatId, { text: "Provide a new group name." }); await zk.groupUpdateSubject(chatId, newName); });

adams({ nomCom: "groupd", reaction: "📝", nomFichier: __filename }, async (chatId, zk, { arg, superUser }) => { if (!superUser) return; const newDesc = arg.join(" "); if (!newDesc) return zk.sendMessage(chatId, { text: "Provide a new group description." }); await zk.groupUpdateDescription(chatId, newDesc); });

adams({ nomCom: "broadcast", reaction: "📡", nomFichier: __filename }, async (chatId, zk, { arg, superUser }) => { if (!superUser) return; const message = arg.join(" "); if (!message) return zk.sendMessage(chatId, { text: "Provide a message to broadcast." }); const groups = (await zk.groupFetchAllParticipating()).map(g => g.id); for (const group of groups) { await zk.sendMessage(group, { text: message }); } });


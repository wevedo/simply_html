const { adams } = require("../Ibrahim/adams");
const { PREFIX } = require(__dirname + "/../config");

adams(
  { nomCom: "cartmenu", categorie: "General" },
  async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;

    // Define command menu sections
    const sections = [
      {
        title: "📁 COMMAND CATEGORIES",
        rows: [
          {
            title: "DOWNLOADER TOOLS",
            description: "Media download commands",
            rowId: "cartmenu_downloader"
          },
          {
            title: "GROUP TOOLS",
            description: "Group management commands",
            rowId: "cartmenu_group"
          },
          {
            title: "AI COMMANDS",
            description: "Artificial intelligence features",
            rowId: "cartmenu_ai"
          }
        ]
      }
    ];

    // Send WhatsApp list message
    await zk.sendMessage(dest, {
      text: `BWM-XMD COMMAND MENU (${PREFIX})`,
      footer: "Select a category to view commands",
      title: "COMMAND STORE",
      buttonText: "View Categories",
      sections
    }, { quoted: ms });
  }
);

// Handle selection from menu (using your own zk.ev)
zk.ev.on("messages.upsert", async (update) => {
  const msg = update.messages[0];
  if (!msg.message || !msg.message.listResponseMessage) return;

  const rowId = msg.message.listResponseMessage.singleSelectReply.selectedRowId;
  const from = msg.key.remoteJid;

  let reply = "";

  switch (rowId) {
    case "cartmenu_downloader":
      reply = `╭─❖ DOWNLOADER ❖─╮
┃✰ ${PREFIX}ytmp3
┃✰ ${PREFIX}ytmp4
┃✰ ${PREFIX}tiktok
┃✰ ${PREFIX}facebook
╰──────────────╯`;
      break;

    case "cartmenu_group":
      reply = `╭─❖ GROUP ❖─╮
┃✰ ${PREFIX}add
┃✰ ${PREFIX}kick
┃✰ ${PREFIX}promote
┃✰ ${PREFIX}demote
╰────────────╯`;
      break;

    case "cartmenu_ai":
      reply = `╭─❖ AI ❖─╮
┃✰ ${PREFIX}gpt
┃✰ ${PREFIX}dalle
┃✰ ${PREFIX}gemini
┃✰ ${PREFIX}remini
╰──────────╯`;
      break;
  }

  if (reply) {
    await zk.sendMessage(from, { text: reply }, { quoted: msg });
  }
});

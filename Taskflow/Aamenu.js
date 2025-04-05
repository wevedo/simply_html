const { adams } = require("../Ibrahim/adams");
const { proto } = require("@whiskeysockets/baileys");

adams({ nomCom: "menutest", categorie: "General" }, async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;

    // Create a list message
    const sections = [
        {
            title: "MAIN MENU",
            rows: [
                {
                    title: "📜 ALL COMMANDS",
                    description: "Show all available commands",
                    rowId: "all_commands"
                },
                {
                    title: "⬇️ DOWNLOADER",
                    description: "Media download commands",
                    rowId: "downloader"
                },
                {
                    title: "👥 GROUP",
                    description: "Group management commands",
                    rowId: "group"
                }
            ]
        }
    ];

    const listMessage = {
        text: "BWM-XMD TEST MENU\nPlease select an option:",
        footer: "Testing menu buttons",
        title: "MAIN MENU",
        buttonText: "View Categories",
        sections
    };

    // Send the list message
    await zk.sendMessage(dest, listMessage);

    // Handle list selection
    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];
        if (!message.message.listResponseMessage) return;

        const selectedId = message.message.listResponseMessage.singleSelectReply.selectedRowId;
        let replyText = "";
        
        switch(selectedId) {
            case "all_commands":
                replyText = "You selected: All Commands";
                break;
            case "downloader":
                replyText = "You selected: Downloader";
                break;
            case "group":
                replyText = "You selected: Group";
                break;
        }

        if (replyText) {
            await zk.sendMessage(dest, { text: replyText }, { quoted: message });
        }
    });
});

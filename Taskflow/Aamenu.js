const { adams } = require("../Ibrahim/adams");
const { proto } = require("@whiskeysockets/baileys");

adams({ nomCom: "cartmenu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    const { ms, prefixe } = commandeOptions;

    // Create catalog-like sections
    const sections = [
        {
            title: "📁 COMMAND CATEGORIES",
            productRows: [
                {
                    title: "DOWNLOADER TOOLS",
                    description: "Media download commands",
                    productId: "downloader_cat"
                },
                {
                    title: "GROUP TOOLS",
                    description: "Group management commands",
                    productId: "group_cat"
                },
                {
                    title: "AI COMMANDS",
                    description: "Artificial intelligence features",
                    productId: "ai_cat"
                }
            ]
        }
    ];

    // Create the interactive catalog message
    const catalogMessage = {
        text: `BWM-XMD COMMAND MENU (${prefixe})`,
        footer: "Select a category to view commands",
        title: "COMMAND STORE",
        buttonText: "View Categories",
        productSections: sections,
        productListInfo: {
            productSections: sections,
            headerImage: { 
                productId: "header_img",
                jpegThumbnail: Buffer.from("IMAGE_BUFFER_HERE") // Optional
            }
        }
    };

    // Send the catalog-style message
    await zk.sendMessage(dest, catalogMessage);

    // Handle category selection
    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];
        if (!message.message.productMessage) return;

        const selectedId = message.message.productMessage.product.productId;
        let commands = "";

        switch(selectedId) {
            case "downloader_cat":
                commands = `╭─❖ DOWNLOADER ❖─╮
┃✰ ${prefixe}ytmp3
┃✰ ${prefixe}ytmp4
┃✰ ${prefixe}tiktok
┃✰ ${prefixe}facebook
╰──────────────╯`;
                break;
                
            case "group_cat":
                commands = `╭─❖ GROUP ❖─╮
┃✰ ${prefixe}add
┃✰ ${prefixe}kick
┃✰ ${prefixe}promote
┃✰ ${prefixe}demote
╰────────────╯`;
                break;
                
            case "ai_cat":
                commands = `╭─❖ AI ❖─╮
┃✰ ${prefixe}gpt
┃✰ ${prefixe}dalle
┃✰ ${prefixe}gemini
┃✰ ${prefixe}remini
╰──────────╯`;
                break;
        }

        if (commands) {
            await zk.sendMessage(dest, { 
                text: commands,
                footer: "BWM-XMD Command List" 
            }, { quoted: message });
        }
    });
});

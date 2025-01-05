const { adams } = require("../Ibrahim/adams");
var mumaker = require("mumaker");

const logoOptions = [
    { nomCom: "hacker", url: "https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html", categorie: "Logo", reaction: "👨🏿‍💻" },
    { nomCom: "gaming", url: "https://en.ephoto360.com/create-gaming-logo-online-710.html", categorie: "Gaming", reaction: "🎮" },
    { nomCom: "business", url: "https://en.ephoto360.com/create-professional-business-logo-720.html", categorie: "Business", reaction: "📊" },
    { nomCom: "fire", url: "https://en.ephoto360.com/create-fire-logo-online-632.html", categorie: "Logo", reaction: "🔥" },
    { nomCom: "neon", url: "https://en.ephoto360.com/create-neon-light-logo-online-637.html", categorie: "Logo", reaction: "💡" },
    { nomCom: "dragon", url: "https://en.ephoto360.com/create-dragon-logo-634.html", categorie: "Logo", reaction: "🐉" },
    { nomCom: "wolf", url: "https://en.ephoto360.com/create-wolf-logo-online-631.html", categorie: "Logo", reaction: "🐺" },
    { nomCom: "gold", url: "https://en.ephoto360.com/create-gold-logo-online-629.html", categorie: "Logo", reaction: "🥇" },
    { nomCom: "joker", url: "https://en.ephoto360.com/create-joker-logo-online-630.html", categorie: "Logo", reaction: "🃏" },
    { nomCom: "glitch", url: "https://en.ephoto360.com/create-glitch-logo-online-668.html", categorie: "Logo", reaction: "💥" },
    { nomCom: "3d", url: "https://en.ephoto360.com/create-3d-logo-online-625.html", categorie: "Logo", reaction: "🌀" },
    { nomCom: "galaxy", url: "https://en.ephoto360.com/create-galaxy-logo-online-676.html", categorie: "Logo", reaction: "🌌" },
    { nomCom: "matrix", url: "https://en.ephoto360.com/create-matrix-logo-online-650.html", categorie: "Logo", reaction: "🟩" },
    { nomCom: "ninja", url: "https://en.ephoto360.com/create-ninja-logo-online-642.html", categorie: "Logo", reaction: "🥷" },
    { nomCom: "dark", url: "https://en.ephoto360.com/create-dark-logo-online-655.html", categorie: "Logo", reaction: "🌑" },
    { nomCom: "crown", url: "https://en.ephoto360.com/create-crown-logo-online-722.html", categorie: "Logo", reaction: "👑" },
    { nomCom: "cyberpunk", url: "https://en.ephoto360.com/create-cyberpunk-logo-online-726.html", categorie: "Logo", reaction: "🤖" },
    { nomCom: "vintage", url: "https://en.ephoto360.com/create-vintage-logo-online-675.html", categorie: "Logo", reaction: "🕰️" },
    { nomCom: "diamond", url: "https://en.ephoto360.com/create-diamond-logo-online-627.html", categorie: "Logo", reaction: "💎" },
    { nomCom: "king", url: "https://en.ephoto360.com/create-king-logo-online-721.html", categorie: "Logo", reaction: "🤴" },
    { nomCom: "queen", url: "https://en.ephoto360.com/create-queen-logo-online-723.html", categorie: "Logo", reaction: "👸" },
    { nomCom: "sci-fi", url: "https://en.ephoto360.com/create-science-fiction-logo-online-732.html", categorie: "Logo", reaction: "🚀" },
    { nomCom: "abstract", url: "https://en.ephoto360.com/create-abstract-logo-online-728.html", categorie: "Logo", reaction: "🎨" },
    { nomCom: "shadow", url: "https://en.ephoto360.com/create-shadow-logo-online-724.html", categorie: "Logo", reaction: "🌑" },
    { nomCom: "water", url: "https://en.ephoto360.com/create-water-logo-online-626.html", categorie: "Logo", reaction: "💧" },
    { nomCom: "robot", url: "https://en.ephoto360.com/create-robot-logo-online-667.html", categorie: "Logo", reaction: "🤖" },
    { nomCom: "luxury", url: "https://en.ephoto360.com/create-luxury-logo-online-648.html", categorie: "Logo", reaction: "✨" },
    { nomCom: "space", url: "https://en.ephoto360.com/create-space-logo-online-647.html", categorie: "Logo", reaction: "🚀" },
    { nomCom: "heart", url: "https://en.ephoto360.com/create-heart-logo-online-666.html", categorie: "Logo", reaction: "❤️" },
    { nomCom: "tech", url: "https://en.ephoto360.com/create-tech-logo-online-645.html", categorie: "Logo", reaction: "💻" },
    { nomCom: "flower", url: "https://en.ephoto360.com/create-flower-logo-online-663.html", categorie: "Logo", reaction: "🌸" },
];

logoOptions.forEach(({ nomCom, url, categorie, reaction }) => {
    adams(
        {
            nomCom,
            categorie,
            reaction,
        },
        async (origineMessage, zk, commandeOptions) => {
            const { prefixe, arg, ms, repondre } = commandeOptions;

            if (!arg || arg === "") {
                repondre(`*__Exemple : * ${prefixe}${nomCom} Ibrahim`);
                return;
            }

            try {
                let anu = await mumaker.ephoto(url, arg);
                repondre("*Processing...*");
                await zk.sendMessage(
                    origineMessage,
                    {
                        image: { url: anu.image },
                        caption: `*Logo by BWM XMD*`,
                    },
                    { quoted: ms }
                );
            } catch (e) {
                repondre(`🥵🥵 Error: ${e.message}`);
            }
        }
    );
});

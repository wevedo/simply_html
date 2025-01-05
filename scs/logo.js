const { adams } = require("../Ibrahim/adams");
var mumaker = require("mumaker");

// List of 20 verified logo commands
const logoOptions = [
    { nomCom: "hacker", url: "https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html", categorie: "Logo", reaction: "👨🏿‍💻" },
    { nomCom: "dragonball", url: "https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html", categorie: "Logo", reaction: "🐉" },
    { nomCom: "naruto", url: "https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html", categorie: "Logo", reaction: "⛩" },
    { nomCom: "fire", url: "https://en.ephoto360.com/create-fire-logo-online-632.html", categorie: "Logo", reaction: "🔥" },
    { nomCom: "neon", url: "https://en.ephoto360.com/create-neon-light-logo-online-637.html", categorie: "Logo", reaction: "💡" },
    { nomCom: "joker", url: "https://en.ephoto360.com/create-joker-logo-online-630.html", categorie: "Logo", reaction: "🃏" },
    { nomCom: "matrix", url: "https://en.ephoto360.com/create-matrix-logo-online-650.html", categorie: "Logo", reaction: "🟩" },
    { nomCom: "cyberpunk", url: "https://en.ephoto360.com/create-cyberpunk-logo-online-726.html", categorie: "Logo", reaction: "🤖" },
    { nomCom: "space", url: "https://en.ephoto360.com/create-space-logo-online-647.html", categorie: "Logo", reaction: "🚀" },
    { nomCom: "luxury", url: "https://en.ephoto360.com/create-luxury-logo-online-648.html", categorie: "Logo", reaction: "✨" },
    { nomCom: "3d", url: "https://en.ephoto360.com/create-3d-logo-online-625.html", categorie: "Logo", reaction: "🌀" },
    { nomCom: "galaxy", url: "https://en.ephoto360.com/create-galaxy-logo-online-676.html", categorie: "Logo", reaction: "🌌" },
    { nomCom: "ninja", url: "https://en.ephoto360.com/create-ninja-logo-online-642.html", categorie: "Logo", reaction: "🥷" },
    { nomCom: "crown", url: "https://en.ephoto360.com/create-crown-logo-online-722.html", categorie: "Logo", reaction: "👑" },
    { nomCom: "shadow", url: "https://en.ephoto360.com/create-shadow-logo-online-724.html", categorie: "Logo", reaction: "🌑" },
    { nomCom: "gold", url: "https://en.ephoto360.com/create-gold-logo-online-629.html", categorie: "Logo", reaction: "🥇" },
    { nomCom: "wolf", url: "https://en.ephoto360.com/create-wolf-logo-online-631.html", categorie: "Logo", reaction: "🐺" },
    { nomCom: "superhero", url: "https://en.ephoto360.com/create-superhero-logo-online-654.html", categorie: "Logo", reaction: "🦸‍♂️" },
    { nomCom: "anime", url: "https://en.ephoto360.com/create-anime-logo-online-723.html", categorie: "Logo", reaction: "🎨" },
    { nomCom: "flower", url: "https://en.ephoto360.com/create-flower-logo-online-626.html", categorie: "Logo", reaction: "🌸" },
];

// Register commands dynamically
logoOptions.forEach(({ nomCom, url, categorie, reaction }) => {
    adams(
        { nomCom, categorie, reaction },
        async (dest, zk, commandeOptions) => {
            const { arg, repondre, prefixe, ms } = commandeOptions;

            // Validate input
            if (!arg || arg.length === 0) {
                repondre(`*_EXEMPLE *: ${prefixe}${nomCom} YourTextHere`);
                return;
            }

            try {
                // Notify user
                repondre("* processing...*");

                // Generate logo
                const imgInfo = await mumaker.ephoto(url, arg.join(" "));

                // Check for valid response
                if (imgInfo && imgInfo.image) {
                    await zk.sendMessage(
                        dest,
                        { image: { url: imgInfo.image }, caption: "* \t Logo by Bmw-Md*" },
                        { quoted: ms }
                    );
                } else {
                    repondre("🥵🥵 Error: Unable to generate logo. Please try again.");
                }
            } catch (e) {
                repondre(`🥵🥵 ${e.message}`);
            }
        }
    );
});

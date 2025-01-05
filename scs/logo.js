const { adams } = require("../Ibrahim/adams");
var mumaker = require("mumaker");

// List of logo commands
const logoOptions = [
    { nomCom: "dragonball", url: "https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html", categorie: "Logo", reaction: "🐉" },
    { nomCom: "hacker", url: "https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html", categorie: "Logo", reaction: "👨🏿‍💻" },
    { nomCom: "fire", url: "https://en.ephoto360.com/create-fire-logo-online-632.html", categorie: "Logo", reaction: "🔥" },
    { nomCom: "gaming", url: "https://en.ephoto360.com/create-gaming-logo-online-710.html", categorie: "Gaming", reaction: "🎮" },
    { nomCom: "neon", url: "https://en.ephoto360.com/create-neon-light-logo-online-637.html", categorie: "Logo", reaction: "💡" },
    { nomCom: "joker", url: "https://en.ephoto360.com/create-joker-logo-online-630.html", categorie: "Logo", reaction: "🃏" },
    { nomCom: "matrix", url: "https://en.ephoto360.com/create-matrix-logo-online-650.html", categorie: "Logo", reaction: "🟩" },
    { nomCom: "dark", url: "https://en.ephoto360.com/create-dark-logo-online-655.html", categorie: "Logo", reaction: "🌑" },
    { nomCom: "cyberpunk", url: "https://en.ephoto360.com/create-cyberpunk-logo-online-726.html", categorie: "Logo", reaction: "🤖" },
    { nomCom: "space", url: "https://en.ephoto360.com/create-space-logo-online-647.html", categorie: "Logo", reaction: "🚀" },
    { nomCom: "luxury", url: "https://en.ephoto360.com/create-luxury-logo-online-648.html", categorie: "Logo", reaction: "✨" },
    { nomCom: "3d", url: "https://en.ephoto360.com/create-3d-logo-online-625.html", categorie: "Logo", reaction: "🌀" },
    { nomCom: "galaxy", url: "https://en.ephoto360.com/create-galaxy-logo-online-676.html", categorie: "Logo", reaction: "🌌" },
    { nomCom: "ninja", url: "https://en.ephoto360.com/create-ninja-logo-online-642.html", categorie: "Logo", reaction: "🥷" },
    { nomCom: "crown", url: "https://en.ephoto360.com/create-crown-logo-online-722.html", categorie: "Logo", reaction: "👑" },
    { nomCom: "shadow", url: "https://en.ephoto360.com/create-shadow-logo-online-724.html", categorie: "Logo", reaction: "🌑" },
    { nomCom: "robot", url: "https://en.ephoto360.com/create-robot-logo-online-667.html", categorie: "Logo", reaction: "🤖" },
    { nomCom: "vintage", url: "https://en.ephoto360.com/create-vintage-logo-online-675.html", categorie: "Logo", reaction: "🕰️" },
    { nomCom: "gold", url: "https://en.ephoto360.com/create-gold-logo-online-629.html", categorie: "Logo", reaction: "🥇" },
    { nomCom: "wolf", url: "https://en.ephoto360.com/create-wolf-logo-online-631.html", categorie: "Logo", reaction: "🐺" },
];

// Register all logo commands
logoOptions.forEach(({ nomCom, url, categorie, reaction }) => {
    adams(
        {
            nomCom,
            categorie,
            reaction,
        },
        async (dest, zk, commandeOptions) => {
            const { arg, repondre, prefixe, ms } = commandeOptions;

            try {
                const noArgMsg = `*_EXEMPLE *:  ${prefixe}${nomCom} Ibrahim adams`;

                // Check if argument is missing
                if (!arg || arg.trim() === "") {
                    repondre(noArgMsg);
                    return;
                }

                // Log input parameters
                console.log(`Requesting logo for: ${nomCom}, URL: ${url}, Argument: ${arg.trim()}`);

                // Fetch the logo
                const imgInfo = await mumaker.ephoto(url, arg.trim());

                // Log response for debugging
                console.log("Response from mumaker.ephoto:", imgInfo);

                if (imgInfo && imgInfo.image) {
                    await zk.sendMessage(dest, { text: " *Traitement en cours ...*" }, { quoted: ms });

                    // Send generated image
                    await zk.sendMessage(
                        dest,
                        { image: { url: imgInfo.image }, caption: "*\t Logo by Bmw-Md*" },
                        { quoted: ms }
                    );
                } else {
                    // Handle invalid response
                    repondre("🥵🥵 Error: Unable to generate logo. Please check the input or template URL.");
                }
            } catch (e) {
                // Log and handle errors
                console.error(`Error generating logo for ${nomCom}:`, e);
                repondre(`🥵🥵 Error: ${e.message}`);
            }
        }
    );
});

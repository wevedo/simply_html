const { adams } = require("../Ibrahim/adams");
var mumaker = require("mumaker");

const logoCommands = [
  {
    nomCom: "hacker",
    categorie: "Logo",
    reaction: "👨🏿‍💻",
    makerUrl: "https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html"
  },
  {
    nomCom: "dragonball",
    categorie: "Logo",
    reaction: "🐉",
    makerUrl: "https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html"
  },
  {
    nomCom: "naruto",
    categorie: "Logo",
    reaction: "⛩",
    makerUrl: "https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html"
  },
  {
    nomCom: "boom",
    categorie: "Logo",
    reaction: "💥",
    makerUrl: "https://en.ephoto360.com/boom-text-comic-style-text-effect-675.html"
  },
  {
    nomCom: "water",
    categorie: "Logo",
    reaction: "💦",
    makerUrl: "https://en.ephoto360.com/create-water-effect-text-online-295.html"
  },
  {
    nomCom: "whitegold",
    categorie: "Logo",
    reaction: "💫",
    makerUrl: "https://textpro.me/elegant-white-gold-3d-text-effect-online-free-1070.html"
  }
];

// Process each logo command
logoCommands.forEach(({ nomCom, categorie, reaction, makerUrl }) => {
  adams({ nomCom, categorie, reaction }, async (dest, zk, commandeOptions) => {
    const { arg, repondre, ms, prefixe } = commandeOptions;

    if (!arg || arg == "") {
      repondre(`Exemple of using commande:\n ${prefixe}${nomCom} My text`);
      return;
    }

    try {
      repondre("Processing...");
      const img = await mumaker.textpro(makerUrl, arg.join(" "));
      await zk.sendMessage(dest, { image: { url: img.image }, caption: `Logo by BMW-MD` }, { quoted: ms });
    } catch (e) {
      repondre(`🥵🥵 ${e}`);
    }
  });
});

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
    nomCom: "marvel",
    categorie: "Logo",
    reaction: "📱",
    makerUrl: "https://ephoto360.com/tao-logo-phong-cach-marvel-419.html"
  },
  {
    nomCom: "wall",
    categorie: "Logo",
    reaction: "👍",
    makerUrl: "https://textpro.me/break-wall-text-effect-871.html"
  },
  {
    nomCom: "summer",
    categorie: "Logo",
    reaction: "🌞",
    makerUrl: "https://textpro.me/create-sunset-light-text-effects-online-for-free-1124.html"
  },
  {
    nomCom: "neonlight",
    categorie: "Logo",
    reaction: "💡",
    makerUrl: "https://textpro.me/create-glowing-neon-light-text-effect-online-free-1061.html"
  },
  {
    nomCom: "greenneon",
    categorie: "Logo",
    reaction: "🟢",
    makerUrl: "https://textpro.me/green-neon-text-effect-874.html"
  },
  {
    nomCom: "glitch",
    categorie: "Logo",
    reaction: "🎛️",
    makerUrl: "https://textpro.me/create-impressive-glitch-text-effects-online-1027.html"
  },
  {
    nomCom: "spiderman",
    categorie: "Logo",
    reaction: "😈",
    makerUrl: "https://ephoto360.com/tao-banner-phong-cach-spider-man-465.html"
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
    nomCom: "galaxy",
    categorie: "Logo",
    reaction: "❄️",
    makerUrl: "https://ephoto360.com/tao-hinh-nen-dien-thoai-galaxy-theo-ten-dep-full-hd-684.html"
  },
  {
    nomCom: "transformer",
    categorie: "Logo",
    reaction: "🤖",
    makerUrl: "https://textpro.me/create-a-transformer-text-effect-online-1035.html"
  },
  {
    nomCom: "thunder",
    categorie: "Logo",
    reaction: "⚡",
    makerUrl: "https://textpro.me/online-thunder-text-effect-generator-1031.html"
  },
  {
    nomCom: "harrypotter",
    categorie: "Logo",
    reaction: "🧙‍♂️",
    makerUrl: "https://textpro.me/create-harry-potter-text-effect-online-1025.html"
  },
  {
    nomCom: "cat",
    categorie: "Logo",
    reaction: "🪟",
    makerUrl: "https://textpro.me/write-text-on-foggy-window-online-free-1015.html"
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

const fs = require("fs");
const path = require("path");
const { adams } = require("../Ibrahim/adams");

const configPath = path.join(__dirname, "../Session/store.json");

// Function to load and save settings
const loadConfig = () => JSON.parse(fs.readFileSync(configPath, "utf8"));
const saveConfig = (config) => fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

// Command: Toggle Auto Bio
adams(
  { nomCom: "autobio", reaction: "ℹ️", nomFichier: __filename },
  async (dest, zk, { arg, repondre }) => {
    if (!arg[0] || (arg[0] !== "on" && arg[0] !== "off")) {
      return repondre("⚠️ Use: /autobio on or /autobio off");
    }

    let config = loadConfig();
    config.AUTO_BIO = arg[0];
    saveConfig(config);

    repondre(`✅ Auto Bio has been turned *${arg[0]}*`);
  }
);

// Command: Toggle Anti-Call
adams(
  { nomCom: "anticall", reaction: "📵", nomFichier: __filename },
  async (dest, zk, { arg, repondre }) => {
    if (!arg[0] || (arg[0] !== "on" && arg[0] !== "off")) {
      return repondre("⚠️ Use: /anticall on or /anticall off");
    }

    let config = loadConfig();
    config.ANTICALL = arg[0];
    saveConfig(config);

    repondre(`✅ Anti-Call has been turned *${arg[0]}*`);
  }
);

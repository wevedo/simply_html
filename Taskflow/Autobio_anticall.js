const { adams } = require("../Ibrahim/adams");
const systemManager = require("../bwmxmd/Autobio_anticall");

adams(
  { nomCom: "autobio", reaction: "ℹ️", nomFichier: __filename },
  async (dest, zk, { arg, repondre }) => {
    if (!arg[0] || (arg[0] !== "on" && arg[0] !== "off")) {
      return repondre("⚠️ Use: /autobio on or /autobio off");
    }

    systemManager.updateSetting("AUTO_BIO", arg[0]);
    repondre(`✅ Auto Bio has been turned *${arg[0]}*`);
  }
);

adams(
  { nomCom: "anticall", reaction: "📵", nomFichier: __filename },
  async (dest, zk, { arg, repondre }) => {
    if (!arg[0] || (arg[0] !== "on" && arg[0] !== "off")) {
      return repondre("⚠️ Use: /anticall on or /anticall off");
    }

    systemManager.updateSetting("ANTICALL", arg[0]);
    repondre(`✅ Anti-Call has been turned *${arg[0]}*`);
  }
);

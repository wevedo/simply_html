const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../Session/store.json");
const { adams } = require("../Ibrahim/adams");

// Load configuration from JSON file
const loadConfig = () => {
    try {
        return JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (err) {
        console.error("❌ Error loading config:", err.message);
        return { AUTO_BIO: "no", ANTICALL: "no" }; // Default settings
    }
};

// Save configuration to JSON file
const saveConfig = (newConfig) => {
    try {
        fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), "utf8");
        console.log("✅ Config updated:", newConfig);
    } catch (err) {
        console.error("❌ Error saving config:", err.message);
    }
};

// Auto Bio Toggle Command
adams(
    { nomCom: "autobio", reaction: "🔄", nomFichier: __filename },
    async (dest, zk, { ms, arg, repondre }) => {
        const config = loadConfig();
        if (!arg[0] || !["on", "off"].includes(arg[0].toLowerCase())) {
            return repondre("⚙️ Usage: *autobio on* | *autobio off*");
        }

        config.AUTO_BIO = arg[0].toLowerCase();
        saveConfig(config);
        repondre(`✅ Auto Bio is now *${config.AUTO_BIO.toUpperCase()}*`);
    }
);

// Anti-Call Toggle Command
adams(
    { nomCom: "anticall", reaction: "📵", nomFichier: __filename },
    async (dest, zk, { ms, arg, repondre }) => {
        const config = loadConfig();
        if (!arg[0] || !["on", "off"].includes(arg[0].toLowerCase())) {
            return repondre("⚙️ Usage: *anticall on* | *anticall off*");
        }

        config.ANTICALL = arg[0].toLowerCase();
        saveConfig(config);
        repondre(`✅ Anti-Call is now *${config.ANTICALL.toUpperCase()}*`);
    }
);

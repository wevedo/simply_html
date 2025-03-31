const fs = require("fs");
const path = require("path");

const settingsFile = path.join(__dirname, "../Session/store.json");
                               
                               

// Function to load settings
const loadSettings = () => {
    if (fs.existsSync(settingsFile)) {
        return JSON.parse(fs.readFileSync(settingsFile, "utf8"));
    } else {
        const defaultSettings = { AUTO_BIO: "off", ANTICALL: "off" };
        fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 2));
        return defaultSettings;
    }
};

// Function to save settings
const saveSettings = (key, value) => {
    let settings = loadSettings();
    settings[key] = value;
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
};

// Main system setup
module.exports = {
    setup: async (adams, { logger }) => {
        console.log("⚙️ Initializing Auto Bio & Anti-Call systems...");

        let settings = loadSettings();
        let bioInterval = null;
        let activeCallHandler = null;

        const startBioUpdates = () => {
            if (settings.AUTO_BIO !== "on") return;

            const updateBio = async () => {
                try {
                    await adams.updateProfileStatus(`👋 BWM XMD Online 🚀\n📅 ${new Date().toLocaleString()}`);
                    logger.info("✅ Bio updated successfully");
                } catch (err) {
                    logger.error("❌ Bio update failed:", err.message);
                }
            };

            updateBio();
            bioInterval = setInterval(updateBio, 60000);
        };

        const startCallBlocking = () => {
            if (settings.ANTICALL !== "on") return;

            const callHandler = async (callData) => {
                try {
                    const { id, from } = callData[0];
                    await adams.rejectCall(id, from);
                    logger.info(`🚫 Blocked call from: ${from}`);
                } catch (err) {
                    logger.error("❌ Call blocking failed:", err.message);
                }
            };

            adams.ev.on("call", callHandler);
            activeCallHandler = callHandler;
        };

        startBioUpdates();
        startCallBlocking();

        console.log("✅ Auto Bio & Anti-Call systems operational");

        return () => {
            if (bioInterval) clearInterval(bioInterval);
            if (activeCallHandler) adams.ev.off("call", activeCallHandler);
            logger.info("⚙️ Systems terminated");
        };
    },

    updateSetting: saveSettings, // Function to update settings
    getSettings: loadSettings // Function to retrieve current settings
};

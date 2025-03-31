const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../config.json");

// Load existing settings or create default
const loadConfig = () => {
    try {
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, "utf8"));
        }
    } catch (err) {
        console.error("❌ Error loading config:", err.message);
    }
    return { AUTO_BIO: "off", ANTICALL: "off" };
};

// Save updated settings
const saveConfig = (config) => {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
    } catch (err) {
        console.error("❌ Error saving config:", err.message);
    }
};

// Store cleanup handlers
let bioInterval = null;
let activeCallHandler = null;

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) return;

        console.log("⚙️ Initializing Auto Bio & Anti-Call systems...");

        // Load settings
        const settings = loadConfig();

        // Auto Bio System
        const startBioUpdates = () => {
            if (settings.AUTO_BIO !== "on") return;

            const getCurrentDateTime = () => new Intl.DateTimeFormat("en-KE", {
                timeZone: "Africa/Nairobi",
                year: "numeric",
                month: "long",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            }).format(new Date());

            const updateBio = async () => {
                try {
                    await adams.updateProfileStatus(`👋 BWM XMD Online 🚀\n📅 ${getCurrentDateTime()}`);
                    logger.info("✅ Bio updated successfully");
                } catch (err) {
                    logger.error("❌ Bio update failed:", err.message);
                }
            };

            updateBio();
            bioInterval = setInterval(updateBio, 60000);
        };

        // Anti-Call System
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

        // Start systems
        startBioUpdates();
        startCallBlocking();

        console.log("✅ Auto Bio & Anti-Call systems operational");
        logger.info("Protection systems now active");

        return () => {
            console.log("⚠️ Shutting down Auto Bio & Anti-Call systems...");
            if (bioInterval) clearInterval(bioInterval);
            if (activeCallHandler) adams.ev.off("call", activeCallHandler);
            logger.info("⚙️ Systems terminated");
        };
    }
};

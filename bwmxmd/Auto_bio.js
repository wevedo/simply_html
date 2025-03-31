const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../Session/store.json");

const loadConfig = () => {
    try {
        return JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (err) {
        console.error("❌ Error loading config:", err.message);
        return { AUTO_BIO: "no", ANTICALL: "no" };
    }
};

module.exports = {
    setup: async (adams, { logger }) => {
        if (!adams) return;

        console.log("Initializing Auto Bio & Anti-Call systems...");

        let bioInterval = null;
        let activeCallHandler = null;

        const config = loadConfig(); // Load stored settings

        // Auto Bio System
        const startBioUpdates = () => {
            if (config.AUTO_BIO !== "on") return;

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
                    logger.info("Bio updated successfully");
                } catch (err) {
                    logger.error("Bio update failed:", err.message);
                }
            };

            updateBio(); // Initial update
            bioInterval = setInterval(updateBio, 60000);
        };

        // Anti-Call System
        const startCallBlocking = () => {
            if (config.ANTICALL !== "on") return;

            const callHandler = async (callData) => {
                try {
                    const { id, from } = callData[0];
                    await adams.rejectCall(id, from);
                    logger.info(`Blocked call from: ${from}`);
                } catch (err) {
                    logger.error("Call blocking failed:", err.message);
                }
            };

            adams.ev.on("call", callHandler);
            activeCallHandler = callHandler;
        };

        startBioUpdates();
        startCallBlocking();

        console.log("✅ Auto Bio & Anti-Call systems operational");
        logger.info("Protection systems now active");

        return () => {
            console.log("Shutting down Auto Bio & Anti-Call systems...");
            if (bioInterval) clearInterval(bioInterval);
            if (activeCallHandler) adams.ev.off("call", activeCallHandler);
            logger.info("Systems terminated");
        };
    },
};

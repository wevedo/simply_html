const s = require(__dirname + "/../config"); // Load settings from config

module.exports = {
    setup: async (adams, { logger }) => {
        if (!adams) return;

        console.log("Initializing Auto Bio & Anti-Call systems...");

        let bioInterval = null;
        let activeCallHandler = null;

        // Auto Bio System
        const startBioUpdates = () => {
            if (s.AUTO_BIO !== "yes") return; // Use settings from `config`

            const getCurrentDateTime = () =>
                new Intl.DateTimeFormat("en-KE", {
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
            bioInterval = setInterval(updateBio, 60000); // Update every 60 seconds
        };

        // Anti-Call System
        const startCallBlocking = () => {
            if (s.ANTICALL !== "yes") return; // Use settings from `config`

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

        // Start systems
        startBioUpdates();
        startCallBlocking();

        console.log("✅ Auto Bio & Anti-Call systems operational");
        logger.info("Protection systems now active");

        // Cleanup function
        return () => {
            console.log("Shutting down Auto Bio & Anti-Call systems...");

            if (bioInterval) clearInterval(bioInterval);
            if (activeCallHandler) adams.ev.off("call", activeCallHandler);

            logger.info("Systems terminated");
        };
    },
};

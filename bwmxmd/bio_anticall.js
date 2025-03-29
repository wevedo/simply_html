module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) return;

        console.log("Initializing Auto Bio & Anti-Call systems...");

        // Store cleanup handlers
        let bioInterval = null;
        let activeCallHandler = null;

        // Auto Bio System
        const startBioUpdates = () => {
            if (config.AUTO_BIO !== "yes") return;

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

            // Initial immediate update
            updateBio();
            // Set periodic updates
            bioInterval = setInterval(updateBio, 60000);
        };

        // Anti-Call System
        const startCallBlocking = () => {
            if (config.ANTICALL !== "yes") return;

            const callHandler = async (callData) => {
                try {
                    const { id, from } = callData[0];
                    await adams.rejectCall(id, from);
                    logger.info(`Blocked call from: ${from}`);
                } catch (err) {
                    logger.error("Call blocking failed:", err.message);
                }
            };

            adams.ev.on('call', callHandler);
            activeCallHandler = callHandler;
        };

        // Start systems
        startBioUpdates();
        startCallBlocking();

        // Startup confirmation
        console.log("✅ Auto Bio & Anti-Call systems operational");
        logger.info("Protection systems now active");

        // Cleanup function (MISSING IN ORIGINAL CODE)
        return () => {
            console.log("Shutting down Auto Bio & Anti-Call systems...");
            
            // Clear bio update interval
            if (bioInterval) clearInterval(bioInterval);
            
            // Remove call event listener
            if (activeCallHandler) adams.ev.off('call', activeCallHandler);
            
            logger.info("Systems terminated");
        };
    }
};

module.exports = {
    setup: (adams, { config, logger }) => {
        console.log(chalk.blue("🔄 Activating Auto Bio & Anti-Call System..."));

        // Cleanup holders
        let bioInterval = null;
        let callHandler = null;

        // Auto Bio System
        const autoBio = () => {
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
                    logger.error(`Bio update failed: ${err.message}`);
                }
            };

            // Initial update and set interval
            updateBio();
            bioInterval = setInterval(updateBio, 60000);
        };

        // Anti-Call System
        const antiCall = () => {
            if (config.ANTICALL !== "yes") return;

            callHandler = async (callData) => {
                try {
                    const { id, from } = callData[0];
                    await adams.rejectCall(id, from);
                    logger.info(`Blocked call from: ${from}`);
                } catch (err) {
                    logger.error(`Call blocking failed: ${err.message}`);
                }
            };

            adams.ev.on('call', callHandler);
        };

        // Initialize systems
        autoBio();
        antiCall();

        // Return cleanup function
        return () => {
            console.log(chalk.yellow("🔧 Cleaning up Auto Bio & Anti-Call..."));
            
            if (bioInterval) clearInterval(bioInterval);
            if (callHandler) adams.ev.off('call', callHandler);
            
            logger.info("Auto Bio & Anti-Call systems terminated");
        };
    }
};

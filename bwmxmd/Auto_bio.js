const { getSettings } = require('../utils/settings');

module.exports = {
    setup: async (adams, { logger }) => {
        const settings = await getSettings();
        if (!settings.AUTO_BIO) return;

        let bioInterval = null;
        console.log("Autobio system initializing...");

        const updateBio = async () => {
            try {
                const dateOptions = {
                    timeZone: "Africa/Nairobi",
                    hour12: false,
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                };
                
                const dateString = new Date().toLocaleString("en-KE", dateOptions);
                await adams.updateProfileStatus(`ūüďĆ BWM XMD Online ūüĎá\nūüŹĆ ${dateString}`);
            } catch (err) {
                logger.error("Bio update error:", err);
            }
        };

        // Initial update and interval
        await updateBio();
        bioInterval = setInterval(updateBio, 60000);

        return () => {
            clearInterval(bioInterval);
            console.log("Autobio system terminated");
        };
    }
};

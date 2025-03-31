const axios = require("axios"); // Using Axios for fetching
const s = require(__dirname + "/../config"); // Load settings from config

module.exports = {
    setup: async (adams, { logger }) => {
        if (!adams) return;

        console.log("Initializing Auto Bio & Anti-Call systems...");

        let bioInterval = null;
        let activeCallHandler = null;

        // Fetch weather data based on location using Axios
        const getWeatherInfo = async (city) => {
            try {
                const apiKey = "060a6bcfa19809c2cd4d97a212b19273";
                const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&language=en`;

                const response = await axios.get(url);
                const data = response.data;

                return {
                    city: data.name,
                    temperature: data.main.temp,
                    description: data.weather[0].description,
                    country: data.sys.country,
                };
            } catch (error) {
                console.error("⚠️ Failed to fetch weather:", error.message);
                return null;
            }
        };

        // Auto Bio System with Weather Updates
        const startBioUpdates = async () => {
            if (s.AUTO_BIO !== "yes") return;

            const userCity = "Nairobi"; // Replace with dynamic user location if available

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
                    const weather = await getWeatherInfo(userCity);
                    const weatherText = weather
                        ? `🌡️ ${weather.temperature}°C | ${weather.description} | ${weather.city}, ${weather.country}`
                        : "⚠️ Weather data unavailable";

                    const bioText = `🌍 BWM XMD ONLINE 🚀\n${weatherText}\n📅 ${getCurrentDateTime()}`;

                    await adams.updateProfileStatus(bioText);
                    logger.info("Bio updated successfully");
                } catch (err) {
                    logger.error("Bio update failed:", err.message);
                }
            };

            updateBio(); // Initial update
            bioInterval = setInterval(updateBio, 60000); // Update every 60 seconds
        };

        // Anti-Call System with Message After Declining
        const startCallBlocking = () => {
            if (s.ANTICALL !== "yes") return;

            const callHandler = async (callData) => {
                try {
                    const { id, from } = callData[0];

                    await adams.rejectCall(id, from);
                    logger.info(`Blocked call from: ${from}`);

                    // Send message after declining the call
                    await adams.sendMessage(from, {
                        text: "🚫 *AntiCall is ON!* 🚫\n\n❌ Calls are not allowed. Try again later! ⏳",
                    });
                } catch (err) {
                    logger.error("Call blocking failed:", err.message);
                }
            };

            adams.ev.on("call", callHandler);
            activeCallHandler = callHandler;
        };

        // Start systems
        await startBioUpdates();
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

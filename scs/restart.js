const { adams } = require("../Ibrahim/adams");

adams({ nomCom: "restart", categorie: "Mods", reaction: "📴" }, async (dest, z, com) => {
    const { repondre, superUser } = com;

    if (!superUser) {
        return repondre("This command is for owner only");
    }

    const { exec } = require("child_process");

    repondre("Bwm xmd is restarting ⏳");

    exec("npm start", (err, stdout, stderr) => {
        if (err) {
            console.error("Error restarting the bot:", err);
            return repondre("Failed to restart the bot. Check the logs for details.");
        }
        console.log("Restart Output:", stdout);
        console.error("Restart Errors:", stderr);
        repondre("Bwm xmd has restarted successfully ✅");
    });
});

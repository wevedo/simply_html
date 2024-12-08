const { adams } = require("../Ibrahim/adams");
const simpleGit = require("simple-git");

adams({ nomCom: "reboot", categorie: "control", reaction: "👨🏿‍💼" }, async (dest, z, com) => {
  const { repondre, superUser } = com;

  if (!superUser) {
    return repondre("This command is for the owner only");
  }

  const { exec } = require("child_process");
  const git = simpleGit();

  try {
    repondre("*Checking for updates...*");

    // Pull the latest changes from the repository
    await git.pull("https://github.com/devibrah/NORMAL-BOT", "main");

    // Check for changes
    const status = await git.status();
    if (status.behind > 0) {
      repondre(
        `*New updates detected:*\n\n${status.files
          .map((file) => `- ${file.path}`)
          .join("\n")}\n\n*Restarting bot to apply updates...*`
      );
    } else {
      repondre("*Your bot is up-to-date.*");
    }

    // Restart all bot processes using pm2
    exec("pm2 restart all", (error, stdout, stderr) => {
      if (error) {
        return repondre(`Error restarting bot: ${error.message}`);
      }
      if (stderr) {
        return repondre(`Restart stderr: ${stderr}`);
      }
      repondre("*Bot restarted successfully!*");
    });
  } catch (error) {
    repondre(`*Error checking for updates:* ${error.message}`);
  }
});

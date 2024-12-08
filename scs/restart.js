const { adams } = require("../Ibrahim/adams");
const { exec } = require("child_process");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

adams(
  {
    nomCom: "reboot",
    categorie: "control",
    reaction: "👨🏿‍💼",
  },
  async (dest, z, com) => {
    const { repondre, ms, dev, superUser } = com;

    if (!superUser) {
      return repondre("This command is for owner only.");
    }

    const validCommands = ["upgrade", "restart", "reboot", "update"];
    if (!validCommands.includes(ms)) {
      return repondre(`Unknown command: ${ms}`);
    }

    repondre("*Checking for updates and restarting...*");

    try {
      // Step 1: Clone the GitHub repo
      const repoUrl = "https://github.com/devibrah/NORMAL-BOT";
      const localDir = path.resolve(__dirname, "../NORMAL-BOT");
      
      // Check if the repo exists locally, clone if not
      if (!fs.existsSync(localDir)) {
        await new Promise((resolve, reject) => {
          exec(`git clone ${repoUrl} ${localDir}`, (error, stdout, stderr) => {
            if (error) return reject(stderr || stdout);
            resolve(stdout);
          });
        });
      }

      // Step 2: Pull the latest changes
      await new Promise((resolve, reject) => {
        exec(`cd ${localDir} && git pull`, (error, stdout, stderr) => {
          if (error) return reject(stderr || stdout);
          resolve(stdout);
        });
      });

      // Step 3: Check for changes
      const { stdout: logs } = await new Promise((resolve, reject) => {
        exec(`cd ${localDir} && git log -1 --pretty=format:"%s"`, (error, stdout, stderr) => {
          if (error) return reject(stderr || stdout);
          resolve({ stdout });
        });
      });

      repondre(`*Latest Update*: ${logs || "No new updates found."}`);

      // Step 4: Restart the bot
      repondre("*Bwm xmd is restarting...*");
      exec("pm2 restart all");

    } catch (error) {
      console.error(error);
      repondre(`*Error during update*: ${error.message || error}`);
    }
  }
);

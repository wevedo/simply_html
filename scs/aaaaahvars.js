
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to the config.js file
const configPath = path.join(__dirname, './config.js');

// Function to update a variable in config.js
const updateConfig = (key, value) => {
    try {
        // Read the current config.js file
        const configContent = fs.readFileSync(configPath, 'utf-8');

        // Create a regex pattern to match the variable
        const regex = new RegExp(`(${key}\\s*:\\s*)(["']?.*?["']?)\\s*,`);

        if (regex.test(configContent)) {
            // Replace the variable value in the file
            const updatedContent = configContent.replace(regex, `$1"${value}",`);
            fs.writeFileSync(configPath, updatedContent, 'utf-8');
            console.log(`✅ Successfully updated ${key} to "${value}" in config.js.`);
        } else {
            console.log(`⚠️ Variable ${key} not found in config.js.`);
        }
    } catch (err) {
        console.error("❌ Error updating config.js:", err.message);
    }
};

// Command-line arguments for the variable name and value
const args = process.argv.slice(2);

// Ensure the correct format
if (args.length !== 2) {
    console.log(
        "📋 Usage: setvar <VARIABLE> <VALUE>\n" +
        "Example: setvar AUTO_REPLY yes"
    );
    process.exit(1);
}

const [varName, newValue] = args;

// Update the variable in config.js
updateConfig(varName, newValue);


/**
const { adams } = require("../Ibrahim/adams");
const Heroku = require('heroku-client');
const { readdirSync } = require('fs');

const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });
const appName = process.env.HEROKU_APP_NAME;
const BaseUrl = process.env.GITHUB_GIT;
const adamsapikey = process.env.BOT_OWNER;
// Command to display all Heroku environment variables
adams({
  nomCom: 'getallvar',
  categorie: "Control"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  // Ensure the command is executed by the bot owner
  if (!superUser) {
    return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
  }

  // Fetch all Heroku environment variables
  try {
    const configVars = await heroku.get(`/apps/${appName}/config-vars`);
    let message = "🌟 *BWM XMD VARS LIST* 🌟\n\n";
    for (const [key, value] of Object.entries(configVars)) {
      message += `🔑 *${key}=* ${value}\n`;
    }
    await zk.sendMessage(chatId, { text: message });
  } catch (error) {
    console.error("Error fetching Heroku vars:", error);
    await zk.sendMessage(chatId, { text: "⚠️ *Failed to fetch Heroku environment variables!*" });
  }
});

// Command to set or update Heroku environment variables
adams({
  nomCom: 'setvar',
  categorie: "Control"
}, async (chatId, zk, context) => {
  const { ms, repondre, superUser, arg } = context;

  // Ensure the command is executed by the bot owner
  if (!superUser) {
    return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
  }

  // Validate input
  if (!arg[0] || !arg[0].includes('=')) {
    return repondre(
      "📋 *Usage Instructions:*\n\n" +
      "To set or update a variable:\n" +
      "`setvar VAR_NAME=value`\n\n" +
      "Example:\n" +
      "`setvar AUTO_REPLY=yes`\n" +
      "`setvar AUTO_REPLY=no`"
    );
  }

  // Parse variable and value
  const [varName, value] = arg[0].split('=');
  if (!varName || !value) {
    return repondre("⚠️ *Invalid format!* Use `AUTO_REPLY=no` format.");
  }

  // Update Heroku environment variable
  try {
    const updateResponse = await heroku.patch(`/apps/${appName}/config-vars`, {
      body: {
        [varName]: value
      }
    });

    const updatedValue = updateResponse[varName];

    // Restart Heroku dynos after update
    await heroku.delete(`/apps/${appName}/dynos`);

    // Confirm the updated value after restart
    const configVars = await heroku.get(`/apps/${appName}/config-vars`);
    const appliedValue = configVars[varName];

    await zk.sendMessage(chatId, {
      text: `*BWM XMD VARS*\n\n✅ *Heroku Variable Updated Successfully!*\n\n🔑 *${varName}:* ${appliedValue}\n\n🔄 *Just wait for one minute for your bot to restart!*`
    });
  } catch (error) {
    console.error("Error updating Heroku var or restarting dynos:", error);
    await zk.sendMessage(chatId, { text: "⚠️ *Failed to update Heroku environment variable or restart the bot!*" });
  }
});

**/


const { adams } = require("../Ibrahim/adams");
const fs = require('fs-extra');
const path = require("path");

// Path to the config.js file
const configFilePath = path.join(__dirname, '../config.js');

// Command to set or update a variable in config.js
adams({
  nomCom: 'setvar',
  categorie: "Control"
}, async (chatId, zk, context) => {
  const { repondre, superUser, arg } = context;

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

  // Read the existing config.js file
  try {
    let configData = await fs.readFile(configFilePath, 'utf8');

    // Find the variable in the config.js file and update it
    const regex = new RegExp(`(${varName}:\\s*['"][^'"]*['"])`);
    if (regex.test(configData)) {
      configData = configData.replace(regex, `${varName}: '${value}'`);
    } else {
      // If variable doesn't exist, add it to the module exports
      configData = configData.replace('module.exports = {', `module.exports = {\n  ${varName}: '${value}',`);
    }

    // Write the updated config.js file
    await fs.writeFile(configFilePath, configData);

    // Send success message to chat
    await zk.sendMessage(chatId, {
      text: `*BWM XMD VARS*\n\n✅ *Variable updated successfully!*\n\n🔑 *${varName}:* ${value}`
    });
  } catch (error) {
    console.error("Error updating config.js:", error);
    await zk.sendMessage(chatId, { text: "⚠️ *Failed to update the variable in config.js!*" });
  }
});

// Command to display all variables in config.js
adams({
  nomCom: 'getallvar',
  categorie: "Control"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  // Ensure the command is executed by the bot owner
  if (!superUser) {
    return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
  }

  try {
    // Read the config.js file
    const configData = await fs.readFile(configFilePath, 'utf8');
    
    // Extract the variables from config.js using regex
    const regex = /(\w+):\s*['"]([^'"]+)['"]/g;
    let message = "🌟 *BWM XMD VARS LIST* 🌟\n\n";
    let match;
    
    while ((match = regex.exec(configData)) !== null) {
      const [_, key, value] = match;
      message += `🔑 *${key}=* ${value}\n`;
    }
    
    // Send the list of variables
    await zk.sendMessage(chatId, { text: message });
  } catch (error) {
    console.error("Error reading config.js:", error);
    await zk.sendMessage(chatId, { text: "⚠️ *Failed to read config.js!*" });
  }
});


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

const { adams } = require("../Ibrahim/adams");
const Heroku = require('heroku-client');

const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });
const appName = process.env.HEROKU_APP_NAME;

// List of variables to exclude from display
const EXCLUDED_VARS = [
  "BOT_MENU_LINK", "BOT_NAME", "DATABASE_URL", "HEROKU_API_KEY", 
  "HEROKU_APP_NAME", "MENU_TYPE", "NUMERO_OWNER", "PM_PERMIT", 
  "PREFIX", "WARN_COUNT", "SESSION_ID"
];

// Mappings for better readability
const VAR_MAPPINGS = {
  "ANTICALL": "Anti Call",
  "ANTIDELETE_MESSAGES": "Anti Delete Messages",
  "ANTILINK_GROUP": "Anti Link in Groups",
  "AUDIO_CHATBOT": "Audio Chatbot",
  "AUTO_BIO": "Auto Bio",
  "AUTO_DOWNLOAD_STATUS": "Auto Download Status",
  "AUTO_REACT": "Auto React",
  "AUTO_REACT_STATUS": "Auto React Status",
  "AUTO_READ": "Auto Read",
  "AUTO_READ_STATUS": "Auto Read Status",
  "AUTO_SAVE_CONTACTS": "Auto Save Contacts",
  "CHATBOT": "Chatbot",
  "CHATBOT1": "Chatbot1",
  "PUBLIC_MODE": "Public Mode",
  "STARTING_BOT_MESSAGE": "Starting Bot Message",
  "PRESENCE": "Presence"
};

// Special handling for PRESENCE variable
const PRESENCE_MAPPING = {
  "2": "Auto Typing (On)",
  "1": "Always Online (On)",
  "3": "Auto Recording (On)",
  "0": "Off"
};

// Fetch and display all variables
adams({
  nomCom: 'getallvar',
  categorie: "Control"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  if (!superUser) {
    return repondre("Access Denied! This command is restricted to the bot owner.");
  }

  if (!process.env.HEROKU_API_KEY || !appName) {
    return repondre("Missing Configuration! Please set HEROKU_API_KEY and HEROKU_APP_NAME.");
  }

  try {
    const configVars = await heroku.get(`/apps/${appName}/config-vars`);
    let message = "*BWM XMD VARS LIST*\n\n";
    let optionNumber = 1;
    let varOptions = {};

    Object.entries(configVars).forEach(([key, value]) => {
      if (!EXCLUDED_VARS.includes(key)) {
        let varDisplay = VAR_MAPPINGS[key] || key;
        let statusOn = `${varDisplay} is On`;
        let statusOff = `${varDisplay} is Off`;

        if (key === "PRESENCE") {
          statusOn = `Auto Typing On: PRESENCE=2\nAlways Online On: PRESENCE=1\nAuto Recording On: PRESENCE=3`;
          statusOff = `Auto Typing Off: PRESENCE=0\nAlways Online Off: PRESENCE=0\nAuto Recording Off: PRESENCE=0`;
          message += `${optionNumber}. ${PRESENCE_MAPPING[value] || "Unknown"}\n`;
        } else {
          message += `${optionNumber}. ${value === "yes" ? statusOn : statusOff}\n`;
        }

        varOptions[optionNumber] = key;
        optionNumber++;
      }
    });

    message += "\nReply with the number to toggle a setting.";

    // Store variable options in the context
    context.varOptions = varOptions;
    await zk.sendMessage(chatId, { text: message });

  } catch (error) {
    console.error("Error fetching Heroku vars:", error);
    await zk.sendMessage(chatId, { text: "Failed to fetch Heroku environment variables!" });
  }
});

// Handle user selection to toggle a variable
adams({
  nomCom: 'setvar',
  categorie: "Control"
}, async (chatId, zk, context) => {
  const { repondre, superUser, body, varOptions } = context;

  if (!superUser) {
    return repondre("Access Denied! This command is restricted to the bot owner.");
  }

  const selectedOption = parseInt(body.trim());
  if (!varOptions || !varOptions[selectedOption]) {
    return repondre("Invalid selection. Use 'getallvar' to see available options.");
  }

  const varName = varOptions[selectedOption];

  try {
    const configVars = await heroku.get(`/apps/${appName}/config-vars`);
    let newValue;

    if (varName === "PRESENCE") {
      newValue = configVars[varName] === "2" ? "0" : "2"; // Toggle between typing and off
    } else {
      newValue = configVars[varName] === "yes" ? "no" : "yes"; // Toggle yes/no
    }

    await heroku.patch(`/apps/${appName}/config-vars`, {
      body: { [varName]: newValue }
    });

    await heroku.delete(`/apps/${appName}/dynos`); // Restart bot

    await zk.sendMessage(chatId, {
      text: `Heroku Variable Updated!\n\n${VAR_MAPPINGS[varName] || varName} is now ${newValue.toUpperCase()}.\n\nPlease wait for one minute for the bot to restart.`
    });

  } catch (error) {
    console.error("Error updating Heroku var:", error);
    await zk.sendMessage(chatId, { text: "Failed to update Heroku variable!" });
  }
});

/*
const { adams } = require("../Ibrahim/adams");
const Heroku = require('heroku-client');

const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });
const appName = process.env.HEROKU_APP_NAME;

// Helper function to check required environment variables
function validateHerokuConfig(repondre) {
  if (!process.env.HEROKU_API_KEY || !appName) {
    repondre(
      "⚠️ *Missing Configuration!*\n\n" +
      "Ensure that the following environment variables are properly set:\n" +
      "- `HEROKU_API_KEY`\n" +
      "- `HEROKU_APP_NAME`"
    );
    return false;
  }
  return true;
}

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

  // Validate Heroku configuration
  if (!validateHerokuConfig(repondre)) return;

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
  const { repondre, superUser, arg } = context;

  // Ensure the command is executed by the bot owner
  if (!superUser) {
    return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
  }

  // Validate Heroku configuration
  if (!validateHerokuConfig(repondre)) return;

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
    return repondre("⚠️ *Invalid format!* Use `VAR_NAME=value` format.");
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

// Command to restart the Heroku dynos
adams({
  nomCom: 'update',
  categorie: "Control"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  // Ensure the command is executed by the bot owner
  if (!superUser) {
    return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
  }

  // Validate Heroku configuration
  if (!validateHerokuConfig(repondre)) return;

  // Restart Heroku dynos
  try {
    await heroku.delete(`/apps/${appName}/dynos`);
    await zk.sendMessage(chatId, {
      text: "✅ *Heroku dynos restarted successfully!*\n\n🔄 *Just wait for one minute for your bot to restart!*"
    });
  } catch (error) {
    console.error("Error restarting Heroku dynos:", error);
    await zk.sendMessage(chatId, {
      text: "⚠️ *Failed to restart Heroku dynos!*\n\nPlease check your Heroku API key and app name, or try again later."
    });
  }
});
*/

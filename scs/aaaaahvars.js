const { adams } = require("../Ibrahim/adams");
const Heroku = require('heroku-client');

const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });
const appName = process.env.HEROKU_APP_NAME;

// Variables to exclude from the displayed list
const EXCLUDED_VARS = [
  "BOT_MENU_LINK", "BOT_NAME", "DATABASE_URL", "HEROKU_API_KEY", 
  "HEROKU_APP_NAME", "MENU_TYPE", "NUMERO_OWNER", "PM_PERMIT", 
  "PREFIX", "WARN_COUNT", "SESSION_ID"
];

// Custom variable mappings for display
const VAR_DISPLAY_NAMES = {
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
  "PRESENCE": "Presence Mode"
};

// Custom presence mode mappings
const PRESENCE_MODES = {
  "2": "Auto Typing On",
  "0": "Auto Typing Off",
  "1": "Always Online On",
  "3": "Auto Recording On"
};

// Validate Heroku config
function validateHerokuConfig(repondre) {
  if (!process.env.HEROKU_API_KEY || !appName) {
    repondre("⚠️ Missing Configuration! Ensure HEROKU_API_KEY and HEROKU_APP_NAME are set.");
    return false;
  }
  return true;
}

// Command to display all variables in numbered format
adams({ nomCom: 'getallvar', categorie: "Control" }, async (chatId, zk, context) => {
  const { repondre, superUser } = context;
  if (!superUser) return repondre("Access Denied! This command is for the bot owner.");

  if (!validateHerokuConfig(repondre)) return;

  try {
    const configVars = await heroku.get(`/apps/${appName}/config-vars`);
    let message = "*BWM XMD VARS LIST*\n\n";
    let i = 1;
    let varOptions = [];

    for (const [key, value] of Object.entries(configVars)) {
      if (EXCLUDED_VARS.includes(key)) continue;

      let displayName = VAR_DISPLAY_NAMES[key] || key;
      let currentState = value.toLowerCase() === "yes" ? "On" : "Off";
      let option1 = `${i}. ${displayName} is On → ${key}=yes`;
      let option2 = `${i + 1}. ${displayName} is Off → ${key}=no`;
      message += `${option1}\n${option2}\n(Currently: ${currentState})\n\n`;

      varOptions.push({ key, onValue: "yes", offValue: "no" });
      i += 2;
    }

    await zk.sendMessage(chatId, { text: message });
    context.varOptions = varOptions; // Store options for selection

  } catch (error) {
    console.error("Error fetching Heroku vars:", error);
    await zk.sendMessage(chatId, { text: "⚠️ Failed to fetch Heroku environment variables!" });
  }
});

// Command to toggle a variable by number
adams({ nomCom: 'togglevar', categorie: "Control" }, async (chatId, zk, context) => {
  const { repondre, superUser, arg, varOptions } = context;
  if (!superUser) return repondre("Access Denied! This command is for the bot owner.");

  if (!validateHerokuConfig(repondre)) return;

  const selectedIndex = parseInt(arg[0], 10);
  if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > varOptions.length * 2) {
    return repondre("Invalid selection! Reply with a valid number from the list.");
  }

  let varIndex = Math.floor((selectedIndex - 1) / 2);
  let selectedVar = varOptions[varIndex];

  let newValue = selectedIndex % 2 === 1 ? selectedVar.onValue : selectedVar.offValue;

  try {
    await heroku.patch(`/apps/${appName}/config-vars`, { body: { [selectedVar.key]: newValue } });
    await heroku.delete(`/apps/${appName}/dynos`);

    await zk.sendMessage(chatId, {
      text: `✅ Updated *${selectedVar.key}* to *${newValue}*\n🔄 Restarting bot...`
    });

  } catch (error) {
    console.error("Error updating Heroku var:", error);
    await zk.sendMessage(chatId, { text: "⚠️ Failed to update Heroku variable!" });
  }
});

// Command to manually set a variable
adams({ nomCom: 'setvar', categorie: "Control" }, async (chatId, zk, context) => {
  const { repondre, superUser, arg } = context;
  if (!superUser) return repondre("Access Denied! This command is for the bot owner.");

  if (!validateHerokuConfig(repondre)) return;

  if (!arg[0] || !arg[0].includes('=')) {
    return repondre("Usage: setvar VAR_NAME=value\nExample: setvar AUTO_REPLY=yes");
  }

  const [varName, value] = arg[0].split('=');
  if (!varName || !value) return repondre("⚠️ Invalid format! Use VAR_NAME=value.");

  try {
    await heroku.patch(`/apps/${appName}/config-vars`, { body: { [varName]: value } });
    await heroku.delete(`/apps/${appName}/dynos`);

    await zk.sendMessage(chatId, {
      text: `✅ *Updated Variable*\n\n🔑 *${varName}* = *${value}*\n🔄 Restarting bot...`
    });

  } catch (error) {
    console.error("Error updating Heroku var:", error);
    await zk.sendMessage(chatId, { text: "⚠️ Failed to update Heroku variable!" });
  }
});

// Command to restart the bot
adams({ nomCom: 'update', categorie: "Control" }, async (chatId, zk, context) => {
  const { repondre, superUser } = context;
  if (!superUser) return repondre("Access Denied! This command is for the bot owner.");

  if (!validateHerokuConfig(repondre)) return;

  try {
    await heroku.delete(`/apps/${appName}/dynos`);
    await zk.sendMessage(chatId, {
      text: "✅ *Bot restarted successfully!*\n🔄 Wait a minute for it to come back online."
    });

  } catch (error) {
    console.error("Error restarting Heroku dynos:", error);
    await zk.sendMessage(chatId, { text: "⚠️ Failed to restart bot!" });
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

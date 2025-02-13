const { adams } = require("../Ibrahim/adams");
const Heroku = require("heroku-client");

const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });
const appName = process.env.HEROKU_APP_NAME;

// Validate Heroku Configuration
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

// Excluded Variables (These won't be displayed)
const excludedVars = [
  "DATA_BASE_URL", "MENU_TYPE", "CHATBOT1", "OWNER_NAME",
  "HEROKU_API_KEY", "HEROKU_APP_NAME", "NUMERO_OWNER",
  "PM_PERMIT", "PREFIX", "WARN_COUNT", "SESSION_ID"
];

// Variables to Show in the Menu
const configMapping = {
  ANTICALL: "Anti Call",
  ANTIDELETE_MESSAGES: "Anti Delete Messages",
  ANTILINK_GROUP: "Anti Link in Groups",
  AUDIO_CHATBOT: "Audio Chatbot",
  AUTO_BIO: "Auto Bio",
  AUTO_DOWNLOAD_STATUS: "Auto Download Status",
  AUTO_REACT: "Auto React",
  AUTO_REACT_STATUS: "Auto React Status",
  AUTO_READ: "Auto Read",
  AUTO_READ_STATUS: "Auto Read Status",
  AUTO_SAVE_CONTACTS: "Auto Save Contacts",
  CHATBOT: "Chatbot",
  PUBLIC_MODE: "Public Mode",
  STARTING_BOT_MESSAGE: "Starting Bot Message",
  "Always Online On": "PRESENCE=1",
  "Always Online Off": "PRESENCE=0",
  "Auto Typing On": "PRESENCE=2",
  "Auto Typing Off": "PRESENCE=3",
  "Auto Recording On": "PRESENCE=3",
  "Auto Recording Off": "PRESENCE=0",
};

// Image Backgrounds for Random Selection
const menuImages = [
  "https://files.catbox.moe/xx6ags.jpeg",
  "https://files.catbox.moe/dwdau2.jpeg"
];

// Command to Display Paginated Heroku Variables
adams(
  {
    nomCom: "getallvar",
    categorie: "Control",
  },
  async (chatId, zk, context) => {
    const { repondre, superUser } = context;

    if (!superUser) {
      return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
    }

    if (!validateHerokuConfig(repondre)) return;

    try {
      const configVars = await heroku.get(`/apps/${appName}/config-vars`);
      const variableKeys = Object.keys(configMapping);
      const varsPerPage = 3; // Adjust the number of variables per page
      let currentPage = 1;
      const totalPages = Math.ceil(variableKeys.length / varsPerPage);

      // Function to send a page of variables
      async function sendPage(page) {
        if (page < 1 || page > totalPages) return;

        const startIndex = (page - 1) * varsPerPage;
        const pageVars = variableKeys.slice(startIndex, startIndex + varsPerPage);

        let message = `🌟 *BWM XMD VARS LIST* 🌟\n\n📄 Page ${page}/${totalPages}\n\n`;
        let index = 1 + (page - 1) * varsPerPage * 2; // Adjust indexing for pagination
        let numberedList = [];

        pageVars.forEach((key) => {
          let value = configVars["PRESENCE"] === configMapping[key].split("=")[1] ? "ON" : "OFF";

          numberedList.push(
            `🔹 *${key}*`,
            ` ${index}. Turn ON ${key}`,
            ` ${index + 1}. Turn OFF ${key}`,
            `     ✅ Currently: *${value}*\n`
          );
          index += 2;
        });

        message += numberedList.join("\n") + "\n📌 *Reply with a number to choose an option.*";

        // Navigation Numbers
        if (page > 1) message += `\n⬅️ *Reply ${index} to go to Previous Page*`;
        if (page < totalPages) message += `\n➡️ *Reply ${index + 1} to go to Next Page*`;

        // Select a random image
        const randomImage = menuImages[Math.floor(Math.random() * menuImages.length)];

        const sentMessage = await zk.sendMessage(chatId, {
          image: { url: randomImage },
          caption: message,
        });

        // Listen for Reply
        zk.ev.on("messages.upsert", async (update) => {
          const message = update.messages[0];
          if (!message.message || !message.message.extendedTextMessage) return;

          const responseText = message.message.extendedTextMessage.text.trim();
          if (
            message.message.extendedTextMessage.contextInfo &&
            message.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id
          ) {
            const selectedIndex = parseInt(responseText);
            if (isNaN(selectedIndex)) return repondre("❌ *Invalid number. Please select a valid option.*");

            // Handle Pagination
            if (selectedIndex === index && page > 1) {
              return sendPage(page - 1);
            }
            if (selectedIndex === index + 1 && page < totalPages) {
              return sendPage(page + 1);
            }

            // Determine Variable to Change
            const variableIndex = Math.floor((selectedIndex - 1) / 2);
            const selectedKey = variableKeys[variableIndex];
            if (!selectedKey) return repondre("❌ *Invalid selection.*");

            let newValue = configMapping[selectedKey].split("=")[1]; // Extract the value

            // Update Heroku Variable
            await heroku.patch(`/apps/${appName}/config-vars`, {
              body: {
                PRESENCE: newValue, // Set PRESENCE to the selected value
              },
            });

            // Restart Heroku Dynos
            await heroku.delete(`/apps/${appName}/dynos`);

            await zk.sendMessage(chatId, {
              text: `✅ *${selectedKey} is now set to ${newValue}*\n\n🔄 *Bot is restarting...*`,
            });

            sendPage(page); // Refresh the page
          }
        });
      }

      // Start with Page 1
      sendPage(1);
    } catch (error) {
      console.error("Error fetching Heroku vars:", error);
      await zk.sendMessage(chatId, { text: "⚠️ *Failed to fetch Heroku environment variables!*" });
    }
  }
);
// Command to set or update Heroku environment variables
adams({
  nomCom: 'setvar',
  categorie: "Control"
}, async (chatId, zk, context) => {
  const { repondre, superUser, arg } = context;

  if (!superUser) {
    return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
  }

  if (!validateHerokuConfig(repondre)) return;

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

  const [varName, value] = arg[0].split('=');
  if (!varName || !value) {
    return repondre("⚠️ *Invalid format!* Use `VAR_NAME=value` format.");
  }

  try {
    await heroku.patch(`/apps/${appName}/config-vars`, {
      body: {
        [varName]: value
      }
    });

    await heroku.delete(`/apps/${appName}/dynos`);

    await zk.sendMessage(chatId, {
      text: `✅ *${varName.replace(/_/g, " ")} updated successfully!*\n\n🔄 *Bot is restarting...*`
    });
  } catch (error) {
    console.error("Error updating Heroku var or restarting dynos:", error);
    await zk.sendMessage(chatId, { text: "⚠️ *Failed to update Heroku environment variable!*" });
  }
});

// Command to restart the Heroku dynos
adams({
  nomCom: 'update',
  categorie: "Control"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  if (!superUser) {
    return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
  }

  if (!validateHerokuConfig(repondre)) return;

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

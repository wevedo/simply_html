
const { adams } = require("../Ibrahim/adams");
const Heroku = require("heroku-client");

const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });
const appName = process.env.HEROKU_APP_NAME;

// Helper function to validate Heroku config
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

// **Mapping of Environment Variables to User-Friendly Names**
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
  "Auto Typing": "Auto Typing",
  "Always Online": "Always Online",
  "Auto Recording": "Auto Recording",
};

// **Excluded Variables**
const EXCLUDED_VARS = [
  "DATA_BASE_URL",
  "MENU_TYPE",
  "CHATBOT1",
  "NUMERO_OWNER",
  "HEROKU_API_KEY",
  "HEROKU_APP_NAME",
  "BOT_MENU_LINK",
  "BOT_NAME",
  "PM_PERMIT",
  "PREFIX",
  "WARN_COUNT",
  "SESSION_ID",
];

// **Command to Display All Heroku Environment Variables with Pagination**
adams(
  {
    nomCom: "getallvar",
    categorie: "Control",
  },
  async (chatId, zk, context) => {
    const { repondre, superUser } = context;

    if (!superUser) {
      return repondre(
        "🚫 *Access Denied!* This command is restricted to the bot owner."
      );
    }

    if (!validateHerokuConfig(repondre)) return;

    try {
      const configVars = await heroku.get(`/apps/${appName}/config-vars`);
      let numberedList = [];
      let index = 1;

      // Get keys that are not excluded
      const variableKeys = Object.keys(configMapping).filter(
        (key) => !EXCLUDED_VARS.includes(key)
      );

      variableKeys.forEach((key) => {
        let currentValue;

        if (key === "Auto Typing") {
          currentValue = configVars.PRESENCE === "2" ? "YES" : "OFF";
        } else if (key === "Always Online") {
          currentValue = configVars.PRESENCE === "1" ? "YES" : "OFF";
        } else if (key === "Auto Recording") {
          currentValue = configVars.PRESENCE === "3" ? "YES" : "OFF";
        } else {
          currentValue =
            configVars[key] === "yes" || configVars[key] === "1"
              ? "YES"
              : "OFF";
        }

        let toggleyes = `On ${configMapping[key]}`;
        let toggleOff = `Off ${configMapping[key]}\n♻️Currently: ${currentValue}\n▱▱▱▱▱▱▱▰▰▰▰▰▰▰▰▰\n\n`;

        numberedList.push(`${index}. ${toggleYes}`);
        numberedList.push(`${index + 1}. ${toggleOff}`);
        index += 2;
      });

      // Split into two pages
      const chunkSize = Math.ceil(numberedList.length / 2);
      const pages = [
        numberedList.slice(0, chunkSize),
        numberedList.slice(chunkSize),
      ];

      const sendPage = async (pageIndex) => {
        if (pageIndex < 0 || pageIndex >= pages.length) return;

        const randomImage =
          Math.random() < 0.5
            ? "https://files.catbox.moe/xx6ags.jpeg"
            : "https://files.catbox.moe/dwdau2.jpeg";

        const message = `🌟 *BWM XMD VARS LIST (Page ${
          pageIndex + 1
        }/${pages.length})* 🌟\n\n${pages[pageIndex].join(
          "\n"
        )}\n\n📌 *Reply with a number to toggle a variable or navigate pages:*\n▶️ *${chunkSize * 2 + 1}* Next Page\n◀️ *${
          chunkSize * 2 + 2
        }* Previous Page`;

        const sentMessage = await zk.sendMessage(chatId, {
          image: { url: randomImage },
          caption: message,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
          },
        });

        // Listen for Reply
        zk.ev.on("messages.upsert", async (update) => {
          const message = update.messages[0];
          if (!message.message || !message.message.extendedTextMessage) return;

          const responseText = message.message.extendedTextMessage.text.trim();
          if (
            message.message.extendedTextMessage.contextInfo &&
            message.message.extendedTextMessage.contextInfo.stanzaId ===
              sentMessage.key.id
          ) {
            const selectedIndex = parseInt(responseText);
            if (
              isNaN(selectedIndex) ||
              (selectedIndex < 1 && selectedIndex > chunkSize * 2 + 2)
            ) {
              return repondre(
                "❌ *Invalid number. Please select a valid option.*"
              );
            }

            if (selectedIndex === chunkSize * 2 + 1) {
              return sendPage(pageIndex + 1);
            } else if (selectedIndex === chunkSize * 2 + 2) {
              return sendPage(pageIndex - 1);
            }

            const variableIndex = Math.floor((selectedIndex - 1) / 2);
            const selectedKey = variableKeys[variableIndex];

            let newValue =
              selectedIndex % 2 === 1 ? "YES" : "OFF";
            let presenceValue = "0";

            if (selectedKey === "Auto Typing") {
              presenceValue = newValue === "YES" ? "2" : "0";
            } else if (selectedKey === "Always Online") {
              presenceValue = newValue === "YES" ? "1" : "0";
            } else if (selectedKey === "Auto Recording") {
              presenceValue = newValue === "YES" ? "3" : "0";
            }

            if (
              selectedKey === "Auto Typing" ||
              selectedKey === "Always Online" ||
              selectedKey === "Auto Recording"
            ) {
              await heroku.patch(`/apps/${appName}/config-vars`, {
                body: { PRESENCE: presenceValue },
              });
            } else {
              await heroku.patch(`/apps/${appName}/config-vars`, {
                body: { [selectedKey]: newValue.toLowerCase() },
              });
            }

            await heroku.delete(`/apps/${appName}/dynos`);

            await zk.sendMessage(chatId, {
              text: `✅ *${configMapping[selectedKey]} is now set to ${newValue}*\n\n🔄 *Bot is restarting...*`,
            });
          }
        });
      };

      sendPage(0);
    } catch (error) {
      console.error("Error fetching Heroku vars:", error);
      await zk.sendMessage(chatId, {
        text: "⚠️ *Failed to fetch Heroku environment variables!*",
      });
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

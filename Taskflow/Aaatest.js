const { adams } = require('../Ibrahim/adams');
const conf = require(__dirname + "/../config");
const PREFIX = conf.PREFIX;

// Switch to list message if buttons fail
adams({
    nomCom: "listtest",
    categorie: "General"
}, async (dest, zk, { repondre }) => {
    await zk.sendMessage(dest, {
        text: "Select an option",
        footer: "Menu",
        title: "Options",
        buttonText: "OPEN MENU",
        sections: [
            {
                title: "Test Section",
                rows: [
                    { title: "Test Option", rowId: "option1" }
                ]
            }
        ]
    });
});

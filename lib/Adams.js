const fs = require('fs-extra');
const path = require('path');
const conf = require(__dirname + "/../config");

const SETTINGS_PATH = path.join(__dirname, '..', 'store.json');

async function getSettings() {
    try {
        return await fs.readJson(SETTINGS_PATH);
    } catch (e) {
        return { 
            AUTO_BIO: false,
            ANTICALL: false 
        };
    }
}

async function updateFeature(feature, state) {
    const settings = await getSettings();
    settings[feature] = state === 'on';
    await fs.writeJson(SETTINGS_PATH, settings);
    return settings;
}

module.exports = { getSettings, updateFeature };

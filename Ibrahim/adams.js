const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const tabCmds = [];
let cm = [];
const ev = {}; 

function adams(obj, fonctions) {
    let infoComs = obj;
    if (!obj.categorie) infoComs.categorie = "General";
    if (!obj.reaction) infoComs.reaction = "🚘";
    infoComs.fonction = fonctions;
    cm.push(infoComs);
    return infoComs;
}

module.exports = { adams, Module: adams, cm, ev };

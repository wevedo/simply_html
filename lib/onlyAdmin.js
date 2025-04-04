const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../xmd/onlyAdmin.json');

// Load data from JSON file
function loadOnlyAdminData() {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return new Set(JSON.parse(data));
  } catch (err) {
    return new Set(); // If file doesn't exist, start with an empty set
  }
}

// Save data to JSON file
function saveOnlyAdminData(data) {
  fs.writeFileSync(filePath, JSON.stringify([...data], null, 2));
}

const onlyAdminGroups = loadOnlyAdminData();

async function addGroupToOnlyAdminList(groupeJid) {
  onlyAdminGroups.add(groupeJid);
  saveOnlyAdminData(onlyAdminGroups);
  console.log(`Group JID ${groupeJid} added to the onlyAdmin list.`);
}

async function isGroupOnlyAdmin(groupeJid) {
  return onlyAdminGroups.has(groupeJid);
}

async function removeGroupFromOnlyAdminList(groupeJid) {
  onlyAdminGroups.delete(groupeJid);
  saveOnlyAdminData(onlyAdminGroups);
  console.log(`Group JID ${groupeJid} removed from the onlyAdmin list.`);
}

module.exports = {
  addGroupToOnlyAdminList,
  isGroupOnlyAdmin,
  removeGroupFromOnlyAdminList,
};
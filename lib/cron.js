const fs = require("fs");
const path = require("path");

// Path to store cron data
const filePath = path.join(__dirname, "../xmd/cron.json");

// Function to load cron data from file
function loadCronData() {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error loading cron data:", err);
  }
  return {}; // Return empty object if file doesn't exist
}

// Function to save cron data to file
function saveCronData(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error saving cron data:", err);
  }
}

// Initialize cron storage if it doesn't exist
if (!fs.existsSync(filePath)) {
  saveCronData({});
}

// Function to add or update a cron job
async function addCron(group_id, row, value) {
  try {
    const data = loadCronData();
    if (!data[group_id]) data[group_id] = {};
    
    data[group_id][row] = value;
    saveCronData(data);
    console.log(`✅ Cron updated for ${group_id}`);
  } catch (error) {
    console.error("❌ Error updating cron data:", error);
  }
}

// Function to get all cron jobs
async function getCron() {
  try {
    return Object.entries(loadCronData()).map(([group_id, values]) => ({
      group_id,
      ...values,
    }));
  } catch (error) {
    console.error("❌ Error fetching cron data:", error);
    return [];
  }
}

// Function to get a cron job by group_id
async function getCronById(group_id) {
  try {
    return loadCronData()[group_id] || null;
  } catch (error) {
    console.error("❌ Error fetching cron by group_id:", error);
    return null;
  }
}

// Function to delete a cron job
async function delCron(group_id) {
  try {
    const data = loadCronData();
    if (data[group_id]) {
      delete data[group_id];
      saveCronData(data);
      console.log(`✅ Cron deleted for ${group_id}`);
    } else {
      console.log(`⚠️ Group ID ${group_id} not found.`);
    }
  } catch (error) {
    console.error("❌ Error deleting cron data:", error);
  }
}

// Export functions for use in other files
module.exports = {
  getCron,
  addCron,
  delCron,
  getCronById,
};

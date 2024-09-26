const { promises: fs } = require("fs");
const path = require("path");
const config = require("./config");
const { retrivePlugins, client } = require("./lib");
const requireJS = async (dir, { recursive = false, fileFilter = f => path.extname(f) === ".js" } = {}) => {
 const files = recursive ? (await Promise.all((await fs.readdir(dir, { withFileTypes: true })).map(e => path.resolve(dir, e.name)).map(async p => ((await fs.stat(p)).isDirectory() ? requireJS(p, { recursive, fileFilter }) : p)))).flat() : await fs.readdir(dir);

 return Promise.all(
  files.filter(fileFilter).map(f => {
   const filePath = path.isAbsolute(f) ? f : path.join(dir, f);
   try {
    return require(filePath);
   } catch (err) {
    return null;
   }
  })
 ).then(m => m.filter(Boolean));
};
async function initialize() {
 await requireJS(path.join(__dirname, "/lib/Client/Stores/"));
 console.log("Syncing Database");
 await config.DATABASE.sync();
 console.log("⬇  Installing Plugins...");
 await requireJS(path.join(__dirname, "/plugins/"));
 await retrivePlugins();
 return await client();
}

initialize();
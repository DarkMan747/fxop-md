const { promises: fs } = require("fs");
const path = require("path");
const { SESSION_ID } = require("../../../config");
const PastebinAPI = require("pastebin-js");
const sessPath = path.resolve(__dirname, "../auth");
const pastebin = new PastebinAPI("bR1GcMw175fegaIFV2PfignYVtF0b_Bl");

const decodeB64 = str => Buffer.from(str, "base64").toString("utf-8");
const mkSessDir = () => fs.mkdir(sessPath, { recursive: true });
const wFile = (fp, data) => fs.writeFile(fp, data);
const exit = () => (console.error("unparsable session"), fs.rm(sessPath, { recursive: true, force: true }).finally(() => process.exit(1)));

const sessionID = sid =>
 mkSessDir()
  .then(() => {
   const sessId = (sid || SESSION_ID).replace(/Session~/gi, "").trim();
   return sessId.length > 20 ? wFile(path.join(sessPath, "creds.json"), JSON.stringify(JSON.parse(decodeB64(sessId)))) : pastebin.getPaste(sessId).then(decodedData => (decodedData ? wFile(path.join(sessPath, "creds.json"), decodedData.toString()) : exit()));
  })
  .catch(exit);

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

module.exports = { sessionID, requireJS };

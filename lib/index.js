const fs = require("fs").promises;
const path = require("path");

const requireJS = async (dir, { recursive = false, fileFilter = f => path.extname(f) === ".js" } = {}) => {
 const entries = await fs.readdir(dir, { withFileTypes: true });
 const files = recursive
  ? await Promise.all(
     entries.map(async entry => {
      const fullPath = path.resolve(dir, entry.name);
      return entry.isDirectory() ? requireJS(fullPath, { recursive, fileFilter }) : fullPath;
     })
    ).then(results => results.flat())
  : entries.map(entry => path.join(dir, entry.name));

 const loadedModules = await Promise.all(
  files.filter(fileFilter).map(async f => {
   const filePath = path.isAbsolute(f) ? f : path.join(dir, f);
   try {
    return require(filePath);
   } catch (err) {
    return null;
   }
  })
 );

 return loadedModules.filter(Boolean);
};
module.exports = { requireJS };

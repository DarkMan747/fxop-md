const fs = require("fs");
const path = require("path");

const exports = dir => {
 const exportedModules = {};

 const traverseDirectory = currentPath => {
  fs.readdirSync(currentPath).forEach(file => {
   const filePath = path.join(currentPath, file);
   const stats = fs.statSync(filePath);

   if (stats.isDirectory()) {
    traverseDirectory(filePath);
   } else if (stats.isFile() && file.endsWith(".js")) {
    Object.assign(exportedModules, require(filePath) || {});
   }
  });
 };

 traverseDirectory(dir);
 return Object.defineProperties(
  exportedModules,
  Object.keys(exportedModules).reduce((acc, key) => {
   acc[key] = { enumerable: false };
   return acc;
  }, {})
 );
};

module.exports = exports(__dirname);

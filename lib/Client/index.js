const fs = require("fs");
const path = require("path");

function CLientSync(dir) {
 const exportedModules = {};

 function traverseDirectory(currentPath, depth = 0) {
  console.log(`Exploring directory: ${currentPath} (Depth: ${depth})`);
  const files = fs.readdirSync(currentPath);

  for (const file of files) {
   const filePath = path.join(currentPath, file);
   const fileStats = fs.statSync(filePath);

   if (fileStats.isDirectory()) {
    console.log(`Found subdirectory: ${file} (Depth: ${depth + 1})`);
    traverseDirectory(filePath, depth + 1);
   } else if (fileStats.isFile() && path.extname(file) === ".js") {
    const relativePath = path.relative(dir, filePath);
    const moduleName = relativePath.replace(/\\/g, "/").replace(/\.js$/, "");
    console.log(`Loading module: ${moduleName} (Depth: ${depth})`);
    try {
     const moduleExports = require(filePath);
     if (typeof moduleExports === "object" && moduleExports !== null) {
      Object.entries(moduleExports).forEach(([key, value]) => {
       const fullKey = `${moduleName}.${key}`;
       console.log(`  Exporting: ${fullKey}`);
       exportedModules[fullKey] = value;
      });
     } else {
      exportedModules[moduleName] = moduleExports;
     }
    } catch (error) {
     console.error(`Failed to load module ${file}:`, error);
    }
   }
  }
 }

 traverseDirectory(dir);

 Object.keys(exportedModules).forEach(key => {
  Object.defineProperty(exportedModules, key, {
   enumerable: false,
   configurable: false,
   writable: false,
  });
 });

 return exportedModules;
}

const patch = path.join(__dirname);
module.exports = CLientSync(patch);

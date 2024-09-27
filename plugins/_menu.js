const os = require("os");
const { Module, mode, runtime, commands, tiny } = require("../lib");
const { TIME_ZONE } = require("../config");

function getRAMUsage() {
 const totalMemory = os.totalmem();
 const freeMemory = os.freemem();
 const usedMemory = totalMemory - freeMemory;
 return `${(usedMemory / 1024 / 1024 / 1024).toFixed(2)} GB / ${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function getOS() {
 const osType = os.type();
 switch (osType) {
  case "Linux":
   return "Linux";
  case "Darwin":
   return "MacOS";
  case "Windows_NT":
   return "Windows";
  default:
   return "VPS";
 }
}
Module(
 {
  pattern: "menu",
  fromMe: mode,
  description: "Show All Commands",
  dontAddCommandList: true,
 },
 async (message, query) => {
  if (query) {
   for (const plugin of commands) {
    if (plugin.pattern && plugin.pattern.test(message.prefix + query)) {
     const commandName = plugin.pattern.toString().split(/\W+/)[2];
     return message.reply(`\`\`\`Command: ${message.prefix}${commandName.trim()}
  Description: ${plugin.description || "No description available"}\`\`\``);
    }
   }
   return message.reply("Command not found.");
  } else {
   const { prefix } = message;
   const [currentDate, currentTime] = new Date().toLocaleString("en-IN", { timeZone: TIME_ZONE }).split(",");
   const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
   let menuText = `╭─ ғxᴏᴘʀɪsᴀ ᴍᴅ ───
│ prefix: ${prefix}
│ user: ${message.pushName}
│ os: ${getOS()}
│ plugins: ${commands.length}
│ runtime: ${runtime(process.uptime())}
│ ram: ${getRAMUsage()}
│ time: ${currentTime}
│ day: ${currentDay}
│ date: ${currentDate}
│ version: ${require("../package.json").version}
╰────────────────\n`;

   const commandList = [];
   const categories = new Set();

   commands.forEach(command => {
    if (command.pattern && !command.dontAddCommandList) {
     const commandName = command.pattern.toString().split(/\W+/)[2];
     const category = command.type ? command.type.toLowerCase() : "misc";
     commandList.push({ name: commandName, category });
     categories.add(category);
    }
   });

   commandList.sort((a, b) => a.name.localeCompare(b.name));
   Array.from(categories)
    .sort()
    .forEach(category => {
     menuText += `\n╭── ${category} ────`;
     const categoryCommands = commandList.filter(cmd => cmd.category === category);
     categoryCommands.forEach(({ name }) => {
      menuText += `\n│ ${name}`;
     });
     menuText += `\n╰──────────────\n`;
    });

   return await message.sendMessage(message.jid, tiny(menuText.trim()));
  }
 }
);

Module(
 {
  pattern: "list",
  fromMe: mode,
  description: "Show All Commands",
  dontAddCommandList: true,
 },
 async (message, query, { prefix }) => {
  let commandListText = "\t\t```Command List```\n";
  const commandList = [];

  commands.forEach(command => {
   if (command.pattern && !command.dontAddCommandList) {
    const commandName = command.pattern.toString().split(/\W+/)[2]; // Changed this line
    const description = command.desc || command.info || "No description available";
    commandList.push({ name: commandName, description });
   }
  });

  commandList.sort((a, b) => a.name.localeCompare(b.name));
  commandList.forEach(({ name, description }, index) => {
   commandListText += `\`\`\`${index + 1} ${name.trim()}\`\`\`\n`;
   commandListText += `Use: \`\`\`${description}\`\`\`\n\n`;
  });

  return await message.reply(commandListText);
 }
);

const { Module, runtime, mode, PausedChats, PluginDB, installPlugin } = require("../lib");
const axios = require("axios");
const fs = require("fs");
const config = require("../config");
const { exec } = require("child_process");
const simplegit = require("simple-git");
const git = simplegit();
var branch = config.BRANCH;

Module(
 {
  pattern: "runtime",
  fromMe: mode,
  desc: "Check uptime of bot",
  type: "utils",
 },
 async (message, match, m, client) => {
  message.reply("" + runtime(process.uptime()) + "");
 }
);

Module(
 {
  pattern: "enable",
  fromMe: true,
  desc: "Enables Disable Chat Commands.",
  type: "utils",
 },
 async message => {
  const chatId = message.key.remoteJid;
  const pausedChat = await PausedChats.PausedChats.findOne({ where: { chatId } });
  if (pausedChat) {
   await pausedChat.destroy();
   message.reply("_Commands Enabled For This Chat_");
  } else {
   message.reply("_Commnads Weren't Disabled Here_");
  }
 }
);

Module(
 {
  pattern: "disable",
  fromMe: true,
  desc: "Disables Commands For A Chat",
  type: "utils",
 },
 async (message, match, m, client) => {
  const chatId = message.key.remoteJid;
  await PausedChats.savePausedChat(chatId);
  message.reply("_Commands Disabled From this Chat._");
 }
);

Module(
 {
  pattern: "ping",
  fromMe: mode,
  desc: "Bot response in milliseconds.",
  type: "system",
 },
 async message => {
  const start = new Date().getTime();
  const msg = await message.reply("Checking");
  const end = new Date().getTime();
  const responseTime = (end - start) / 1000;
  await msg.edit(`\`\`\`Responce Rate ${responseTime} secs\`\`\``);
 }
);

Module(
 {
  pattern: "update",
  fromMe: true,
  desc: "Update the bot",
  type: "utils",
 },
 async (message, match) => {
  prefix = message.prefix;
  await git.fetch();

  var commits = await git.log([branch + "..origin/" + branch]);
  if (match === "now") {
   if (commits.total === 0) {
    return await message.sendMessage(message.jid, "```No changes in the latest commit```");
   }
   await message.sendMessage(message.jid, "*Updating...*");
   await exec("git stash && git pull origin " + config.BRANCH, async (err, stdout, stderr) => {
    if (err) {
     return await message.sendMessage(message.jid, "```" + stderr + "```");
    }
    await message.sendMessage(message.jid, "*Restarting...*");
    let dependancy = await updatedDependencies();
    if (dependancy) {
     await message.reply("*Dependancies changed installing new dependancies *");
     await message.reply("*Restarting...*");
     exec("npm install && pm2 restart " + PROCESSNAME, async (err, stdout, stderr) => {
      if (err) {
       return await message.sendMessage(message.jid, "```" + stderr + "```");
      }
     });
    } else {
     await message.reply("*Restarting...*");
     exec("pm2 restart " + PROCESSNAME, async (err, stdout, stderr) => {
      if (err) {
       return await message.sendMessage(message.jid, "```" + stderr + "```");
      }
     });
    }
   });
  } else {
   if (commits.total === 0) {
    return await message.sendMessage(message.jid, "```No changes in the latest commit```");
   } else {
    let changes = "_New update available!_\n\n";
    changes += "*Commits:* ```" + commits.total + "```\n";
    changes += "*Branch:* ```" + branch + "```\n";
    changes += "*Changes:* \n";
    commits.all.forEach((commit, index) => {
     changes += "```" + (index + 1) + ". " + commit.message + "```\n";
    });
    changes += "\n*To update, send* ```" + prefix + "update now```";
    await message.sendMessage(message.jid, changes);
   }
  }
 }
);

async function updatedDependencies() {
 try {
  const diff = await git.diff([`${branch}..origin/${branch}`]);
  const hasDependencyChanges = diff.includes('"dependencies":');
  return hasDependencyChanges;
 } catch (error) {
  console.error("Error occurred while checking package.json:", error);
  return false;
 }
}

Module(
 {
  pattern: "install",
  fromMe: true,
  desc: "Installs External plugins",
  type: "system",
 },
 async (message, match) => {
  if (!match) return await message.sendMessage(message.jid, "_Send a plugin url_");

  try {
   var url = new URL(match);
  } catch (e) {
   console.log(e);
   return await message.sendMessage(message.jid, "_Invalid Url_");
  }

  if (url.host === "gist.github.com") {
   url.host = "gist.githubusercontent.com";
   url = url.toString() + "/raw";
  } else {
   url = url.toString();
  }

  var plugin_name;
  try {
   const { data, status } = await axios.get(url);
   if (status === 200) {
    var comand = data.match(/(?<=pattern:) ["'](.*?)["']/);
    plugin_name = comand[0].replace(/["']/g, "").trim().split(" ")[0];
    if (!plugin_name) {
     plugin_name = "__" + Math.random().toString(36).substring(8);
    }
    fs.writeFileSync(__dirname + "/" + plugin_name + ".js", data);
    try {
     require("./" + plugin_name);
    } catch (e) {
     fs.unlinkSync(__dirname + "/" + plugin_name + ".js");
     return await message.sendMessage(message.jid, "Invalid Plugin\n ```" + e + "```");
    }

    await installPlugin(url, plugin_name);

    await message.sendMessage(message.jid, `_New plugin installed : ${plugin_name}_`);
   }
  } catch (error) {
   console.error(error);
   return await message.sendMessage(message.jid, "Failed to fetch plugin");
  }
 }
);

Module({ pattern: "plugin", fromMe: true, desc: "plugin list", type: "system" }, async (message, match) => {
 var mesaj = "";
 var plugins = await PluginDB.findAll();
 if (plugins.length < 1) {
  return await message.sendMessage(message.jid, "_No external plugins installed_");
 } else {
  plugins.map(plugin => {
   mesaj += "```" + plugin.dataValues.name + "```: " + plugin.dataValues.url + "\n";
  });
  return await message.sendMessage(message.jid, mesaj);
 }
});

Module(
 {
  pattern: "remove",
  fromMe: true,
  desc: "Remove external plugins",
  type: "system",
 },
 async (message, match) => {
  if (!match) return await message.sendMessage(message.jid, "_Need a plugin name_");

  var plugin = await PluginDB.findAll({ where: { name: match } });

  if (plugin.length < 1) {
   return await message.sendMessage(message.jid, "_Plugin not found_");
  } else {
   await plugin[0].destroy();
   delete require.cache[require.resolve("./" + match + ".js")];
   fs.unlinkSync(__dirname + "/" + match + ".js");
   await message.sendMessage(message.jid, `Plugin ${match} deleted`);
  }
 }
);

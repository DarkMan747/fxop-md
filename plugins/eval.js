const { Module } = require("../lib");
Module(
 {
  on: "text",
  fromMe: true,
  dontAddCommandList: true,
 },
 async (message, match, m, client) => {
  const content = message.text;
  if (!content) return;
  if (!(content.startsWith(">") || content.startsWith("$") || content.startsWith("|"))) return;

  const evalCmd = content.slice(1).trim();

  try {
   let result;
   const scope = {
    message,
    match,
    m,
    client,
   };
   result = await (async function () {
    const { message, match, m, client } = scope;
    return eval(evalCmd);
   })();
   if (typeof result === "function") {
    await message.reply(result.toString());
   } else if (typeof result !== "undefined") {
    await message.reply(require("util").inspect(result, { depth: 2 }) || "No result");
   } else {
    await message.reply("No result");
   }
  } catch (error) {
   await message.reply(`Error: ${error.message}`);
  }
 }
);

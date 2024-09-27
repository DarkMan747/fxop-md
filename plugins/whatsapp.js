const { Module, mode, parsedJid, loadMessage, serialize, getName } = require("../lib");
const { DELETED_LOG_CHAT, DELETED_LOG } = require("../config");

Module(
 {
  pattern: "save ?(.*)",
  fromMe: true,
  desc: "Saves WhatsApp Status",
  type: "whatsapp",
 },
 async (message, match, m, client) => {
  if (!message.reply_message?.image && !message.reply_message.video && !message.reply_message.audio) return await message.sendReply("_Reply Status_");
  await message.forward(message.user, m.quoted.message);
 }
);

Module(
 {
  pattern: "jid",
  fromMe: true,
  desc: "Give jid of chat/user",
  type: "whatsapp",
 },
 async (message, match) => {
  return await message.sendMessage(message.jid, message.mention[0] || message.reply_message.jid || message.jid);
 }
);

Module(
 {
  pattern: "setname",
  fromMe: true,
  desc: "Set User name",
  type: "whatsapp",
 },
 async (message, match) => {
  if (!match) return await message.reply("_Enter name_");
  await message.updateName(match);
  return await message.reply(`_Username Updated : ${match}_`);
 }
);

Module(
 {
  pattern: "del",
  fromMe: true,
  desc: "deletes a message in Group",
  type: "whatsapp",
 },
 async (message, match, m, client) => {
  if (message.isGroup) {
   client.sendMessage(message.jid, { delete: message.reply_message.key });
  }
 }
);

Module(
 {
  pattern: "setpp",
  fromMe: true,
  desc: "Set profile picture",
  type: "whatsapp",
 },
 async (message, match, m, client) => {
  if (!message.reply_message.image) return await message.reply("_Reply Image_");
  let buff = await m.quoted.download();
  await message.setPP(message.user, buff);
  return await message.reply("_Profile Picture Updated_");
 }
);

Module(
 {
  pattern: "edit ?(.*)",
  fromMe: true,
  desc: "Edit message sent by the bot",
  type: "whatsapp",
 },
 async (message, match, m, client) => {
  if (!message.reply_message) return await message.reply("_Reply to a message_");
  const repliedMessage = message.reply_message;
  const messageKey = repliedMessage.key;
  await repliedMessage.edit(match, { key: messageKey });
 }
);

Module(
 {
  pattern: "dlt",
  fromMe: true,
  desc: "Deletes a message",
  type: "whatsapp",
 },
 async (message, match, m, client) => {
  if (!message.reply_message) return await message.reply("_Reply Message From You Only!_");
  await client.sendMessage(message.jid, { delete: message.reply_message.key });
 }
);

Module(
 {
  pattern: "block",
  fromMe: true,
  desc: "Block a person",
  type: "whatsapp",
 },
 async (message, match) => {
  if (message.isGroup) {
   let jid = message.mention[0] || message.reply_message.jid;
   if (!jid) return await message.reply("_Reply or Mention Someone_");
   await message.block(jid);
   return await message.sendMessage(`_@${jid.split("@")[0]} Blocked_`, {
    mentions: [jid],
   });
  } else {
   await message.reply("_Blocked_");
   return await message.block(message.jid);
  }
 }
);

Module(
 {
  pattern: "unblock",
  fromMe: true,
  desc: "Unblock a person",
  type: "whatsapp",
 },
 async (message, match) => {
  if (message.isGroup) {
   let jid = message.mention[0] || message.reply_message.jid;
   if (!jid) return await message.reply("_Reply to a person or mention_");
   await message.block(jid);
   return await message.sendMessage(message.jid, `_@${jid.split("@")[0]} unblocked_`, {
    mentions: [jid],
   });
  } else {
   await message.reply("_Unblocked_");
   return await message.unblock(message.jid);
  }
 }
);

Module(
 {
  pattern: "forward ?(.*)",
  fromMe: mode,
  desc: "Forwards the replied message (any type)",
  type: "whatsapp",
 },
 async (message, match, m) => {
  if (!m.quoted) return await message.reply("Reply to a message to forward");
  const jids = parsedJid(match);
  for (const jid of jids) {
   await message.forward(jid, m.quoted.message);
  }
 }
);

Module(
 {
  pattern: "quoted",
  fromMe: mode,
  desc: "quoted message",
  type: "whatsapp",
 },
 async (message, match) => {
  if (!message.reply_message) return await message.reply("*Reply to a message*");
  let key = message.reply_message.key;
  let msg = await loadMessage(key.id);
  if (!msg) return await message.reply("_Message not found maybe bot might not be running at that time_");
  msg = await serialize(JSON.parse(JSON.stringify(msg.message)), message.client);
  if (!msg.quoted) return await message.reply("No quoted message found");
  await message.forward(message.jid, msg.quoted.message);
 }
);

Module(
 {
  pattern: "vv",
  fromMe: mode,
  desc: "Forwards The View once messsage",
  type: "whatsapp",
 },
 async (message, match, m) => {
  let buff = await m.quoted.download();
  return await message.sendFile(buff);
 }
);

Module(
 {
  on: "delete",
  fromMe: false,
  desc: "Logs the recent deleted message",
 },
 async (message, match) => {
  if (!DELETED_LOG) return;
  if (!DELETED_LOG_CHAT) return await message.sendMessage(message.user, "Please set DELETED_LOG_CHAT in ENV to use log delete message");
  let msg = await loadMessage(message.messageId);
  if (!msg) return;
  msg = await serialize(JSON.parse(JSON.stringify(msg.message)), message.client);
  if (!msg) return await message.reply("No deleted message found");
  let deleted = await message.forward(DELETED_LOG_CHAT, msg.message);
  var name;
  if (!msg.from.endsWith("@g.us")) {
   let getname = await getName(msg.from);
   name = `_Name : ${getname}_`;
  } else {
   let gname = (await message.client.groupMetadata(msg.from)).subject;
   let getname = await getName(msg.sender);
   name = `_Group : ${gname}_\n_Name : ${getname}_`;
  }
  return await message.sendMessage(DELETED_LOG_CHAT, `_Message Deleted_\n_From : ${msg.from}_\n${name}\n_SenderJid : ${msg.sender}_`, { quoted: deleted });
 }
);

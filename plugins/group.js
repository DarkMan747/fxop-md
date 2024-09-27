const { Module, mode, isAdmin, parsedJid, banUser, unbanUser, isBanned, setMessage, getMessage, delMessage, getStatus, toggleStatus } = require("../lib/");

Module(
 {
  on: "message",
  fromMe: false,
  dontAddCommandList: true,
 },
 async (message, match) => {
  if (!message.isBaileys) return;
  const isban = await isBanned(message.jid);
  if (!isban) return;
  await message.reply("_Bot is banned in this chat_");
  const jid = parsedJid(message.participant);
  return await message.client.groupParticipantsUpdate(message.jid, jid, "remove");
 }
);

Module(
 {
  pattern: "banbot",
  fromMe: true,
  desc: "ban bot from a chat",
  type: "group",
 },
 async (message, match) => {
  const chatid = message.jid;
  const isban = await isBanned(chatid);
  if (isban) {
   return await message.sendMessage(message.jid, "Bot is already banned");
  }
  await banUser(chatid);
  return await message.sendMessage(message.jid, "Bot banned");
 }
);

Module(
 {
  pattern: "unbanbot",
  fromMe: true,
  desc: "Unban bot from a chat",
  type: "group",
 },
 async (message, match) => {
  const chatid = message.jid;
  const isban = await isBanned(chatid);
  if (!isban) {
   return await message.sendMessage(message.jid, "Bot is not banned");
  }
  await unbanUser(chatid);
  return await message.sendMessage(message.jid, "Bot unbanned");
 }
);

Module(
 {
  pattern: "welcome",
  fromMe: true,
  desc: "description",
  type: "group",
 },
 async (message, match) => {
  if (!message.isGroup) return;
  let { prefix } = message;
  let status = await getStatus(message.jid, "welcome");
  let stat = status ? "on" : "off";

  if (!match) {
   let replyMsg = `Welcome manager\n\nGroup: ${(await message.client.groupMetadata(message.jid)).subject}\nStatus: ${stat}\n\nAvailable Actions:\n\n- ${prefix}welcome get: Get the welcome message\n- ${prefix}welcome on: Enable welcome message\n- ${prefix}welcome off: Disable welcome message\n- ${prefix}welcome delete: Delete the welcome message`;

   return await message.reply(replyMsg);
  }

  if (match === "get") {
   let msg = await getMessage(message.jid, "welcome");
   if (!msg) return await message.reply("_There is no welcome set_");
   return message.reply(msg.message);
  }

  if (match === "on") {
   let msg = await getMessage(message.jid, "welcome");
   if (!msg) return await message.reply("_There is no welcome message to enable_");
   if (status) return await message.reply("_Welcome already enabled_");
   await toggleStatus(message.jid);
   return await message.reply("_Welcome enabled_");
  }

  if (match === "off") {
   if (!status) return await message.reply("_Welcome already disabled_");
   await toggleStatus(message.jid, "welcome");
   return await message.reply("_Welcome disabled_");
  }

  if (match == "delete") {
   await delMessage(message.jid, "welcome");
   return await message.reply("_Welcome deleted successfully_");
  }
  await setMessage(message.jid, "welcome", match);
  return await message.reply("_Welcome set successfully_");
 }
);

Module(
 {
  pattern: "goodbye",
  fromMe: true,
  desc: "description",
  type: "group",
 },
 async (message, match) => {
  if (!message.isGroup) return;
  let status = await getStatus(message.jid, "goodbye");
  let stat = status ? "on" : "off";
  let replyMsg = `Goodbye manager\n\nGroup: ${(await message.client.groupMetadata(message.jid)).subject}\nStatus: ${stat}\n\nAvailable Actions:\n\n- goodbye get: Get the goodbye message\n- goodbye on: Enable goodbye message\n- goodbye off: Disable goodbye message\n- goodbye delete: Delete the goodbye message`;

  if (!match) {
   return await message.reply(replyMsg);
  }

  if (match === "get") {
   let msg = await getMessage(message.jid, "goodbye");
   if (!msg) return await message.reply("_There is no goodbye set_");
   return message.reply(msg.message);
  }

  if (match === "on") {
   await toggleStatus(message.jid, "goodbye");
   return await message.reply("_Goodbye enabled_");
  }

  if (match === "off") {
   await toggleStatus(message.jid);
   return await message.reply("_Goodbye disabled_");
  }

  if (match === "delete") {
   await delMessage(message.jid, "goodbye");
   return await message.reply("_Goodbye deleted successfully_");
  }

  await setMessage(message.jid, "goodbye", match);
  return await message.reply("_Goodbye set successfully_");
 }
);

Module(
 {
  pattern: "add",
  fromMe: true,
  desc: "add a person to group",
  type: "group",
 },
 async (message, match) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");

  match = match || message.reply_message.jid;
  if (!match) return await message.reply("_Mention user to add");

  const isadmin = await isAdmin(message.jid, message.user, message.client);

  if (!isadmin) return await message.reply("_I'm not admin_");
  const jid = parsedJid(match);

  await message.client.groupParticipantsUpdate(message.jid, jid, "add");

  return await message.reply(`_@${jid[0].split("@")[0]} added_`, {
   mentions: [jid],
  });
 }
);

Module(
 {
  pattern: "kick",
  fromMe: true,
  desc: "kicks a person from group",
  type: "group",
 },
 async (message, match) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");

  match = match || message.reply_message.jid;
  if (!match) return await message.reply("_Mention user to kick_");

  const isadmin = await isAdmin(message.jid, message.user, message.client);

  if (!isadmin) return await message.reply("_I'm not admin_");
  const jid = parsedJid(match);

  await message.client.groupParticipantsUpdate(message.jid, jid, "remove");

  return await message.reply(`_@${jid[0].split("@")[0]} kicked_`, {
   mentions: [jid],
  });
 }
);
Module(
 {
  pattern: "promote",
  fromMe: true,
  desc: "promote to admin",
  type: "group",
 },
 async (message, match) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");

  match = match || message.reply_message.jid;
  if (!match) return await message.reply("_Mention user to promote_");

  const isadmin = await isAdmin(message.jid, message.user, message.client);

  if (!isadmin) return await message.reply("_I'm not admin_");
  const jid = parsedJid(match);

  await message.client.groupParticipantsUpdate(message.jid, jid, "promote");

  return await message.reply(`_@${jid[0].split("@")[0]} promoted as admin_`, {
   mentions: [jid],
  });
 }
);
Module(
 {
  pattern: "demote",
  fromMe: true,
  desc: "demote from admin",
  type: "group",
 },
 async (message, match) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");

  match = match || message.reply_message.jid;
  if (!match) return await message.reply("_Mention user to demote_");

  const isadmin = await isAdmin(message.jid, message.user, message.client);

  if (!isadmin) return await message.reply("_I'm not admin_");
  const jid = parsedJid(match);

  await message.client.groupParticipantsUpdate(message.jid, jid, "demote");

  return await message.reply(`_@${jid[0].split("@")[0]} demoted from admin_`, {
   mentions: [jid],
  });
 }
);

Module(
 {
  pattern: "mute",
  fromMe: true,
  desc: "nute group",
  type: "group",
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");
  await message.reply("_Muting_");
  return await client.groupSettingUpdate(message.jid, "announcement");
 }
);

Module(
 {
  pattern: "unmute",
  fromMe: true,
  desc: "unmute group",
  type: "group",
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");
  await message.reply("_Unmuting_");
  return await client.groupSettingUpdate(message.jid, "not_announcement");
 }
);

Module(
 {
  pattern: "gjid",
  fromMe: true,
  desc: "gets jid of all group members",
  type: "group",
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");
  let { participants } = await client.groupMetadata(message.jid);
  let participant = participants.map(u => u.id);
  let str = "╭──〔 *Group Jids* 〕\n";
  participant.forEach(result => {
   str += `├ *${result}*\n`;
  });
  str += `╰──────────────`;
  message.reply(str);
 }
);

Module(
 {
  pattern: "tagall",
  fromMe: true,
  desc: "mention all users in group",
  type: "group",
 },
 async (message, match) => {
  if (!message.isGroup) return;
  const { participants } = await message.client.groupMetadata(message.jid);
  let teks = "";
  for (let mem of participants) {
   teks += ` @${mem.id.split("@")[0]}\n`;
  }
  message.sendMessage(message.jid, teks.trim(), {
   mentions: participants.map(a => a.id),
  });
 }
);

Module(
 {
  pattern: "tag",
  fromMe: true,
  desc: "mention all users in group",
  type: "group",
 },
 async (message, match) => {
  console.log("match");
  match = match || message.reply_message.text;
  if (!match) return message.reply("_Enter or reply to a text to tag_");
  if (!message.isGroup) return;
  const { participants } = await message.client.groupMetadata(message.jid);
  message.sendMessage(message.jid, match, {
   mentions: participants.map(a => a.id),
  });
 }
);

Module(
 {
  pattern: "vote",
  fromMe: true,
  desc: "Create a poll in the group",
  type: "group",
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply("This command can only be used in groups.");
  if (!match) return await message.sendReply(`${message.prefix}vote Question | Option1 | Option2 | Option3`);
  const parts = match.split("|").map(part => part.trim());
  if (parts.length < 3) return await message.reply("Usage: .vote Question | Option1 | Option2 | Option3...\nMinimum 2 options are required.");
  const question = parts[0];
  const options = parts.slice(1);
  if (options.length > 12) return await message.reply("You can only have up to 12 options in a poll.");
  await client.sendMessage(message.jid, {
   poll: {
    name: question,
    values: options,
    selectableCount: 1,
   },
  });
 }
);

Module(
 {
  pattern: "gjid",
  fromMe: true,
  desc: "gets jid of all group members",
  type: "group",
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");
  let { participants } = await client.groupMetadata(message.jid);
  let participant = participants.map(u => u.id);
  let str = "╭──〔 *Group Jids* 〕\n";
  participant.forEach(result => {
   str += `├ *${result}*\n`;
  });
  str += `╰──────────────`;
  message.send(str);
 }
);

Module(
 {
  pattern: "ginfo",
  fromMe: true,
  desc: "get group info",
  type: "group",
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");
  const { subject, owner, desc, participants, creation } = await client.groupMetadata(message.jid);
  const admins = participants.filter(p => p.admin).map(p => p.id);
  const creationDate = new Date(creation * 1000).toLocaleString();
  let info = `*Group Name:* ${subject}\n`;
  info += `*Owner:* @${owner.split("@")[0]}\n`;
  info += `*Creation Date:* ${creationDate}\n`;
  info += `*Total Participants:* ${participants.length}\n`;
  info += `*Total Admins:* ${admins.length}\n`;
  info += `*Description:* ${desc || "No description"}`;
  return await message.send(info, { mentions: [owner, ...admins] });
 }
);

Module(
 {
  pattern: "admins",
  fromMe: true,
  desc: "get group admins",
  type: "group",
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");
  const { participants } = await client.groupMetadata(message.jid);
  const admins = participants.filter(p => p.admin).map(p => p.id);
  let adminList = "*Group Admins:*\n";
  admins.forEach((admin, index) => {
   adminList += `${index + 1}. @${admin.split("@")[0]}\n`;
  });
  return await message.sendMessage(message.chat, adminList, { mentions: admins });
 }
);

Module(
 {
  pattern: "gdesc",
  fromMe: true,
  desc: "change group description",
  type: "group",
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");
  if (!match) return await message.reply("_Provide the new group description_");
  await client.groupUpdateDescription(message.jid, match);
  return await message.reply("_Group description updated_");
 }
);

Module(
 {
  pattern: "gname",
  fromMe: true,
  desc: "change group name",
  type: "group",
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");
  if (!match) return await message.reply("_Provide the new group name_");
  await client.groupUpdateSubject(message.jid, match);
  return await message.reply("_Group name updated_");
 }
);

Module(
 {
  pattern: "gpp",
  fromMe: true,
  desc: "change group profile picture",
  type: "group",
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");
  if (!isAdmin(message.jid, message.user, client)) return await message.reply("_I'm not admin_");
  if (!message.reply_message || !message.reply_message.image) return await message.reply("_Reply to an image to set as group profile picture_");
  const media = await m.quoted.download();
  await client.updateProfilePicture(message.jid, media);
  return await message.reply("_Group profile picture updated_");
 }
);

Module(
 {
  pattern: "requests",
  fromMe: true,
  desc: "view join requests",
  type: "group",
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");
  if (!isAdmin(message.jid, message.user, client)) return await message.reply("_I need to be an admin to view join requests_");
  const requests = await client.groupRequestParticipantsList(message.jid);
  if (requests.length === 0) return await message.reply("_No pending join requests_");
  let requestList = "*Pending Join Requests:*\n";
  requests.forEach((request, index) => {
   requestList += `${index + 1}. @${request.jid.split("@")[0]}\n`;
  });
  await message.send(requestList, { mentions: requests.map(r => r.jid) });
 }
);

Module(
 {
  pattern: "accept",
  fromMe: true,
  desc: "accept join request",
  type: "group",
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");
  if (!match) return await message.reply("_Provide the number or mention the user to accept_");
  const jid = parsedJid(match)[0];
  await client.groupRequestParticipantsUpdate(message.jid, [jid], "approve");
  return await message.sendMessage(message.chat, `_@${jid.split("@")[0]} accepted to the group_`, { mentions: [jid] });
 }
);

Module(
 {
  pattern: "reject",
  fromMe: true,
  desc: "reject join request",
  type: "group",
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");
  if (!match) return await message.reply("_Provide the number or mention the user to reject_");
  const jid = parsedJid(match)[0];
  await client.groupRequestParticipantsUpdate(message.jid, [jid], "reject");
  return await message.sebdMessage(message.chat, `_@${jid.split("@")[0]} rejected from the group_`, { mentions: [jid] });
 }
);

Module(
 {
  pattern: "common",
  fromMe: true,
  desc: "find common participants between two groups",
  type: "group",
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");
  if (!match) return await message.reply("_Provide the JID of another group to compare_");

  const group1 = message.jid;
  const group2 = match.trim();
  const [metadata1, metadata2] = await Promise.all([client.groupMetadata(group1), client.groupMetadata(group2)]);
  const participants1 = new Set(metadata1.participants.map(p => p.id));
  const participants2 = new Set(metadata2.participants.map(p => p.id));
  const commonParticipants = [...participants1].filter(p => participants2.has(p));

  if (commonParticipants.length === 0) return await message.reply("_No common participants found between the two groups_");
  let commonList = "*Common Participants:*\n";
  commonParticipants.forEach((participant, index) => {
   commonList += `${index + 1}. @${participant.split("@")[0]}\n`;
  });
  return await message.send(commonList, { mentions: commonParticipants });
 }
);
Module(
 {
  pattern: "diff",
  fromMe: true,
  desc: "find participants in one group but not in another",
  type: "group",
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");
  if (!match) return await message.reply("_Provide the JID of another group to compare_");

  const group1 = message.jid;
  const group2 = match.trim();
  const [metadata1, metadata2] = await Promise.all([client.groupMetadata(group1), client.groupMetadata(group2)]);
  const participants1 = new Set(metadata1.participants.map(p => p.id));
  const participants2 = new Set(metadata2.participants.map(p => p.id));
  const uniqueParticipants = [...participants1].filter(p => !participants2.has(p));
  if (uniqueParticipants.length === 0) return await message.reply("_No unique participants found in this group_");
  let uniqueList = "*Participants unique to this group:*\n";
  uniqueParticipants.forEach((participant, index) => {
   uniqueList += `${index + 1}. @${participant.split("@")[0]}\n`;
  });

  return await message.sendMessage(message.chat, uniqueList, { mentions: uniqueParticipants });
 }
);

Module(
 {
  pattern: "invite",
  fromMe: true,
  desc: "Generate invite link for the current group",
  type: "group",
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply("_This command is for groups_");
  const groupMetadata = await client.groupMetadata(message.jid);
  const isUserAdmin = await isAdmin(message.jid, message.participant, client);
  if (!isUserAdmin) return await message.reply("_You need to be an admin to use this command_");
  const inviteCode = await client.groupInviteCode(message.jid);
  const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

  const replyMessage = `*Group Invite Link*\n\n` + `*Group:* ${groupMetadata.subject}\n` + `*Link:* ${inviteLink}\n`;

  return await message.send(replyMessage);
 }
);

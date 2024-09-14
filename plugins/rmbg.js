const { Module, mode, removeBg } = require("../lib/");
const config = require("../config");
Module(
	{
		pattern: "rmbg",
		fromMe: mode,
		desc: "Remove background of an image",
		type: "misc",
	},
	async (message, match, m) => {
		if (!config.RMBG_API_KEY) return await message.sendMessage(message.jid, "Set RemoveBg API Key in config.js \n Get it from https://www.remove.bg/api");
		if (!message.reply_message && !message.reply_message.image) return await message.reply("Reply to an image");
		let buff = await m.quoted.download();
		let buffer = await removeBg(buff);
		if (!buffer) return await message.reply("An error occured");
		await message.sendMessage(
			message.jid,
			buffer,
			{
				quoted: message.reply_message.key,
				mimetype: "image/png",
				fileName: "removebg.png",
			},
			"document",
		);
	},
);
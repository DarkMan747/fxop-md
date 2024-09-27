const express = require("express");
const { join } = require("path");
const { requireJS, retrivePlugins, client } = require("./lib");
const config = require("./config");
const app = express();

app.get("/", (req, res) => res.json({ version: require("./package.json").version }));
app.listen(8000, async () => {
 (await new Promise(res => setTimeout(res, 2500))) && config.DATABASE.sync();
 (await requireJS(join(__dirname, "./lib/Client/Stores/"))) && (await requireJS(join(__dirname, "./plugins/"))) && (await retrivePlugins());
 return await client();
});

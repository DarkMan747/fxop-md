const express = require("express");
const { requireJS, retrivePlugins, client } = require("./lib");
const config = require("./config");
const app = express();

app.get("/", (req, res) => res.json({ message: "Bot connected" }));

module.exports = app.listen(8000, async () => {
 (await new Promise(res => setTimeout(res, 2500))) && config.DATABASE.sync();
 (await requireJS("./lib/Client/Stores/")) && (await requireJS("./plugins/"));
 await retrivePlugins();
 return await client();
});
app();

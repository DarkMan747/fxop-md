const express = require("express");
const { requireJS, retrivePlugins, client, sleep } = require("./lib");
const config = require("./config");
const app = express();

app.get("/", (req, res) => res.json({ message: "Bot connected" }));

module.exports = app.listen(8000, async () => {
 await requireJS("./lib/Client/Stores/");
 await sleep(3000);
 await config.DATABASE.sync();
 await requireJS("./plugins/");
 await retrivePlugins();
 await client();
});
app();

const express = require("express");
const path = require("node:path");
const router = require("./routes/membersRouter.js");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// require("./passport/passport")(passport);
// app.use(passport.initialize());

app.use("/", router);

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Listening on ${port}`));

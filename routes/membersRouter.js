const { Router } = require("express");
const router = Router();
const passport = require("passport");
const pool = require("../db/database");
const { validPassword, issueJWT } = require("../utils/passwordUtils");
const {
  validateUser,
  createUserPost,
  createUserGet,
  logInGet,
  logInPost,
  // updateMemStatusGet,
  // updateMemStatusPost,
} = require("../controllers/membersController");
const { cookieJwtAuth } = require("./middleware/cookieJwtAuth");

router.get("/", (req, res) => res.status(201).json({ msg: "heyy" }));

router.get("/sign-up", createUserGet);
router.post("/sign-up", createUserPost);

router.get("/log-in", logInGet);
router.post("/log-in", logInPost);

router.get("/protected", cookieJwtAuth, (req, res, next) => {
  res.status(200).json({
    msg: "If you get this data, you have been authenticated via JWT!",
  });
});

module.exports = router;

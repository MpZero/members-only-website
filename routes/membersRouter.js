const { Router } = require("express");
const router = Router();
const passport = require("passport");
const pool = require("../db/database");
const {
  createUserPost,
  createUserGet,
  logInGet,
  logInPost,
  logOut,
  updateMemStatusGet,
  updateMemStatusPost,
} = require("../controllers/membersController");

const {
  getMessages,
  getCreateMessage,
  postCreateMessage,
  getMessageUpdate,
  postMessageUpdate,
} = require("../controllers/messageController");

router.get("/", (req, res) => res.status(201).render("index"));

router.get("/sign-up", createUserGet);
router.post("/sign-up", createUserPost);

router.get("/log-in", logInGet);
router.post("/log-in", logInPost);

router.use(
  passport.authenticate("jwt", {
    session: false,
    failureRedirect: "/",
  })
);

router.get("/membership", updateMemStatusGet);

router.post("/membership", updateMemStatusPost);

router.get("/message-board", getMessages);

router.get("/create-message", getCreateMessage);
router.post("/create-message", postCreateMessage);

router.get("/message-board/edit/:id", getMessageUpdate);
router.post("/message-board/edit/:id", postMessageUpdate);

router.get("/log-out", logOut);

module.exports = router;

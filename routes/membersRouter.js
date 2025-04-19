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
  logOut,
  updateMemStatusGet,
  updateMemStatusPost,
} = require("../controllers/membersController");

const {
  getMessages,
  createMessageGet,
  createMessagePost,
} = require("../controllers/messageController");
// const { getMessages } = require("../controllers/messageController");
// const { cookieJwtAuth } = require("./middleware/cookieJwtAuth");

router.get("/", (req, res) => res.status(201).render("index"));

router.get("/sign-up", createUserGet);
router.post("/sign-up", createUserPost);

router.get("/log-in", logInGet);
router.post("/log-in", logInPost);

router.use(passport.authenticate("jwt", { session: false }));

router.get(
  "/membership",
  // passport.authenticate("jwt", { session: false }),
  updateMemStatusGet
);

router.post(
  "/membership",
  // passport.authenticate("jwt", { session: false }),
  updateMemStatusPost
);

router.get("/message-board", getMessages);

router.get("/create-message", createMessageGet);
router.post("/create-message", createMessagePost);

// router.get("/message-board", getMessages);

router.get(
  "/protected",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.status(200).json({
      success: true,
      msg: "You are successfully authenticated to this route!",
      user: req.user,
      // token: req.cookies.jwt,
    });
  }
);

router.get("/log-out", logOut);

module.exports = router;

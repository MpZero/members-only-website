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
  updateMemStatusGet,
  // updateMemStatusGet,
  // updateMemStatusPost,
} = require("../controllers/membersController");
const { cookieJwtAuth } = require("./middleware/cookieJwtAuth");

router.get("/", (req, res) => res.status(201).json({ msg: "heyy" }));

router.get("/sign-up", createUserGet);
router.post("/sign-up", createUserPost);

router.get("/log-in", logInGet);
router.post("/log-in", logInPost);

router.get(
  "/membership",
  passport.authenticate("jwt", { session: false }),
  updateMemStatusGet
);

router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.status(200).json({
      success: true,
      msg: "You are successfully authenticated to this route!",
      user: req.user,
    });
  }
);

module.exports = router;

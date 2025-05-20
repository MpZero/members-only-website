const pool = require("../db/database.js");
const { body, validationResult } = require("express-validator");
const {
  genPassword,
  validPassword,
  issueJWT,
} = require("../utils/passwordUtils");
require("dotenv").config();

const validateUser = [
  body("firstName").trim().isLength({ min: 1, max: 15 }),
  body("lastName").trim().isLength({ min: 1, max: 15 }),
  body("username").trim().isLength({ min: 1, max: 20 }),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match with password");
    }
    return true;
  }),
];

function createUserGet(req, res) {
  res.render("signUp", {
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    title: "Create User",
    errors: [],
  });
}

const createUserPost = [
  validateUser,
  async (req, res, next) => {
    const errors = validationResult(req);

    const { firstName, lastName, username, password } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).render("signUp", {
        firstName: firstName || "",
        lastName: lastName || "",
        username: username || "",
        password: password || "",
        title: "Create user" || "",
        errors: errors.array(),
      });
    }

    try {
      const hashedPassword = await genPassword(password);

      const newUser = await pool.query(
        "INSERT INTO users (first_name, last_name, username, password, mem_status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [firstName, lastName, username, hashedPassword, false]
      );

      const user = newUser.rows[0];

      return res.render("logIn", {
        title: "Create User",
        username: user.username,
      });
    } catch (err) {
      return res.status(400).render("signUp", {
        firstName: firstName || "",
        lastName: lastName || "",
        username: username || "",
        password: password || "",
        title: "Create user" || "",
        errors: [{ msg: "Username already exists" }],
      });
    }
  },
];

function logInGet(req, res) {
  res.render("logIn", {
    username: "",
    password: "",
    title: "Log In",
    errors: [],
  });
}

const logInPost = async function (req, res, next) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE username = $1;",
    [req.body.username]
  );
  const user = rows[0];

  try {
    if (!user) {
      return res.status(401).render("logIn", {
        title: "Log In",
        errors: [{ msg: "Could not find user!" }],
        username: req.body.username,
      });
    }

    const isValid = await validPassword(req.body.password, user.password);

    if (!isValid) {
      return res.status(401).render("logIn", {
        title: "Log In",
        errors: [{ msg: "You entered the wrong password!" }],
        username: req.body.username,
      });
    }

    const tokenObject = issueJWT(user);

    res.cookie("jwt", tokenObject.token.split(" ")[1], {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect("/message-board");
  } catch (err) {
    next(err);
  }
};

const logOut = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res.redirect("/");
};

const updateMemStatusGet = (req, res) => {
  res.render("updateMem", { title: "Update Membership" });
};

const updateMemStatusPost = async (req, res) => {
  const passcode = req.body.password;
  try {
    if (passcode == process.env.SECRET_PW) {
      await pool.query(
        "UPDATE users SET mem_status = true WHERE users_id = $1",
        [req.user.users_id]
      );
      return res.redirect("/message-board");
    } else {
      return res.status(400).render("updateMem", {
        title: "Update Membership",
        errors: [{ msg: "Invalid password" }],
      });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Server error", error });
  }
};

module.exports = {
  validateUser,
  createUserGet,
  createUserPost,
  logInGet,
  logInPost,
  logOut,
  updateMemStatusGet,
  updateMemStatusPost,
};

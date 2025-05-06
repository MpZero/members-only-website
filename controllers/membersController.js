const pool = require("../db/database.js");
const { body, validationResult } = require("express-validator");
const {
  genPassword,
  validPassword,
  issueJWT,
} = require("../utils/passwordUtils");
require("dotenv").config();
const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 15 characters.";

const validateUser = [
  body("firstName")
    .trim()
    .isAlpha()
    .withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 15 })
    .withMessage(`First name ${lengthErr}`),
  body("lastName")
    .trim()
    .isAlpha()
    .withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 15 })
    .withMessage(`Last name ${lengthErr}`),
  body("username")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage(`Username ${lengthErr}`),
  body("confirmPassword").custom((value, { req }) => {
    // console.log(`value: ${value}`);
    // console.log(`req body password: ${req.body.password}`);
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
    console.log("Received req.body:", req.body);

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
      const jwt = issueJWT(user);

      res.json({
        success: true,
        user: user,
        token: jwt.token,
        expiresIn: jwt.expires,
      });
    } catch (err) {
      return next(err);
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

  // console.log(`1. log in user`, user);

  try {
    if (!user) {
      return res
        .status(401)
        .json({ success: false, msg: "Could not find user" });
    }

    const isValid = await validPassword(req.body.password, user.password);
    // console.log(`is valid: ${isValid}`);

    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, msg: "You entered the wrong password" });
    }

    if (isValid) {
      const tokenObject = issueJWT(user);
      // console.log(`2. log in valid token`, tokenObject);

      // console.log(tokenObject.token.split(" ")[1]);
      // res.cookie("jwt", tokenObject.token, { httpOnly: true, secure: true });
      // res.cookie("jwt", tokenObject.token.split(" ")[1], {
      res.cookie("jwt", tokenObject.token.split(" ")[1], {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      // res.status(200).json({
      //   success: true,
      //   token: tokenObject.token.split(" ")[1],
      //   user: user,
      //   expiresIn: tokenObject.expires,
      // });
      return res.redirect("/message-board");
    } else {
      res
        .status(401)
        .json({ success: false, msg: "you entered the wrong password" });
    }
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
  console.log(`req user updatememget`, req.user);
};

const updateMemStatusPost = async (req, res) => {
  // console.log(`5 body`, req.body);
  const passcode = req.body.password;
  try {
    if (passcode == process.env.SECRET_PW) {
      await pool.query(
        "UPDATE users SET mem_status = true WHERE users_id = $1",
        [req.user.users_id]
      );
      console.log("succesfully became a member!");
      return res.redirect("/");
    } else {
      return res.status(400).json({ msg: "Invalid passcode" });
    }
  } catch (error) {
    console.log("incorrect pw!");
    return res.status(500).json({ msg: "Server error", error });
  }
  // console.log(`req user updatemempost`, req.user);

  // console.log(`req user updatemempost2`, req.user);

  //   console.log(`body`, req.body);
  //   console.log(`user`, req.user);

  //   const { passcode } = req.body;
  // }
  // return;

  /*   if (passcode == "oo") {
    try {
      await pool.query(
        "UPDATE users SET mem_status = true WHERE users_id = $1",
        [req.user.users_id]
      );
      return res.redirect("/");
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: "Server error" });
    }
  } else {
    return res.status(400).json({ msg: "Invalid passcode" });
  } */
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

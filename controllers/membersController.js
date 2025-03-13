const pool = require("../db/database.js");
const { body, validationResult } = require("express-validator");
const { genPassword, issueJWT } = require("../utils/passwordUtils");

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
    console.log(`value: ${value}`);
    console.log(`req body password: ${req.body.password}`);
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match with password");
    }
    return true;
  }),
];

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
        user,
        token: jwt.token,
        expiresIn: jwt.expires,
      });
    } catch (err) {
      return next(err);
    }
  },
];

module.exports = { validateUser, createUserPost };

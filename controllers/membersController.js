const pool = require("../db/database.js");
const { body, validationResult } = require("express-validator");
const { genPassword, issueJWT } = require("../utils/passwordUtils");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";

const validateUser = [
  body("firstName")
    .trim()
    .isAlpha()
    .withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`First name ${lengthErr}`),
  body("lastName")
    .trim()
    .isAlpha()
    .withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`Last name ${lengthErr}`),
  body("username")
    .trim()
    .isAlpha()
    .withMessage(`Username ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`Username ${lengthErr}`),
  // body("password")
  //   .optional({ checkFalsy: true })
  //   .isInt({ gt: 18, lt: 120 })
  //   .withMessage(`Age ${isIntErr}`),
];

const createUserPost = async (req, res, next) => {
  const { firstName, lastName, username, password } = req.body;

  try {
    console.log(req.body);

    const hashedPassword = await genPassword(password);
    // console.log(hashedPassword);
    // res.redirect("/");
    // pool.insertNewUser("INSERT INTO users (username, password) VALUES ($1, $2)", [

    pool.query(
      "INSERT INTO users (first_name, last_name, username, password, mem_status) VALUES ($1, $2, $3, $4, $5)",
      [firstName, lastName, username, hashedPassword, false]
    );

    const user = await pool.query("SELECT FROM users WHERE users_id = $1", [
      req.body.users_id,
    ]);
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
};

// try {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   await db.insertAlbum(firstName, lastName, username, password);
// } catch (error) {
//   console.log("Error creating album", error);
//   res.status(500).send("Error creating album");
// }
// }
// exports.usersCreatePost = [
//   validateUser,
//   (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).render("createUser", {
//         title: "Create user",
//         errors: errors.array(),
//       });
//     }
//     const { firstName, lastName, email, age, bio } = req.body;
//     usersStorage.addUser({ firstName, lastName, email, age, bio });
//     res.redirect("/");
//   },
// ];

// }
// ]

module.exports = { validateUser, createUserPost };

const { Router } = require("express");
const router = Router();
const passport = require("passport");
const {
  createUserPost,
  validateUser,
} = require("../controllers/membersController");

// router.get(
//   "/",
//   passport.authenticate("jwt", { session: false }),
//   (req, res, next) => {
//     res
//       .status(200)
//       .send("If you get this data, you have been authenticated via JWT!");
//   }
// );

router.get("/", (req, res) => res.status(201).json({ msg: "heyy" }));
router.get("/sign-up", (req, res) => res.render("signUp"));

router.post("/sign-up", validateUser, createUserPost);
// try {
//   console.log(req.body);
//   const hashedPassword = await genPw(req.body.password);
//   // console.log(hashedPassword);
//   // res.redirect("/");
//   pool.query("INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2)", [
//     req.body.username,
//     hashedPassword,
//   ]);
//   const user = await pool.query("SELECT FROM users WHERE id = $1", [
//     req.body.id,
//   ]);
//   const jwt = utils.issueJWT(user);
//   res.json({
//     success: true,
//     user: user,
//     token: jwt.token,
//     expiresIn: jwt.expires,
//   });
// } catch (err) {
//   return next(err);
// }

module.exports = router;

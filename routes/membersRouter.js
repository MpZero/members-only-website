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
router.get("/sign-up", (req, res) =>
  res.render("signUp", {
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    title: "Create User",
    errors: [],
  })
);
router.post("/sign-up", createUserPost);

module.exports = router;

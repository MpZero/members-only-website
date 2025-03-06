const { Router } = require("express");
const router = Router();

router.get("/", (req, res) => res.status(201).json({ msg: "heyy" }));

module.exports = router;

const fs = require("fs");
const passport = require("passport");
const path = require("path");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const db = require("../db/database");
const bcrypt = require("bcrypt");
require("dotenv").config();

const pathToKey = path.join(__dirname, "..", "id_rsa_pub.pem");
const PUB_KEY = fs.readFileSync(pathToKey, "utf8");

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: PUB_KEY,
  algorithms: ["RS256"],
};

const strategy = new JwtStrategy(options, async (payload, done) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE users_id = $1", [
      payload.sub,
    ]);

    if (result.rows && result.rows.length > 0) {
      return done(null, result.rows[0]);
    }

    return done(null, false, { message: "User not found" });
  } catch (error) {
    return done(error, null);
  }
});

/* module.exports = (passport) => {
  passport.use(strategy);
}; */

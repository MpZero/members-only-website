// // const passport = require("passport");
const fs = require("fs");
const path = require("path");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const pool = require("../db/database");
const bcrypt = require("bcrypt");
require("dotenv").config();

const pathToKey = path.join(__dirname, "..", "id_rsa_pub.pem");
const PUB_KEY = fs.readFileSync(pathToKey, "utf8");

// Authorization:

// TODO
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ["RS256"],
};

const strategy = new JwtStrategy(options, async (payload, done) => {
  // console.log(payload);

  try {
    const rows = pool.query("SELECT FROM user WHERE id = $1", [payload.sub]);
    if (rows) {
      return done(null, rows);
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // passwords do not match!
      return done(null, false, { message: "Incorrect password" });
    }
    return done(null, false);
  } catch (error) {
    return done(error, null);
  }
});

// TODO
module.exports = (passport) => {
  passport.use(strategy);
};

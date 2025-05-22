const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// const pathToKey = path.join(__dirname, "..", "id_rsa_priv.pem");
// const PRIV_KEY = fs.readFileSync(pathToKey, "utf8");

const PRIV_KEY = process.env.PRIVATE_KEY;

function issueJWT(user) {
  const id = user.users_id;

  const expiresIn = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

  const payload = {
    sub: id,
    iat: Math.floor(Date.now() / 1000),
  };
  const signedToken = jwt.sign(payload, PRIV_KEY, {
    expiresIn: expiresIn,
    algorithm: "RS256",
  });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn,
  };
}

async function validPassword(password, hash) {
  try {
    const match = await bcrypt.compare(password, hash);
    return match;
  } catch (err) {
    console.error(err);
  }
}

async function genPassword(password) {
  const generatedPw = await bcrypt.hash(password, 10);
  return generatedPw;
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;

const jsonwebtoken = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const pathToKey = path.join(__dirname, "..", "id_rsa_priv.pem");
const PRIV_KEY = fs.readFileSync(pathToKey, "utf8");

// TODO
// async function validPassword(password, hash) {
//   try {
//     const match = await bcrypt.compare(password, hash);
//     if (!match) {
//       // passwords do not match!
//       return done(null, false, { message: "Incorrect password" });
//     }

//     return done(null, user);
//   } catch (err) {
//     console.error(err);
//   }
// }

async function genPassword(password) {
  const generatedPw = await bcrypt.hash(password, 10);
  return generatedPw;
}

function issueJWT(user) {
  const id = user.id;

  const expiresIn = "1d";

  const payload = {
    sub: id,
    iat: Date.now(),
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn: expiresIn,
    algorithm: "RS256",
  });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn,
  };
}
// module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;

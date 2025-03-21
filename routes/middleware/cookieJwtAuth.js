const jwt = require("jsonwebtoken");

exports.cookieJwtAuth = (req, res, next) => {
  console.log(`req cookies`, req.cookies);

  const token = req.cookies.token;
  try {
    const user = jwt.verify(token, process.env.SECRET_PW);
    req.user = user;
    next();
  } catch (err) {
    res.clearCookie("token");
    next();
  }
};

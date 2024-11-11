import jwt from "jsonwebtoken";
const JWT_SECRET = "secret";

function auth(req, res, next) {
  const token = req.headers.authorization;
  const response = jwt.verify(token, JWT_SECRET);
  if (response) {
    req.userId = response.id;
    next();
  } else {
    res.status(403).json({
      message: "Incorrect creds",
    });
  }
}

export { auth, JWT_SECRET };

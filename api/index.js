const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getUserById } = require("../db");
const { JWT_SECRET } = process.env;

router.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const authorization = req.header("Authorization");
  if (!authorization) return next();
  if (!authorization.startsWith(prefix)) {
    return next({ status: 401, name: "AuthorizationHeaderError", message: "Authorization token must start with Bearer " });
  }
  try {
    const { id } = jwt.verify(authorization.slice(prefix.length), JWT_SECRET);
    if (!id) return next({ status: 401, name: "InvalidTokenError", message: "The token does not identify a user." });
    req.user = await getUserById(id);
    if (!req.user) return next({ status: 401, name: "InvalidTokenError", message: "The user associated with this token no longer exists." });
    return next();
  } catch (error) {
    return next({ status: 401, name: error.name, message: error.message });
  }
});

router.get("/health", (req, res) => res.send({ message: "I am healthy" }));
router.use("/users", require("./users"));
router.use("/activities", require("./activities"));
router.use("/routines", require("./routines"));
router.use("/routine_activities", require("./routineActivities"));
router.use((req, res) => res.status(404).send({ message: "Not Found" }));
router.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || (error.name === "IncorrectCredentialsError" ? 401 : 400);
  return res.status(status).send({
    error: error.name || "RequestError",
    name: error.name || "RequestError",
    message: error.message || "An unexpected error occurred",
  });
});
module.exports = router;

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { createUser, getUserByUsername, getUser, getPublicRoutinesByUser } = require("../db");
const { UserTakenError, PasswordTooShortError } = require("../errors");

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body || {};
  if (!username || !password) return next({ status: 400, name: "ValidationError", message: "Username and password are required." });
  try {
    const user = await getUser({ username, password });
    if (!user) return next({ status: 401, name: "IncorrectCredentialsError", message: "Username or password is incorrect" });
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1w" });
    return res.send({ token, user, message: "you're logged in!" });
  } catch (error) { return next(error); }
});

router.post("/register", async (req, res, next) => {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || !username.trim() || typeof password !== "string" || !password) {
    return next({ status: 400, name: "ValidationError", message: "A username and password are required." });
  }
  if (password.length < 8) return next({ status: 400, name: "PasswordTooShortError", message: PasswordTooShortError() });
  try {
    const normalizedUsername = username.trim();
    const existingUser = await getUserByUsername(normalizedUsername);
    if (existingUser) return next({ status: 409, name: "UserExistsError", message: UserTakenError(normalizedUsername) });
    const newUser = await createUser({ username: normalizedUsername, password });
    if (!newUser) return next({ status: 409, name: "UserExistsError", message: "That username is already taken." });
    const token = jwt.sign(newUser, process.env.JWT_SECRET, { expiresIn: "1w" });
    return res.send({ message: "thank you for signing up", token, user: newUser });
  } catch (error) { return next(error); }
});

router.get("/me", (req, res, next) => {
  if (!req.user) return next({ status: 401, name: "UnauthorizedError", message: "You must be logged in to perform this action" });
  return res.send(req.user);
});

router.get("/:username/routines", async (req, res, next) => {
  try {
    return res.send(await getPublicRoutinesByUser({ username: req.params.username }));
  } catch (error) { return next(error); }
});
module.exports = router;

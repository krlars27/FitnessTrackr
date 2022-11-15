/* eslint-disable no-empty */
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const {
  createUser,
  getUserByUsername,
  getUser,
  getPublicRoutinesByUser,
} = require("../db");

router.use("/", (req, res, next) => {
  next();
});

// POST /api/users/login
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await getUser({ username, password });

    if (user) {
      const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: "1w",
      });
      res.send({
        token,
        user,
        message: "you're logged in!",
      });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// POST /api/users/register
router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await getUserByUsername(username);

    if (password.length < 8) {
      next({
        error: "Password too short",
        message: "Password Too Short!",
        name: "Password too short",
      });
    }

    if (user) {
      next({
        name: "UserExistsError",
        message: `User ${username} is already taken.`,
      });
    } else {
      const newUser = await createUser({
        username,
        password,
      });

      const token = jwt.sign(newUser, process.env.JWT_SECRET, {
        expiresIn: "1w",
      });

      res.send({
        message: "thank you for signing up",
        token,
        user: newUser,
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// GET /api/users/me

router.get("/me", async (req, res, next) => {
  try {
    if (req.user) {
      res.send(req.user);
    } else {
      next({
        error: "Unauthorized",
        name: "Invalid credentials",
        message: "You must be logged in to perform this action",
      });
    }
  } catch (err) {
    console.log(err.message);
    next();
  }
});

// GET /api/users/:username/routines
router.get("/:username/routines", async (req, res, next) => {
  const username = req.params.username;

  try {
    const routines = await getPublicRoutinesByUser({ username });
    res.send(routines);
  } catch (err) {
    console.error(err.message);
    next();
  }
});

module.exports = router;

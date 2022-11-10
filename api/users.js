const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { createUser, getUserByUsername } = require("../db");

// POST /api/users/login

// POST /api/users/register
router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await getUserByUsername(username);

    if (user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    }

    const newUser = await createUser({
      username,
      password,
    });

    const token = jwt.sign(
       newUser, process.env.JWT_SECRET,
        {expiresIn: "1w",
      }
    );

    res.send({
      message: "thank you for signing up",
      token,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = router;

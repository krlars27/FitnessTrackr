const express = require("express");
const router = express.Router();
const { getAllPublicRoutines, createRoutine } = require("../db/routines");
const jwt = require("jsonwebtoken");
// GET /api/routines
router.get("/", async (req, res, next) => {
  try {
    const allRoutines = await getAllPublicRoutines();

    res.send(allRoutines);
  } catch (error) {
    next(error);
  }
});

// POST /api/routines
router.post("/", async (req, res, next) => {
  const { creatorId, isPublic, name, goal } = req.body;
console.log(creatorId, 'please work')
  try {
    const newRoutine = await createRoutine({ creatorId, isPublic, name, goal });
    if (newRoutine) {
      res.send(newRoutine);
    } else {
      console.log(newRoutine, 'hoops');
      next({
        name: "duplicate name",
        message: "You must be logged in to perform this action",
      });
    }
  } catch ({ message, name }) {
    next({ message, name });
  }
});

// PATCH /api/routines/:routineId

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = router;

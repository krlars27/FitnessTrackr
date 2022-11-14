const express = require("express");
const router = express.Router();
const { getAllPublicRoutines, createRoutine, destroyRoutine, getRoutineById, updateRoutine } = require("../db/routines");
const { addActivityToRoutine, getRoutineActivityById
 } = require('../db/routine_activities')
// const jwt = require("jsonwebtoken");
const { requireUser } = require('./utils')
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
router.post("/", requireUser, async (req, res, next) => {
  const { isPublic, name, goal } = req.body;
console.log(req.user)
  try {
    const newRoutine = await createRoutine({ creatorId:req.user.id, isPublic, name, goal });
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
router.patch("/:routineId", requireUser, async (req, res, next) => {
    try {
      const { isPublic, name, goal } = req.body;
      const routineId = req.params.routineId;
      const routine = await getRoutineById(routineId);
  
      if (routine.creatorId != req.user.id) {
        res.status(403);
        next({
          error: "error message",
          name: "User Not Found",
          message: `User ${req.user.username} is not allowed to update ${routine.name}`,
        });
      }
      const updatedRoutine = await updateRoutine({
        id: routineId,
        name,
        goal,
        isPublic
      });
      res.send(updatedRoutine);
    } catch ({ name, message }) {
      next({ name, message });
    }
  });

// DELETE /api/routines/:routineId
router.delete('/:routineId', requireUser, async (req, res, next) => {
    try {
        const routineId = req.params.routineId;
        const routine = await getRoutineById(routineId)
        
        if (routine.creatorId != req.user.id) {
          res.status(403);
          next({
            error: "error message",
            name: "Unauthorized User",
            message: `User ${req.user.username} is not allowed to delete ${routine.name}`,
          });
        }
        await destroyRoutine(routineId);
    res.send(routine);
  } catch (error) {
    next(error);
  }
});

// POST /api/routines/:routineId/activities
router.post("/:routineId/activities", requireUser, async (req, res, next) => {
  
    try {
      const {routineId} = req.params;
    const { activityId, count, duration} = req.body;
    const routine = await getRoutineActivityById(activityId);
      if (routine) {
        next({
          name: "duplicate activityId",
          message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
        })
      }else{
        const newRoutine = await addActivityToRoutine({routineId, activityId, duration, count})
        res.send(newRoutine)
    }
} catch (error) {
    next(error);
}
})

module.exports = router;

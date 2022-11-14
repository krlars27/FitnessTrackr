/* eslint-disable no-empty */
const express = require("express");
const router = express.Router();
const {
  getRoutineById,
  updateRoutineActivity,
  getRoutineActivityById,
  destroyRoutineActivity,
} = require("../db");
const { requireUser } = require("./utils");

// PATCH /api/routine_activities/:routineActivityId
router.patch("/:routineActivityId", requireUser, async (req, res, next) => {
  try {
    const { count, duration } = req.body;
    const routineActivityId = req.params.routineActivityId;
    const routine_activity = await getRoutineActivityById(routineActivityId);
    const routine = await getRoutineById(routine_activity.routineId )
    if (routine.creatorId != req.user.id) {
      res.status(403);
      next({
        error: "error message",
        name: "User Not Found",
        message: `User ${req.user.username} is not allowed to update ${routine.name}`,
      });
    }
    else{
    const updatedRoutineActivity = await updateRoutineActivity({
      id: routineActivityId,
      count,
      duration,
    });
    res.send(updatedRoutineActivity);}
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// DELETE /api/routine_activities/:routineActivityId

router.delete("/:routineActivityId", requireUser, async (req, res, next) => {
  try {
    const routineActivityId = req.params.routineActivityId;
    const routineActivity = await getRoutineActivityById(routineActivityId);

    const routine = await getRoutineById(routineActivity.routineId);
    // console.log(routineActivity)

    if (routine.creatorId != req.user.id) {
      res.status(403);
      next({
        error: "error message",
        name: "Unauthorized User",
        message: `User ${req.user.username} is not allowed to delete ${routine.name}`,
      });
    }
    await destroyRoutineActivity(routineActivityId);
    res.send(routineActivity);
  } catch ({ error, name, message }) {
    next({ error, name, message });
  }
});

module.exports = router;

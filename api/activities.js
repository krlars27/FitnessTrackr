const express = require("express");
const router = express.Router();

const {
  getAllActivities,
  createActivity,
  updateActivity,
  getActivityById,
  getActivityByName,
} = require("../db/activities");
const { getPublicRoutinesByActivity } = require("../db/routines");

// GET /api/activities/:activityId/routines
router.get("/:activityId/routines", async (req, res, next) => {
  try {
    const id = req.params.activityId;
    const activity = await getActivityById(id);
    if (!activity) {
      next({
        error: "error",
        name: "Activity not found",
        message: `Activity ${id} not found`,
      });
    } else {
      const publicRoutines = await getPublicRoutinesByActivity({ id });
      res.send(publicRoutines);
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/activities
router.get("/", async (req, res, next) => {
  try {
    const allActivities = await getAllActivities();
    console.log(allActivities, "activity");

    res.send(allActivities);
  } catch (error) {
    next(error);
  }
});

// POST /api/activities

router.post("/", async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const newActivity = await createActivity({ name, description });
    if (newActivity) {
      res.send(newActivity);
    } else {
      console.log(newActivity, "woah");
      next({
        name: "duplicate name",
        message: `An activity with name ${name} already exists`,
      });
    }
  } catch ({ message, name }) {
    next({ message, name });
  }
});

router.post("/", async (req, res, next) => {
  const body = req.body;
  console.log(body);
  try {
    const newActivity = await createActivity();

    res.send(newActivity);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/activities/:activityId

router.patch("/:activityId", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const id = req.params.activityId;
    const activity = await getActivityById(id);
    const activityName = await getActivityByName(name);

    if (!activity) {
      next({
        error: "error",
        name: "Activity not found",
        message: `Activity ${id} not found`,
      });
    } else if (activityName) {
      next({
        error: "error",
        name: "Not found",
        message: `An activity with name ${name} already exists`,
      });
    } else {
      const updatedActivity = await updateActivity({ id, name, description });
      res.send(updatedActivity);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

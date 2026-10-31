
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
const { ActivityExistsError, ActivityNotFoundError } = require("../errors");

// GET /api/activities/:activityId/routines
router.get("/:activityId/routines", async (req, res, next) => {
  try {
    const id = req.params.activityId;
    const activity = await getActivityById(id);

    if (!activity) {
      return next({
        name: "Activity not found",
        message: ActivityNotFoundError(id),
      });
    }

    const publicRoutines = await getPublicRoutinesByActivity({ id });
    res.send(publicRoutines);
  } catch (error) {
    next(error);
  }
});

// GET /api/activities
router.get("/", async (req, res, next) => {
  try {
    const allActivities = await getAllActivities();
    res.send(allActivities);
  } catch (error) {
    next(error);
  }
});

// POST /api/activities
router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return next({
        name: "Missing Required Fields",
        message: "Activity name and description are required.",
      });
    }

    const newActivity = await createActivity({ name, description });

    if (!newActivity) {
      return next({
        name: "Activity Exists",
        message: ActivityExistsError(name),
      });
    }

    res.status(201).send(newActivity);
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

    if (!activity) {
      return next({
        name: "Activity not found",
        message: ActivityNotFoundError(id),
      });
    }

    // Only check for a duplicate if the name is actually changing.
    if (name && name !== activity.name) {
      const activityName = await getActivityByName(name);

      if (activityName && String(activityName.id) !== String(id)) {
        return next({
          name: "Activity Exists",
          message: ActivityExistsError(name),
        });
      }
    }

    const updatedActivity = await updateActivity({
      id,
      name,
      description,
    });

    res.send(updatedActivity);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

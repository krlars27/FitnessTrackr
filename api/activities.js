
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
const {
  ActivityExistsError,
  ActivityNotFoundError,
} = require("../errors");

// GET /api/activities/:activityId/routines
router.get("/:activityId/routines", async (req, res, next) => {
  try {
    const id = req.params.activityId;
    const activity = await getActivityById(id);

    if (!activity) {
      return next({
        status: 404,
        name: "ActivityNotFoundError",
        message: ActivityNotFoundError(id),
      });
    }

    const publicRoutines = await getPublicRoutinesByActivity({ id });
    return res.send(publicRoutines);
  } catch (error) {
    return next(error);
  }
});

// GET /api/activities
router.get("/", async (req, res, next) => {
  try {
    const allActivities = await getAllActivities();
    return res.send(allActivities);
  } catch (error) {
    return next(error);
  }
});

// POST /api/activities
router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return next({
        status: 400,
        name: "ValidationError",
        message: "Activity name and description must be non-empty strings.",
      });
    }

    const cleanName = name.trim();
    const cleanDescription = description.trim();

    const newActivity = await createActivity({
      name: cleanName,
      description: cleanDescription,
    });

    if (!newActivity) {
      return next({
        status: 409,
        name: "ActivityExists",
        message: ActivityExistsError(cleanName),
      });
    }

    return res.status(201).send(newActivity);
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/activities/:activityId
router.patch("/:activityId", async (req, res, next) => {
  try {
    const body = req.body || {};
    const id = req.params.activityId;
    const { name, description } = body;

    const activity = await getActivityById(id);

    if (!activity) {
      return next({
        status: 404,
        name: "ActivityNotFoundError",
        message: ActivityNotFoundError(id),
      });
    }

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return next({
          status: 400,
          name: "ValidationError",
          message: "Activity name must be a non-empty string.",
        });
      }

      updates.name = name.trim();
    }

    if (description !== undefined) {
      if (
        typeof description !== "string" ||
        !description.trim()
      ) {
        return next({
          status: 400,
          name: "ValidationError",
          message: "Activity description must be a non-empty string.",
        });
      }

      updates.description = description.trim();
    }

    if (!Object.keys(updates).length) {
      return next({
        status: 400,
        name: "ValidationError",
        message: "Provide an activity name or description to update.",
      });
    }

    // Check for a duplicate only if the name is changing.
    if (updates.name && updates.name !== activity.name) {
      const activityName = await getActivityByName(updates.name);

      if (
        activityName &&
        String(activityName.id) !== String(id)
      ) {
        return next({
          status: 409,
          name: "ActivityExists",
          message: ActivityExistsError(updates.name),
        });
      }
    }

    const updatedActivity = await updateActivity({
      id,
      ...updates,
    });

    return res.send(updatedActivity);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;


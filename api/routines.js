
const express = require("express");
const router = express.Router();

const {
  getAllPublicRoutines,
  createRoutine,
  destroyRoutine,
  getRoutineById,
  updateRoutine,
} = require("../db/routines");

const {
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
} = require("../db/routine_activities");

const { requireUser } = require("./utils");

const {
  UnauthorizedUpdateError,
  UnauthorizedDeleteError,
  DuplicateRoutineActivityError,
} = require("../errors");

function validateRoutineFields(fields) {
  if (
    fields.name !== undefined &&
    (typeof fields.name !== "string" || !fields.name.trim())
  ) {
    return "Routine name must be a non-empty string.";
  }

  if (
    fields.goal !== undefined &&
    (typeof fields.goal !== "string" || !fields.goal.trim())
  ) {
    return "Routine goal must be a non-empty string.";
  }

  if (
    fields.isPublic !== undefined &&
    typeof fields.isPublic !== "boolean"
  ) {
    return "isPublic must be true or false.";
  }

  return null;
}

function validateActivityFields(fields) {
  if (
    fields.count !== undefined &&
    (typeof fields.count !== "number" ||
      !Number.isInteger(fields.count) ||
      fields.count <= 0)
  ) {
    return "Count must be a positive whole number.";
  }

  if (
    fields.duration !== undefined &&
    (typeof fields.duration !== "number" ||
      !Number.isFinite(fields.duration) ||
      fields.duration <= 0)
  ) {
    return "Duration must be a positive number.";
  }

  return null;
}

router.get("/", async (req, res, next) => {
  try {
    return res.send(await getAllPublicRoutines());
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireUser, async (req, res, next) => {
  const { isPublic = false, name, goal } = req.body || {};

  const validationError = validateRoutineFields({
    isPublic,
    name,
    goal,
  });

  if (validationError) {
    return next({
      status: 400,
      name: "ValidationError",
      message: validationError,
    });
  }

  try {
    const routine = await createRoutine({
      creatorId: req.user.id,
      isPublic,
      name: name.trim(),
      goal: goal.trim(),
    });

    return res.status(201).send(routine);
  } catch (error) {
    return next(error);
  }
});

router.patch("/:routineId", requireUser, async (req, res, next) => {
  try {
    const routine = await getRoutineById(req.params.routineId);

    if (!routine) {
      return next({
        status: 404,
        name: "RoutineNotFoundError",
        message: "Routine not found.",
      });
    }

    if (routine.creatorId !== req.user.id) {
      return next({
        status: 403,
        name: "ForbiddenError",
        message: UnauthorizedUpdateError(
          req.user.username,
          routine.name
        ),
      });
    }

    const updates = {};
    const body = req.body || {};

    for (const field of ["isPublic", "name", "goal"]) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (!Object.keys(updates).length) {
      return next({
        status: 400,
        name: "ValidationError",
        message: "Provide a routine field to update.",
      });
    }

    const validationError = validateRoutineFields(updates);

    if (validationError) {
      return next({
        status: 400,
        name: "ValidationError",
        message: validationError,
      });
    }

    if (updates.name !== undefined) {
      updates.name = updates.name.trim();
    }

    if (updates.goal !== undefined) {
      updates.goal = updates.goal.trim();
    }

    return res.send(
      await updateRoutine({ id: routine.id, ...updates })
    );
  } catch (error) {
    return next(error);
  }
});

router.delete("/:routineId", requireUser, async (req, res, next) => {
  try {
    const routine = await getRoutineById(req.params.routineId);

    if (!routine) {
      return next({
        status: 404,
        name: "RoutineNotFoundError",
        message: "Routine not found.",
      });
    }

    if (routine.creatorId !== req.user.id) {
      return next({
        status: 403,
        name: "ForbiddenError",
        message: UnauthorizedDeleteError(
          req.user.username,
          routine.name
        ),
      });
    }

    await destroyRoutine(routine.id);

    return res.send(routine);
  } catch (error) {
    return next(error);
  }
});

router.post("/:routineId/activities", requireUser, async (req, res, next) => {
  try {
    const { routineId } = req.params;
    const { activityId, count, duration } = req.body || {};

    const routine = await getRoutineById(routineId);

    if (!routine) {
      return next({
        status: 404,
        name: "RoutineNotFoundError",
        message: "Routine not found.",
      });
    }

    if (routine.creatorId !== req.user.id) {
      return next({
        status: 403,
        name: "ForbiddenError",
        message: "You can only change your own routines.",
      });
    }

    if (
      activityId === undefined ||
      activityId === null ||
      !Number.isInteger(Number(activityId)) ||
      Number(activityId) <= 0
    ) {
      return next({
        status: 400,
        name: "ValidationError",
        message: "A valid activityId is required.",
      });
    }

    const validationError = validateActivityFields({
      count,
      duration,
    });

    if (validationError) {
      return next({
        status: 400,
        name: "ValidationError",
        message: validationError,
      });
    }

    const existing = await getRoutineActivitiesByRoutine({
      id: routineId,
    });

    if (
      existing.some(
        (item) => item.activityId === Number(activityId)
      )
    ) {
      return next({
        status: 409,
        name: "DuplicateRoutineActivityError",
        message: DuplicateRoutineActivityError(
          routineId,
          activityId
        ),
      });
    }

    const item = await addActivityToRoutine({
      routineId,
      activityId: Number(activityId),
      count,
      duration,
    });

    if (!item) {
      return next({
        status: 409,
        name: "DuplicateRoutineActivityError",
        message: "That activity is already in this routine.",
      });
    }

    return res.status(201).send(item);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;


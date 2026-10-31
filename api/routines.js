const express = require("express");
const router = express.Router();
const { getAllPublicRoutines, createRoutine, destroyRoutine, getRoutineById, updateRoutine } = require("../db/routines");
const { addActivityToRoutine, getRoutineActivitiesByRoutine } = require("../db/routine_activities");
const { requireUser } = require("./utils");

router.get("/", async (req, res, next) => {
  try { return res.send(await getAllPublicRoutines()); }
  catch (error) { return next(error); }
});
router.post("/", requireUser, async (req, res, next) => {
  const { isPublic = false, name, goal } = req.body || {};
  if (typeof name !== "string" || !name.trim() || typeof goal !== "string" || !goal.trim()) {
    return next({ status: 400, name: "ValidationError", message: "Routine name and goal are required." });
  }
  try {
    const routine = await createRoutine({ creatorId: req.user.id, isPublic: Boolean(isPublic), name: name.trim(), goal: goal.trim() });
    return res.status(201).send(routine);
  } catch (error) { return next(error); }
});
router.patch("/:routineId", requireUser, async (req, res, next) => {
  try {
    const routine = await getRoutineById(req.params.routineId);
    if (!routine) return next({ status: 404, name: "RoutineNotFoundError", message: "Routine not found." });
    if (routine.creatorId !== req.user.id) return next({ status: 403, name: "ForbiddenError", message: "You can only update your own routines." });
    const updates = {};
    for (const field of ["isPublic", "name", "goal"]) if (req.body[field] !== undefined) updates[field] = req.body[field];
    if (!Object.keys(updates).length) return next({ status: 400, name: "ValidationError", message: "Provide a routine field to update." });
    return res.send(await updateRoutine({ id: routine.id, ...updates }));
  } catch (error) { return next(error); }
});
router.delete("/:routineId", requireUser, async (req, res, next) => {
  try {
    const routine = await getRoutineById(req.params.routineId);
    if (!routine) return next({ status: 404, name: "RoutineNotFoundError", message: "Routine not found." });
    if (routine.creatorId !== req.user.id) return next({ status: 403, name: "ForbiddenError", message: "You can only delete your own routines." });
    await destroyRoutine(routine.id);
    return res.send(routine);
  } catch (error) { return next(error); }
});
router.post("/:routineId/activities", requireUser, async (req, res, next) => {
  try {
    const { routineId } = req.params;
    const { activityId, count, duration } = req.body || {};
    const routine = await getRoutineById(routineId);
    if (!routine) return next({ status: 404, name: "RoutineNotFoundError", message: "Routine not found." });
    if (routine.creatorId !== req.user.id) return next({ status: 403, name: "ForbiddenError", message: "You can only change your own routines." });
    if (!activityId) return next({ status: 400, name: "ValidationError", message: "An activityId is required." });
    const existing = await getRoutineActivitiesByRoutine({ id: routineId });
    if (existing.some((item) => item.activityId === Number(activityId))) return next({ status: 409, name: "DuplicateRoutineActivityError", message: "That activity is already in this routine." });
    const item = await addActivityToRoutine({ routineId, activityId, count, duration });
    if (!item) return next({ status: 409, name: "DuplicateRoutineActivityError", message: "That activity is already in this routine." });
    return res.status(201).send(item);
  } catch (error) { return next(error); }
});
module.exports = router;

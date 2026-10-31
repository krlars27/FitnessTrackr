const express = require("express");
const router = express.Router();
const { getRoutineById, updateRoutineActivity, getRoutineActivityById, destroyRoutineActivity } = require("../db");
const { requireUser } = require("./utils");

async function findOwnedRoutineActivity(id, userId) {
  const item = await getRoutineActivityById(id);
  if (!item) return { status: "missing" };
  const routine = await getRoutineById(item.routineId);
  if (!routine) return { status: "missing" };
  if (routine.creatorId !== userId) return { status: "forbidden" };
  return { item };
}
router.patch("/:routineActivityId", requireUser, async (req, res, next) => {
  try {
    const { routineActivityId } = req.params;
    const access = await findOwnedRoutineActivity(routineActivityId, req.user.id);
    if (access.status === "missing") return next({ status: 404, name: "RoutineActivityNotFoundError", message: "Routine activity not found." });
    if (access.status === "forbidden") return next({ status: 403, name: "ForbiddenError", message: "You can only update activities in your own routines." });
    const updates = {};
    for (const field of ["count", "duration"]) if (req.body[field] !== undefined) updates[field] = req.body[field];
    if (!Object.keys(updates).length) return next({ status: 400, name: "ValidationError", message: "Provide count or duration to update." });
    return res.send(await updateRoutineActivity({ id: routineActivityId, ...updates }));
  } catch (error) { return next(error); }
});
router.delete("/:routineActivityId", requireUser, async (req, res, next) => {
  try {
    const { routineActivityId } = req.params;
    const access = await findOwnedRoutineActivity(routineActivityId, req.user.id);
    if (access.status === "missing") return next({ status: 404, name: "RoutineActivityNotFoundError", message: "Routine activity not found." });
    if (access.status === "forbidden") return next({ status: 403, name: "ForbiddenError", message: "You can only delete activities from your own routines." });
    await destroyRoutineActivity(routineActivityId);
    return res.send(access.item);
  } catch (error) { return next(error); }
});
module.exports = router;

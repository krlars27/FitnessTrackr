const client = require("./client");

async function getRoutineActivityById(id) {
  const { rows: [item] } = await client.query("SELECT * FROM routine_activities WHERE id = $1;", [id]);
  return item || null;
}
async function addActivityToRoutine({ routineId, activityId, count, duration }) {
  const { rows: [item] } = await client.query(
    'INSERT INTO routine_activities ("routineId", "activityId", count, duration) VALUES ($1, $2, $3, $4) ON CONFLICT ("routineId", "activityId") DO NOTHING RETURNING *;',
    [routineId, activityId, count, duration]
  );
  return item || null;
}
async function getRoutineActivitiesByRoutine({ id }) {
  const { rows } = await client.query('SELECT * FROM routine_activities WHERE "routineId" = $1;', [id]);
  return rows;
}
async function updateRoutineActivity({ id, ...fields }) {
  const allowed = ["count", "duration"];
  const entries = Object.entries(fields).filter(([key, value]) => allowed.includes(key) && value !== undefined);
  if (!entries.length) return getRoutineActivityById(id);
  const assignments = entries.map(([key], i) => '"' + key + '" = $' + (i + 1));
  const values = entries.map(([, value]) => value);
  values.push(id);
  const { rows: [item] } = await client.query(
    "UPDATE routine_activities SET " + assignments.join(", ") + " WHERE id = $" + values.length + " RETURNING *;", values
  );
  return item || null;
}
async function destroyRoutineActivity(id) {
  const { rows: [item] } = await client.query("DELETE FROM routine_activities WHERE id = $1 RETURNING *;", [id]);
  return item || null;
}
async function canEditRoutineActivity(routineActivityId, userId) {
  const { rows: [item] } = await client.query(
    'SELECT routine_activities.* FROM routine_activities JOIN routines ON routine_activities."routineId" = routines.id WHERE routine_activities.id = $1 AND routines."creatorId" = $2;',
    [routineActivityId, userId]
  );
  return Boolean(item);
}
module.exports = { getRoutineActivityById, addActivityToRoutine, getRoutineActivitiesByRoutine, updateRoutineActivity, destroyRoutineActivity, canEditRoutineActivity };

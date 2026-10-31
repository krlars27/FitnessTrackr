const client = require("./client");
const { attachActivitiesToRoutines } = require("./activities");

async function getRoutineById(id) {
  const { rows: [routine] } = await client.query("SELECT * FROM routines WHERE id = $1;", [id]);
  return routine || null;
}
async function getRoutinesWithoutActivities() {
  const { rows } = await client.query("SELECT * FROM routines;");
  return rows;
}
async function getAllRoutines() {
  const { rows } = await client.query('SELECT routines.*, users.username AS "creatorName" FROM routines JOIN users ON routines."creatorId" = users.id;');
  return attachActivitiesToRoutines(rows);
}
async function getAllRoutinesByUser({ username }) {
  const { rows } = await client.query('SELECT routines.*, users.username AS "creatorName" FROM routines JOIN users ON routines."creatorId" = users.id WHERE users.username = $1;', [username]);
  return attachActivitiesToRoutines(rows);
}
async function getPublicRoutinesByUser({ username }) {
  const { rows } = await client.query('SELECT routines.*, users.username AS "creatorName" FROM routines JOIN users ON routines."creatorId" = users.id WHERE routines."isPublic" = TRUE AND users.username = $1;', [username]);
  return attachActivitiesToRoutines(rows);
}
async function getAllPublicRoutines() {
  const { rows } = await client.query('SELECT routines.*, users.username AS "creatorName" FROM routines JOIN users ON routines."creatorId" = users.id WHERE routines."isPublic" = TRUE;');
  return attachActivitiesToRoutines(rows);
}
async function getPublicRoutinesByActivity({ id }) {
  const { rows } = await client.query('SELECT routines.*, users.username AS "creatorName" FROM routines JOIN users ON routines."creatorId" = users.id WHERE routines."isPublic" = TRUE AND routines.id IN (SELECT "routineId" FROM routine_activities WHERE "activityId" = $1);', [id]);
  return attachActivitiesToRoutines(rows);
}
async function createRoutine({ creatorId, isPublic, name, goal }) {
  const { rows: [routine] } = await client.query(
    'INSERT INTO routines ("creatorId", "isPublic", name, goal) VALUES ($1, $2, $3, $4) RETURNING *;',
    [creatorId, isPublic, name, goal]
  );
  return routine;
}
async function updateRoutine({ id, ...fields }) {
  const allowed = ["isPublic", "name", "goal"];
  const entries = Object.entries(fields).filter(([key, value]) => allowed.includes(key) && value !== undefined);
  if (!entries.length) return getRoutineById(id);
  const assignments = entries.map(([key], i) => '"' + key + '" = $' + (i + 1));
  const values = entries.map(([, value]) => value);
  values.push(id);
  const { rows: [routine] } = await client.query(
    "UPDATE routines SET " + assignments.join(", ") + " WHERE id = $" + values.length + " RETURNING *;", values
  );
  return routine || null;
}
async function destroyRoutine(id) {
  await client.query('DELETE FROM routine_activities WHERE "routineId" = $1;', [id]);
  const { rows: [routine] } = await client.query("DELETE FROM routines WHERE id = $1 RETURNING *;", [id]);
  return routine || null;
}
module.exports = { getRoutineById, getRoutinesWithoutActivities, getAllRoutines, getAllPublicRoutines, getAllRoutinesByUser, getPublicRoutinesByUser, getPublicRoutinesByActivity, createRoutine, updateRoutine, destroyRoutine };

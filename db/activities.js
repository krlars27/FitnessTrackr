const client = require("./client");

async function getAllActivities() {
  const { rows } = await client.query("SELECT * FROM activities;");
  return rows;
}
async function getActivityById(id) {
  const { rows: [activity] } = await client.query(
    "SELECT * FROM activities WHERE id = $1;", [id]
  );
  return activity || null;
}
async function getActivityByName(name) {
  const { rows: [activity] } = await client.query(
    "SELECT * FROM activities WHERE name = $1;", [name]
  );
  return activity || null;
}
async function attachActivitiesToRoutines(routines) {
  if (!routines.length) return [];
  const placeholders = routines.map((_, i) => "$" + (i + 1)).join(", ");
  const ids = routines.map((routine) => routine.id);
  const { rows: activities } = await client.query(
    `SELECT activities.*, routine_activities.duration, routine_activities.count,
            routine_activities.id AS "routineActivityId", routine_activities."routineId"
     FROM activities JOIN routine_activities
       ON routine_activities."activityId" = activities.id
     WHERE routine_activities."routineId" IN (${placeholders});`,
    ids
  );
  return routines.map((routine) => ({
    ...routine,
    activities: activities.filter((activity) => activity.routineId === routine.id),
  }));
}
async function createActivity({ name, description }) {
  const { rows: [activity] } = await client.query(
    `INSERT INTO activities (name, description) VALUES ($1, $2)
     ON CONFLICT (name) DO NOTHING RETURNING *;`,
    [name, description]
  );
  return activity || null;
}
async function updateActivity({ id, ...fields }) {
  const allowed = ["name", "description"];
  const entries = Object.entries(fields).filter(([key, value]) => allowed.includes(key) && value !== undefined);
  if (!entries.length) return getActivityById(id);
  const assignments = entries.map(([key], i) => '"' + key + '" = $' + (i + 1));
  const values = entries.map(([, value]) => value);
  values.push(id);
  const { rows: [activity] } = await client.query(
    "UPDATE activities SET " + assignments.join(", ") +
    " WHERE id = $" + values.length + " RETURNING *;", values
  );
  return activity || null;
}
module.exports = { getAllActivities, getActivityById, getActivityByName, attachActivitiesToRoutines, createActivity, updateActivity };

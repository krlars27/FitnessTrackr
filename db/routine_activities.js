/* eslint-disable no-useless-catch */
const client = require("./client");

async function getRoutineActivityById(id) {
  try {
    const {
      rows: [routine_activity],
    } = await client.query(`SELECT * FROM routine_activities WHERE id=$1;`, [
      id,
    ]);
    return routine_activity;
  } catch (error) {
    // console.log(error);
  }
}

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
      INSERT INTO routine_activities ("routineId", "activityId", count, duration)
      VALUES($1, $2, $3, $4)
      ON CONFLICT ("routineId", "activityId") DO NOTHING
      RETURNING *;

    `,
      [routineId, activityId, count, duration]
    );
    return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const {
      rows: [routine_activity],
    } = await client.query(`
    SELECT routine_activities
    FROM routines
    JOIN routines ON routine_activities."routineId" = routines.id
    WHERE "routineId" IN (SELECT id FROM routines WHERE id = '${id}')
    ;`);
    // console.log(rows)
    return routine_activity;
  } catch (error) {
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {}

async function destroyRoutineActivity(id) {
  try {
    const {
      rows: [routine_activity],
    } = await client.query(
      ` DELETE 
     FROM  routine_activities 
     WHERE "routineId" =$1
     ;`,
      [id]
    );
    return routine_activity;
  } catch (error) {
    throw error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};

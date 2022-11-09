/* eslint-disable no-useless-catch */
const client = require('./client');
const {attachActivitiesToRoutines} = require('./activities')

async function getRoutineById(id){
  try {
    const {
      rows: [routine],
    } = await client.query(`SELECT * FROM routines WHERE id=$1;`, [id]);
    return routine;
  } catch (error) {
    // console.log(error);
  }
}

async function getRoutinesWithoutActivities(){
  try {
    const {rows: routines} = await client.query(`
    SELECT * FROM routines`);
    // console.log(routines)
    return routines
  } catch (error) {
    throw error;
  }
}

async function getAllRoutines() {
  try {
    //AS is alias 
    //routines.* = grabbing all from routines table
    const { rows } = await client.query(`
    SELECT routines.*, users.username AS "creatorName" 
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    ;`);
    // console.log(rows)
    return attachActivitiesToRoutines(rows);
  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({username}) {
  try {
  
    const { rows } = await client.query(`
    SELECT routines.*, users.username AS "creatorName" 
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE "creatorId" IN (SELECT id FROM users WHERE username = '${username}')
    ;`);
    // console.log(rows)
    return attachActivitiesToRoutines(rows);
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByUser({username}) {
  try {
  
    const { rows } = await client.query(`
    SELECT routines.*, users.username AS "creatorName" 
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE "isPublic" = TRUE AND "creatorId" IN (SELECT id FROM users WHERE username = '${username}')
    ;`);
    // console.log(rows)
    return attachActivitiesToRoutines(rows);
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
  
    const { rows } = await client.query(`
    SELECT routines.*, users.username AS "creatorName" 
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE "isPublic" = TRUE
    ;`);
    // console.log(rows)
    return attachActivitiesToRoutines(rows);
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByActivity({id}) {
  try {
  
    const { rows } = await client.query(`
    SELECT routines.*, users.username AS "creatorName" 
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE "isPublic" = TRUE AND routines.id IN (SELECT "routineId" FROM routine_activities WHERE "activityId" = '${id}')
    ;`);
    // console.log(rows)
    return attachActivitiesToRoutines(rows);
  } catch (error) {
    throw error;
  }
}

async function createRoutine({creatorId, isPublic, name, goal}) {
  try {
    const {
      rows: [routine]
    } = await client.query(
      `
      INSERT INTO routines ("creatorId", "isPublic", name, goal)
      VALUES($1, $2, $3, $4)
      RETURNING *;`,
      [creatorId, isPublic, name, goal]
    );
    // console.log(routine) 
    return routine;
  } catch (error) {
    throw error;
  }
}

async function updateRoutine({id, ...fields}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  if (setString.length === 0) {
    return;
  }
  try {
    const {
      rows: [routines],
    } = await client.query(
      `
      UPDATE routines
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
      Object.values(fields)
    );

    return routines;
    
  } catch (error) {
     throw error;
  }


}

async function destroyRoutine(id) {
try {
   await client.query(
    ` DELETE 
    FROM  routine_activities 
    WHERE "routineId" =$1
    ;`,
    [id]
    )
  const {rows: [routine]} = await client.query(
    ` DELETE 
    FROM  routines 
    WHERE id =$1
    ;`,
    [id]
    )
  return routine
} catch (error) {
  throw error;
}

}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
}
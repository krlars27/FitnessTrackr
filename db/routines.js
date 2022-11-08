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
}

async function getPublicRoutinesByUser({username}) {
}

async function getAllPublicRoutines() {
}

async function getPublicRoutinesByActivity({id}) {
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
}

async function destroyRoutine(id) {
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
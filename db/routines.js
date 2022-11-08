/* eslint-disable no-useless-catch */
const client = require('./client');

async function getRoutineById(id){
  try {
    const {
      rows: [routines],
    } = await client.query(`SELECT * FROM routines WHERE id=${id}`);
    return routines;
  } catch (error) {
    console.log(error);
  }
}

async function getRoutinesWithoutActivities(){
}

async function getAllRoutines() {
  try {
    const { rows } = await client.query(`SELECT * from routines;`);
    return rows;
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
      rows: [routines],
    } = await client.query(
      `
      INSERT INTO routines ("creatorId", "isPublic", name, goal)
      VALUES($1, $2, $3, $4)
      RETURNING *;`,
      [creatorId, isPublic, name, goal]
    );
    return routines;
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
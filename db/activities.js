const client = require("./client")

// database functions
async function getAllActivities() {

}

async function getActivityById(id) {
  
}

async function getActivityByName(name) {

}

async function attachActivitiesToRoutines(routines) {
}

// select and return an array of all activities
async function createActivity({ name, description }) {

}

// return the new activity
async function updateActivity({ id, ...fields }) {

}

// don't try to update the id
// do update the name and description
// return the updated activity
module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
}

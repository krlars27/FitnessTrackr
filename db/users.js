const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      INSERT INTO users (username, password)
      VALUES($1, $2)
      ON CONFLICT (username) DO NOTHING
      RETURNING *;`,
      [username, password]
    );
    delete user.password
    return user;
  } 
  catch (error) {
  //   throw error;
  }
}

async function getUser({ username, password }) {

  
  }



async function getUserById(userId) {
try {
  const {rows: [user]} = await client.query(`SELECT * FROM users WHERE id=${userId}`)
  if (!user){return null}
  delete user.password
  return user
} catch (error) {
console.log(error)
}
}
async function getUserByUsername(userName) {}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
/* eslint-disable no-useless-catch */
const client = require("./client");
const bcrypt = require("bcrypt")

// database functions

// user functions
async function createUser({ username, password }) {
  const saltRound = 10;
  const salt = await bcrypt.genSalt(saltRound);
  const bcryptPassword = await bcrypt.hash(password, salt);

  try {
    const {
      rows: [user],
    } = await client.query(
      `
      INSERT INTO users (username, password)
      VALUES($1, $2)
      ON CONFLICT (username) DO NOTHING
      RETURNING *;`,
      [username, bcryptPassword]
    );
    delete user.password;
    return user;
  } catch (error) {
      throw error;
  }
}

async function getUser({ username, password }) {

  try {
    const user = await getUserByUsername(username);
    const hashedPassword = user.password;
    const validPassword = await bcrypt.compare(password, hashedPassword);
    if (validPassword) {
        delete user.password
        return user;
    }
   } catch(error) {
      throw error;
    }
  // const {rows: [user]} = await client.query(`
  //   SELECT username, password
  //   FROM users
  //   WHERE "username" = $1
  // `, [username]);
  //   // console.log(user, 'getUser user')
  // if(user.password === password) {
  //   delete user.password;
  //   console.log('password')
  //   return user;
  // } else if(!user.password === password) {
  //   return false
  // }
}


async function getUserById(userId) {
  try {
    const {
      rows: [user],
    } = await client.query(`SELECT * FROM users WHERE id=${userId}`);
    if (!user) {
      return null;
    }
    delete user.password;
    return user;
  } catch (error) {
    console.log(error);
  }
}
async function getUserByUsername(userName) {
  try {
    const { rows: [user] } = await client.query(`
      SELECT *
      FROM users
      WHERE username=$1;
    `, [userName]);
    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};

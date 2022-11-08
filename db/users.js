const client = require("./client");


// database functions

// user functions
async function createUser({ username, password }) {
  // const saltRound = 10;
  // const salt = await bcrypt.genSalt(saltRound);

  // const bcryptPassword = await bcrypt.hash(password, salt);

  try {
    const {
      rows: [user],
    } = await client.query(
      `
      INSERT INTO users (username, password)
      VALUES($1, $2)
      ON CONFLICT (username) DO NOTHING
      RETURNING *;`,
      [username, password/*bcryptPassword*/]
    );
    delete user.password;
    return user;
  } catch (error) {
      throw error;
  }
}

async function getUser({ username, password }) {
  const {rows: [user]} = await client.query(`
    SELECT username, password
    FROM users
    WHERE "username" = $1
  `, [username]);
    
  if(username.password === password) {
    delete user.password;
    return user;
  } else if(!user.password === password) {
    return false
  }
};


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
    `, [username]);

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

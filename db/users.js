const client = require("./client");
const bcrypt = require("bcrypt");

async function createUser({ username, password }) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const { rows: [user] } = await client.query(
    `INSERT INTO users (username, password) VALUES ($1, $2)
     ON CONFLICT (username) DO NOTHING RETURNING id, username;`,
    [username, hashedPassword]
  );
  return user || null;
}

async function getUser({ username, password }) {
  const user = await getUserByUsername(username);
  if (!user) return null;
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return null;
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

async function getUserById(userId) {
  const { rows: [user] } = await client.query(
    "SELECT id, username FROM users WHERE id = $1;", [userId]
  );
  return user || null;
}

async function getUserByUsername(username) {
  const { rows: [user] } = await client.query(
    "SELECT * FROM users WHERE username = $1;", [username]
  );
  return user || null;
}

module.exports = { createUser, getUser, getUserById, getUserByUsername };

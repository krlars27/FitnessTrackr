const { createTables, dropTables } = require('../db/seedData');

const setup = async () => {
  console.log("--- JEST SETUP ---");
  await dropTables();
  await createTables();
}

module.exports = setup;
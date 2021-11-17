const faker = require("faker");
const {
  createUser,
  createRoutine,
  createActivity,
  addActivityToRoutine,
} = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET = "neverTell" } = process.env;
// This contains helper functions which create fake entries in the database
// for the tests.

const createFakeUser = async (username = faker.random.uuid()) => {
  const fakeUserData = {
    username,
    password: faker.internet.password(),
  };
  const user = await createUser(fakeUserData);
  if (!user) {
    throw new Error("createUser didn't return a user");
  }
  return user;
};

const createFakeUserWithToken = async (username) => {
  const fakeUser = await createFakeUser(username);

  const token = jwt.sign(
    { id: fakeUser.id, username: fakeUser.username },
    JWT_SECRET,
    { expiresIn: "1w" }
  );

  return {
    fakeUser,
    token,
  };
};

const createFakeUserWithRoutines = async (username, numRoutines = 1) => {
  const { fakeUser, token } = await createFakeUserWithToken(username);
  const fakeRoutines = [];
  for (let i = 0; i < numRoutines; i++) {
    fakeRoutines.push(await createFakePublicRoutine(fakeUser.id));
  }
  return {
    fakeUser,
    token,
    fakeRoutines,
  };
};

const createFakeUserWithRoutinesAndActivities = async (username, numRoutines = 1) => {
  const { fakeUser, token } = await createFakeUserWithToken(username);
  const fakeRoutines = [];
  const fakePrivateRoutines = [];
  const fakeActivities = [];
  const fakeRoutineActivities = [];
  const fakePrivateRoutineActivities = [];

  for (let i = 0; i < numRoutines; i++) {
    const fakeRoutine = await createFakePublicRoutine(fakeUser.id);
    const fakePrivateRoutine = await createFakePrivateRoutine(fakeUser.id);
    const fakeActivity = await createFakeActivity();
    const fakeActivity2 = await createFakeActivity();
    fakeRoutines.push(fakeRoutine);
    fakePrivateRoutines.push(fakePrivateRoutine);
    fakeActivities.push(fakeActivity, fakeActivity2);
    const fakeRoutineActivity = await createFakeRoutineActivity(
      fakeRoutine.id,
      fakeActivity.id
    );
    const fakeRoutineActivity2 = await createFakeRoutineActivity(
      fakeRoutine.id,
      fakeActivity2.id
    );
    const fakePrivateRoutineActivity = await createFakeRoutineActivity(
      fakePrivateRoutine.id,
      fakeActivity.id
    );
    fakeRoutineActivities.push(fakeRoutineActivity, fakeRoutineActivity2);
    fakePrivateRoutineActivities.push(fakePrivateRoutineActivity);
  }

  return {
    fakeUser,
    token,
    fakeRoutines,
    fakePrivateRoutines,
    fakeActivities,
    fakeRoutineActivities,
    fakePrivateRoutineActivities,
  };
};

const createFakePublicRoutine = async (
  creatorId,
  name = faker.random.uuid(),
  goal = faker.random.uuid()
) => {
  if (!creatorId) {
    const fakeUser = await createFakeUser();
    creatorId = fakeUser.id;
  }
  const routine = await createRoutine({
    creatorId,
    isPublic: true,
    name,
    goal,
  });
  if (!routine) {
    throw new Error("createRoutine didn't return a routine");
  }
  return routine;
};

const createFakePrivateRoutine = async (
  creatorId,
  name = faker.random.uuid(),
  goal = faker.random.uuid()
) => {
  if (!creatorId) {
    const fakeUser = await createFakeUser();
    creatorId = fakeUser.id;
  }
  const routine = await createRoutine({
    creatorId,
    isPublic: false,
    name,
    goal,
  });
  if (!routine) {
    throw new Error("createRoutine didn't return a routine");
  }
  return routine;
};

const createFakeActivity = async (
  name = faker.random.uuid(),
  description = faker.random.uuid()
) => {
  const activity = await createActivity({
    name,
    description
  });
  if (!activity) {
    throw new Error("createActivity didn't return an activity");
  }
  return activity;
};

const createFakeRoutineActivity = async (routineId, activityId) => {
  if (!routineId) {
    const routine = await createFakePublicRoutine();
    routineId = routine.id;
  }
  if (!activityId) {
    const activity = await createFakeActivity();
    activityId = activity.id;
  }
  const fakeRoutineActivity = await addActivityToRoutine({
    activityId,
    routineId,
    count: faker.random.number(),
    duration: faker.random.number(),
  });
  if (!fakeRoutineActivity) {
    throw new Error("addActivityToRoutine didn't return a routineActivity");
  }
  return fakeRoutineActivity;
};

module.exports = {
  createFakeUser,
  createFakeUserWithToken,
  createFakeUserWithRoutines,
  createFakePublicRoutine,
  createFakePrivateRoutine,
  createFakeActivity,
  createFakeRoutineActivity,
  createFakeUserWithRoutinesAndActivities,
};

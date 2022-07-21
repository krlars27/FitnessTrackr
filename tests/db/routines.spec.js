/* 

DO NOT CHANGE THIS FILE

*/
require("dotenv").config();
const faker = require("faker");
const client = require("../../db/client");
const {
  getRoutineById,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
} = require("../../db");

const {
  createFakePublicRoutine,
  createFakeUserWithRoutinesAndActivities,
  createFakeUser,
  createFakeRoutineActivity,
  createFakeActivity,
} = require("../helpers");

const { objectContaining } = expect;

// Expect Helper Functions

function expectRoutinesToContainRoutine(routines, fakeRoutine) {
  expect(routines).toEqual(expect.any(Array));
  const routine = routines.find(
    (routine) => routine.id === fakeRoutine.id
  );
  expect(routine.id).toEqual(fakeRoutine.id);
  expect(routine.name).toEqual(fakeRoutine.name);
  expect(routine.isPublic).toEqual(fakeRoutine.isPublic);
  expect(routine.creatorId).toEqual(fakeRoutine.creatorId);
  expect(routine.goal).toEqual(fakeRoutine.goal);
}

function expectRoutinesToContainRoutineWithActivity(routines, fakeRoutine, fakeActivity) {
  const routine = routines.find(
    (routine) => routine.id === fakeRoutine.id
  );
  expect(routine.id).toEqual(fakeRoutine.id);
  expect(routine.name).toEqual(fakeRoutine.name);
  expect(routine.isPublic).toEqual(fakeRoutine.isPublic);
  expect(routine.creatorId).toEqual(fakeRoutine.creatorId);
  expect(routine.goal).toEqual(fakeRoutine.goal);
  expectRoutineToContainActivity(routine, fakeActivity);
}

function expectRoutinesNotToContainRoutine(routines, fakeRoutine) {
  const routine = routines.find(
    (routine) => routine.id === fakeRoutine.id
  );
  expect(routine).toBeFalsy();
}

function expectRoutineToContainActivity(routine, fakeActivity) {
  const activity = routine.activities.find(
    (activity) =>
      activity.id === fakeActivity.id
  );
  expect(activity).toEqual(
    objectContaining({
      id: fakeActivity.id,
      name: fakeActivity.name,
      description: fakeActivity.description,
    })
  );
}

function expectRoutinesNotToContainDuplicates(routines, fakeRoutine) {
  // Use filter to find out how many routines with the id
  // of our initial fake routine are in the results.
  const matchingRoutines = routines.filter(
    (routine) => routine.id === fakeRoutine.id
  );
  // There should only be one.
  expect(matchingRoutines.length).toEqual(1);
}

// Tests start here

describe("DB Routines", () => {
  let
    fakeUser,
    fakeRoutine,
    fakePrivateRoutine,
    fakeActivity,
    fakeActivity2,
    fakeRoutineActivity;

  beforeEach(async () => {
    const fakeUserName = faker.internet.userName();
    const fakeData = await createFakeUserWithRoutinesAndActivities(fakeUserName);
    fakeUser = fakeData.fakeUser;
    fakeRoutine = fakeData.fakeRoutines[0];
    fakePrivateRoutine = fakeData.fakePrivateRoutines[0];
    fakeActivity = fakeData.fakeActivities[0];
    fakeActivity2 = fakeData.fakeActivities[1];
    fakeRoutineActivity = fakeData.fakeRoutineActivities[0];
  });

  afterAll(async () => {
    client.query(`
        DELETE FROM routine_activities;
        DELETE FROM routines;
        DELETE FROM activities;
      `);
  });

  describe("getAllRoutines", () => {

    it("should include the public routine", async () => {
      const routines = await getAllRoutines();
      expectRoutinesToContainRoutine(routines, fakeRoutine);
    });

    it("Should include the private routine", async () => {
      const routines = await getAllRoutines();
      expectRoutinesToContainRoutine(routines, fakePrivateRoutine);
    });

    it("includes their activities", async () => {
      const routines = await getAllRoutines();
      const routine = routines.find(
        (routine) => routine.id === fakeRoutine.id
      );
      expectRoutineToContainActivity(routine, fakeActivity);
      expectRoutineToContainActivity(routine, fakeActivity2);
    });

    it("should not include a routine more than once", async () => {
      const routines = await getAllRoutines();
      expectRoutinesNotToContainDuplicates(routines, fakeRoutine);
    });

    it("includes username, from users join, aliased as creatorName", async () => {
      const routines = await getAllRoutines();
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      expect(routine.creatorName).toEqual(fakeUser.username);
    });

    it("includes duration and count on activities, from routine_activities join", async () => {
      const routines = await getAllRoutines();
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      const activity = routine.activities.find(activity => activity.id === fakeActivity.id);
      expect(activity.duration).toEqual(fakeRoutineActivity.duration);
      expect(activity.count).toEqual(fakeRoutineActivity.count);
    });

    it("includes the routineId and routineActivityId on activities", async () => {
      const routines = await getAllRoutines();
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      const activity = routine.activities.find(activity => activity.id === fakeActivity.id);
      expect(activity.routineId).toEqual(fakeRoutine.id);
      expect(activity.routineActivityId).toEqual(fakeRoutineActivity.id);
    });
  });

  describe("getAllPublicRoutines", () => {

    it("should include the public routine", async () => {
      const routines = await getAllPublicRoutines();
      expectRoutinesToContainRoutine(routines, fakeRoutine);
    });

    it("should not contain the private routine", async () => {
      const routines = await getAllPublicRoutines();
      expectRoutinesNotToContainRoutine(routines, fakePrivateRoutine);
    });

    it("includes their activities", async () => {
      const routines = await getAllPublicRoutines();
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      expectRoutineToContainActivity(routine, fakeActivity);
      expectRoutineToContainActivity(routine, fakeActivity2);
    });

    it("should not include a routine more than once", async () => {
      const routines = await getAllPublicRoutines();
      expectRoutinesNotToContainDuplicates(routines, fakeRoutine);
    });

    it("includes username, from users join, aliased as creatorName", async () => {
      const routines = await getAllPublicRoutines();
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      expect(routine.creatorName).toEqual(fakeUser.username);
    });

    it("includes duration and count on activities, from routine_activities join", async () => {
      const routines = await getAllPublicRoutines();
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      const activity = routine.activities.find(activity => activity.id === fakeActivity.id);
      expect(activity.duration).toEqual(fakeRoutineActivity.duration);
      expect(activity.count).toEqual(fakeRoutineActivity.count);
    });

    it("includes the routineId and routineActivityId on activities", async () => {
      const routines = await getAllPublicRoutines();
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      const activity = routine.activities.find(activity => activity.id === fakeActivity.id);
      expect(activity.routineId).toEqual(fakeRoutine.id);
      expect(activity.routineActivityId).toEqual(fakeRoutineActivity.id);
    });
  });

  describe("getAllRoutinesByUser", () => {

    it("should get the public routine for the user", async () => {
      const routines = await getAllRoutinesByUser(fakeUser);
      expectRoutinesToContainRoutine(routines, fakeRoutine);
    });

    it("should get the private routine for the user", async () => {
      const routines = await getAllRoutinesByUser(fakeUser);
      expectRoutinesToContainRoutine(routines, fakePrivateRoutine);
    });

    it("should not get routines for another user", async () => {
      const anotherUsersRoutine = await createFakePublicRoutine();
      const routines = await getAllRoutinesByUser(fakeUser);
      expectRoutinesNotToContainRoutine(routines, anotherUsersRoutine);
    });

    it("includes their activities", async () => {
      const routines = await getAllRoutinesByUser(fakeUser);
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      expectRoutineToContainActivity(routine, fakeActivity);
      expectRoutineToContainActivity(routine, fakeActivity2);
    });

    it("should not include a routine more than once", async () => {
      const routines = await getAllRoutinesByUser(fakeUser);
      expectRoutinesNotToContainDuplicates(routines, fakeRoutine);
    });

    it("includes username, from users join, aliased as creatorName", async () => {
      const routines = await getAllRoutinesByUser(fakeUser);
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      expect(routine.creatorName).toEqual(fakeUser.username);
    });

    it("includes duration and count on activities, from routine_activities join", async () => {
      const routines = await getAllRoutinesByUser(fakeUser);
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      const activity = routine.activities.find(activity => activity.id === fakeActivity.id);
      expect(activity.duration).toEqual(fakeRoutineActivity.duration);
      expect(activity.count).toEqual(fakeRoutineActivity.count);
    });

    it("includes the routineId and routineActivityId on activities", async () => {
      const routines = await getAllRoutinesByUser(fakeUser);
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      const activity = routine.activities.find(activity => activity.id === fakeActivity.id);
      expect(activity.routineId).toEqual(fakeRoutine.id);
      expect(activity.routineActivityId).toEqual(fakeRoutineActivity.id);
    });
  });

  describe("getPublicRoutinesByUser", () => {

    it("should include the public routine", async () => {
      const routines = await getPublicRoutinesByUser(fakeUser);
      expectRoutinesToContainRoutine(routines, fakeRoutine);
    });

    it("should not contain the private routine", async () => {
      const routines = await getPublicRoutinesByUser(fakeUser);
      expectRoutinesNotToContainRoutine(routines, fakePrivateRoutine);
    });

    it("includes their activities", async () => {
      const routines = await getPublicRoutinesByUser(fakeUser);
      const routine = routines.find(routine => routine.id === fakeRoutine.id);

      expectRoutineToContainActivity(routine, fakeActivity);
      expectRoutineToContainActivity(routine, fakeActivity2);
    });

    it("should not include a routine more than once", async () => {
      const routines = await getPublicRoutinesByUser(fakeUser);
      expectRoutinesNotToContainDuplicates(routines, fakeRoutine);
    });

    it("includes username, from users join, aliased as creatorName", async () => {
      const routines = await getPublicRoutinesByUser(fakeUser);
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      expect(routine.creatorName).toEqual(fakeUser.username);
    });

    it("includes duration and count on activities, from routine_activities join", async () => {
      const routines = await getPublicRoutinesByUser(fakeUser);
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      const activity = routine.activities.find(activity => activity.id === fakeActivity.id);
      expect(activity.duration).toEqual(fakeRoutineActivity.duration);
      expect(activity.count).toEqual(fakeRoutineActivity.count);
    });

    it("includes the routineId and routineActivityId on activities", async () => {
      const routines = await getPublicRoutinesByUser(fakeUser);
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      const activity = routine.activities.find(activity => activity.id === fakeActivity.id);
      expect(activity.routineId).toEqual(fakeRoutine.id);
      expect(activity.routineActivityId).toEqual(fakeRoutineActivity.id);
    });
  });

  describe("getPublicRoutinesByActivity", () => {

    it("should include the public routine containing a specific activityId", async () => {
      const routines = await getPublicRoutinesByActivity(fakeActivity);
      expectRoutinesToContainRoutineWithActivity(routines, fakeRoutine, fakeActivity);
    });

    it("should not include a public routine containing another activity", async () => {
      const anotherRoutine = await createFakePublicRoutine();
      const anotherActivity = await createFakeActivity();
      await createFakeRoutineActivity(anotherRoutine.id, anotherActivity.id);

      const routines = await getPublicRoutinesByActivity(fakeActivity);

      expectRoutinesNotToContainRoutine(routines, anotherRoutine);
    });

    it("should not contain the private routine for that activityId", async () => {
      const routines = await getPublicRoutinesByActivity(fakeActivity);
      expectRoutinesNotToContainRoutine(routines, fakePrivateRoutine);
    });

    it("includes their activities", async () => {
      const routines = await getPublicRoutinesByActivity(fakeActivity);
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      expectRoutineToContainActivity(routine, fakeActivity);
    });

    it("should not include a routine more than once", async () => {
      const routines = await getPublicRoutinesByActivity(fakeActivity);
      expectRoutinesNotToContainDuplicates(routines, fakeRoutine);
    });

    it("includes username, from users join, aliased as creatorName", async () => {
      const routines = await getPublicRoutinesByActivity(fakeActivity);
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      expect(routine.creatorName).toEqual(fakeUser.username);
    });

    it("includes duration and count on activities, from routine_activities join", async () => {
      const routines = await getPublicRoutinesByActivity(fakeActivity);
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      const activity = routine.activities.find(activity => activity.id === fakeActivity.id);
      expect(activity.duration).toEqual(fakeRoutineActivity.duration);
      expect(activity.count).toEqual(fakeRoutineActivity.count);
    });

    it("includes the routineId and routineActivityId on activities", async () => {
      const routines = await getPublicRoutinesByActivity(fakeActivity);
      const routine = routines.find(routine => routine.id === fakeRoutine.id);
      const activity = routine.activities.find(activity => activity.id === fakeActivity.id);
      expect(activity.routineId).toEqual(fakeRoutine.id);
      expect(activity.routineActivityId).toEqual(fakeRoutineActivity.id);
    });
  });

  describe("createRoutine", () => {
    it("creates and returns the new routine", async () => {
      const user = await createFakeUser();
      const routine = await createRoutine({
        creatorId: user.id,
        isPublic: true,
        name: faker.random.uuid(),
        goal: faker.random.uuid(),
      });
      const queriedRoutine = await getRoutineById(routine.id);
      expect(routine).toEqual(queriedRoutine);
    });
  });

  describe("updateRoutine", () => {
    it("Returns the updated routine", async () => {
      const fakeRoutine = await createFakePublicRoutine();

      const updatedRoutine = await updateRoutine({
        id: fakeRoutine.id,
        isPublic: false,
        name: faker.random.uuid(),
        goal: faker.random.uuid(),
      });

      expect(updatedRoutine.id).toEqual(fakeRoutine.id);
    });

    it("Updates the public status, name, or goal, as necessary", async () => {
      const fakeRoutine = await createFakePublicRoutine();

      const name = faker.random.uuid();
      const goal = faker.random.uuid();

      const updatedRoutine = await updateRoutine({
        id: fakeRoutine.id,
        isPublic: false,
        name,
        goal,
      });

      expect(updatedRoutine.isPublic).toBe(false);
      expect(updatedRoutine.name).toBe(name);
      expect(updatedRoutine.goal).toBe(goal);
    });

    it("Does not update fields that are not passed in", async () => {
      const fakeRoutine = await createFakePublicRoutine();
      const name = faker.random.uuid();
      const updatedRoutine = await updateRoutine({
        id: fakeRoutine.id,
        name,
      });
      expect(updatedRoutine.isPublic).toBe(fakeRoutine.isPublic);
      expect(updatedRoutine.name).toBe(name);
      expect(updatedRoutine.goal).toBe(fakeRoutine.goal);
    });
  });

  describe("destroyRoutine", () => {
    it("removes routine from database", async () => {
      const fakeRoutine = await createFakePublicRoutine();
      await destroyRoutine(fakeRoutine.id);
      const {
        rows: [routine],
      } = await client.query(
        `
          SELECT * 
          FROM routines
          WHERE id = $1;
        `,
        [fakeRoutine.id]
      );
      expect(routine).toBeFalsy();
    });

    it("Deletes all the routine_activities whose routine is the one being deleted.", async () => {
      const { fakeRoutines, fakeRoutineActivities } =
        await createFakeUserWithRoutinesAndActivities("Jackie");
      const fakeRoutine = fakeRoutines[0];
      const fakeRoutineActivity = fakeRoutineActivities[0];
      await destroyRoutine(fakeRoutine.id);

      const {
        rows: [queriedRoutineActivities],
      } = await client.query(
        `
          SELECT *
          from routine_activities
          WHERE id = $1;
        `,
        [fakeRoutineActivity.id]
      );

      expect(queriedRoutineActivities).toBeFalsy();
    });
  });
});

/* 

DO NOT CHANGE THIS FILE

*/
require("dotenv").config()
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
} = require("../../db")

const {
  createFakePublicRoutine,
  createFakeUserWithRoutinesAndActivities,
  createFakeUser
} = require("../helpers")
const { arrayContaining, objectContaining } = expect

describe("DB Routines", () => {

  describe("getAllRoutines", () => {
    let fakeRoutine, fakePrivateRoutine, fakeUser, fakeActivity, fakeRoutineActivity

    beforeAll(async () => {
      const fakeData = await createFakeUserWithRoutinesAndActivities("Jack");
      fakeUser = fakeData.fakeUser;
      fakeRoutine = fakeData.fakeRoutines[0];
      fakePrivateRoutine = fakeData.fakePrivateRoutines[0];
      fakeActivity = fakeData.fakeActivities[0]
      fakeRoutineActivity = fakeData.fakeRoutineActivities[0]
    })

    it("should include the public routine", async () => {
      const routines = await getAllRoutines();
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            id: fakeRoutine.id,
            creatorId: fakeRoutine.creatorId,
            isPublic: fakeRoutine.isPublic,
            goal: fakeRoutine.goal,
            name: fakeRoutine.name
          })
        ])
      )
    });

    it("Should include the private routine", async () => {
      const routines = await getAllRoutines();
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            id: fakePrivateRoutine.id,
            creatorId: fakePrivateRoutine.creatorId,
            isPublic: fakePrivateRoutine.isPublic,
            goal: fakePrivateRoutine.goal,
            name: fakePrivateRoutine.name
          })
        ])
      )
    });

    it("includes their activities", async () => {
      const routines = await getAllRoutines()
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            id: fakeRoutine.id,
            activities: arrayContaining([
              objectContaining({
                id: fakeActivity.id,
                name: fakeActivity.name,
                description: fakeActivity.description,
              }),
            ]),
          }),
        ])
      )
    })

    it("includes username, from users join, aliased as creatorName", async () => {
      const routines = await getAllRoutines()
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            creatorName: fakeUser.username,
          }),
        ])
      )
    })

    it("includes duration and count on activities, from routine_activities join", async () => {
      const routines = await getAllRoutines()
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            activities: arrayContaining([
              objectContaining({
                duration: fakeRoutineActivity.duration,
                count: fakeRoutineActivity.count,
              }),
            ]),
          }),
        ])
      )
    })
  })

  describe("getAllPublicRoutines", () => {
    let routine, privateRoutine, user, activity, routine_activity

    beforeAll(async () => {
      const { fakeUser, fakeRoutines, fakeActivities, fakeRoutineActivities, fakePrivateRoutines } =
        await createFakeUserWithRoutinesAndActivities("Mary");
      user = fakeUser;
      routine = fakeRoutines[0];
      privateRoutine = fakePrivateRoutines[0];
      activity = fakeActivities[0];
      routine_activity = fakeRoutineActivities[0]
    })

    it("should include the public routine", async () => {
      const routines = await getAllPublicRoutines()
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            id: routine.id
          }),
        ])
      )
    })

    it("should not contain the private routine", async () => {
      const routines = await getAllPublicRoutines()
      expect(routines).toEqual(
        arrayContaining([
          expect.not.objectContaining({
            id: privateRoutine.id
          })
        ])
      )
    });

    it("includes their activities", async () => {
      const routines = await getAllPublicRoutines();
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            id: routine.id,
            activities: arrayContaining([
              objectContaining({
                id: activity.id,
                name: activity.name,
                description: activity.description,
              }),
            ]),
          }),
        ])
      );
    })

    it("includes username, from users join, aliased as creatorName", async () => {
      const routines = await getAllPublicRoutines();
      expect(routines).toEqual(
        arrayContaining([objectContaining({
          creatorName: user.username,
        })])
      )
    })

    it("includes duration and count on activities, from routine_activities join", async () => {
      const routines = await getAllPublicRoutines();
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            activities: arrayContaining([
              objectContaining({
                duration: routine_activity.duration,
                count: routine_activity.count,
              }),
            ]),
          }),
        ])
      );
    })

  })
  
  describe("getAllRoutinesByUser", () => {
    let fakeRoutine, fakeUser, fakeActivity, fakeRoutineActivity;

    beforeAll(async () => {
      const fakeData = await createFakeUserWithRoutinesAndActivities("George");
      fakeUser = fakeData.fakeUser;
      fakeRoutine = fakeData.fakeRoutines[0];
      fakeActivity = fakeData.fakeActivities[0];
      fakeRoutineActivity = fakeData.fakeRoutineActivities[0];
    })
    
    it("should get the public routine for the user", async () => {
      const routines = await getAllRoutinesByUser(fakeUser);
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            creatorId: fakeRoutine.creatorId,
            isPublic: true
          })
        ])
      );
    })

    it("should not get the private routine for the user", async () => {
      const routines = await getAllRoutinesByUser(fakeUser);
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            creatorId: fakeRoutine.creatorId,
            isPublic: false
          })
        ])
      );
    })

    it("should not get routines for another user", async () => {
      const anotherUser = await createFakeUser();
      const routines = await getAllRoutinesByUser(fakeUser);
      expect(routines).toEqual(arrayContaining([
        expect.not.objectContaining({
          creatorId: anotherUser.id
        })
      ]))
    });


    it("includes their activities", async () => {
      const routines = await getAllRoutinesByUser(fakeUser);
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            id: fakeRoutine.id,
            activities: arrayContaining([
              objectContaining({
                id: fakeActivity.id,
                name: fakeActivity.name,
                description: fakeActivity.description,
              }),
            ]),
          }),
        ])
      );
    })

    it("includes username, from users join, aliased as creatorName", async () => {
      const routines = await getAllRoutinesByUser(fakeUser);
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            creatorName: fakeUser.username
          })
        ])
      );
    })

    it("includes duration and count on activities, from routine_activities join", async () => {
      const routines = await getAllRoutinesByUser(fakeUser);
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            activities: arrayContaining([
              objectContaining({
                duration: fakeRoutineActivity.duration,
                count: fakeRoutineActivity.count,
              }),
            ]),
          }),
        ])
      );
    })
  })

  describe("getPublicRoutinesByUser", () => {
    let fakeRoutine, fakeUser, fakeActivity, fakePrivateRoutine, fakeRoutineActivity;

    beforeAll(async () => {
      const fakeData = await createFakeUserWithRoutinesAndActivities("Ron");
      fakeUser = fakeData.fakeUser;
      fakeRoutine = fakeData.fakeRoutines[0];
      fakePrivateRoutine = fakeData.fakePrivateRoutines[0];
      fakeActivity = fakeData.fakeActivities[0];
      fakeRoutineActivity = fakeData.fakeRoutineActivities[0];
    })

    it("should include the public routine", async () => {
      const routines = await getPublicRoutinesByUser(fakeUser);
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            id: fakeRoutine.id
          }),
        ])
      );
    });

    it("should not contain the private routine", async () => {
      const routines = await getPublicRoutinesByUser(fakeUser);
      expect(routines).toEqual(
        arrayContaining([
          expect.not.objectContaining({
            id: fakePrivateRoutine.id
          })
        ])
      );
    });

    it("includes their activities", async () => {
      const routines = await getPublicRoutinesByUser(fakeUser);
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            id: fakeRoutine.id,
            activities: arrayContaining([
              objectContaining({
                id: fakeActivity.id,
                name: fakeActivity.name,
                description: fakeActivity.description,
              }),
            ]),
          }),
        ])
      );
    });

    it("includes username, from users join, aliased as creatorName", async () => {
      const routines = await getPublicRoutinesByUser(fakeUser);
      expect(routines).toEqual(
        arrayContaining([objectContaining({
          creatorName: fakeUser.username,
        })])
      );
    });

    it("includes duration and count on activities, from routine_activities join", async () => {
      const routines = await getPublicRoutinesByUser(fakeUser);
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            activities: arrayContaining([
              objectContaining({
                duration: fakeRoutineActivity.duration,
                count: fakeRoutineActivity.count,
              }),
            ]),
          }),
        ])
      );
    })
  })

  describe("getPublicRoutinesByActivity", () => {
    let fakeRoutine, fakeUser, fakeActivity, fakePrivateRoutine, fakeRoutineActivity;

    beforeAll(async () => {
      const fakeData = await createFakeUserWithRoutinesAndActivities("Jennifer");
      fakeUser = fakeData.fakeUser;
      fakeRoutine = fakeData.fakeRoutines[0];
      fakePrivateRoutine = fakeData.fakePrivateRoutines[0];
      fakeActivity = fakeData.fakeActivities[0];
      fakeRoutineActivity = fakeData.fakeRoutineActivities[0];
    })

    it("should include the public routine containing a specific activityId", async () => {
      const routines = await getPublicRoutinesByActivity(fakeActivity);
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            id: fakeRoutine.id,
            activities: arrayContaining([
              objectContaining({
                id: fakeActivity.id
              })
            ])
          }),
        ])
      );
    });

    it("should not contain the private routine for that activityId", async () => {
      const routines = await getPublicRoutinesByActivity(fakeActivity);
      expect(routines).toEqual(
        expect.not.arrayContaining([
          expect.not.objectContaining({
            id: fakePrivateRoutine.id,
            activities: expect.not.arrayContaining([
              expect.not.objectContaining({
                id: fakeActivity.id
              })
            ])
          })
        ])
      );
    });

    it("includes their activities", async () => {
      const routines = await getPublicRoutinesByActivity(fakeActivity);
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            id: fakeRoutine.id,
            activities: arrayContaining([
              objectContaining({
                id: fakeActivity.id,
                name: fakeActivity.name,
                description: fakeActivity.description,
              }),
            ]),
          }),
        ])
      );
    });

    it("includes username, from users join, aliased as creatorName", async () => {
      const routines = await getPublicRoutinesByActivity(fakeActivity);
      expect(routines).toEqual(
        arrayContaining([objectContaining({
          creatorName: fakeUser.username,
        })])
      );
    });

    it("includes duration and count on activities, from routine_activities join", async () => {
      const routines = await getPublicRoutinesByActivity(fakeActivity);
      expect(routines).toEqual(
        arrayContaining([
          objectContaining({
            activities: arrayContaining([
              objectContaining({
                duration: fakeRoutineActivity.duration,
                count: fakeRoutineActivity.count,
              }),
            ]),
          }),
        ])
      );
    })

  });
  describe("createRoutine", () => {

    it("creates and returns the new routine", async () => {
      const user = await createFakeUser();
      const routine = await createRoutine({
        creatorId: user.id,
        isPublic: true,
        name: faker.random.uuid(),
        goal: faker.random.uuid(),
      })
      const queriedRoutine = await getRoutineById(routine.id);
      expect(routine).toEqual(queriedRoutine)
    })
  })

  describe("updateRoutine", () => {    
    it("Returns the updated routine", async () => {
      const fakeRoutine = await createFakePublicRoutine();

      const updatedRoutine = await updateRoutine({
        id: fakeRoutine.id,
        isPublic: false,
        name: faker.random.uuid(),
        goal: faker.random.uuid(),
      })

      expect(updatedRoutine.id).toEqual(fakeRoutine.id);
    })

    it("Updates the public status, name, or goal, as necessary", async () => {
      const fakeRoutine = await createFakePublicRoutine();

      const name = faker.random.uuid();
      const goal = faker.random.uuid();

      const updatedRoutine = await updateRoutine({
        id: fakeRoutine.id,
        isPublic: false,
        name,
        goal
      })

      expect(updatedRoutine.isPublic).toBe(false);
      expect(updatedRoutine.name).toBe(name);
      expect(updatedRoutine.goal).toBe(goal);
    })

    it("Does not update fields that are not passed in", async () => {
      const fakeRoutine = await createFakePublicRoutine();
      const name = faker.random.uuid();
      const updatedRoutine = await updateRoutine({
        id: fakeRoutine.id,
        name,
      })
      expect(updatedRoutine.isPublic).toBe(fakeRoutine.isPublic)
      expect(updatedRoutine.name).toBe(name)
      expect(updatedRoutine.goal).toBe(fakeRoutine.goal)
    })
  })

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
      )
      expect(routine).toBeFalsy()
    })

    it("Deletes all the routine_activities whose routine is the one being deleted.", async () => {
      const { fakeRoutines, fakeRoutineActivities } = await createFakeUserWithRoutinesAndActivities("Jackie");
      const fakeRoutine = fakeRoutines[0];
      const fakeRoutineActivity = fakeRoutineActivities[0];
      await destroyRoutine(fakeRoutine.id);

      const { 
        rows: [queriedRoutineActivities]
      } = await client.query(
        `
          SELECT *
          from routine_activities
          WHERE id = $1;
        `,
        [fakeRoutineActivity.id]
      );

      expect(queriedRoutineActivities).toBeFalsy();
    })
  })
})

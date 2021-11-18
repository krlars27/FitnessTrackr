/* 

DO NOT CHANGE THIS FILE

*/
require("dotenv").config()
const request = require("supertest")
const faker = require("faker")
const app = require("../../app")
const {
  createFakeUserWithToken,
  createFakeActivity,
  createFakeRoutineActivity,
  createFakePublicRoutine,
} = require("../helpers")
const {
  expectNotToBeError,
  expectToHaveErrorMessage,
} = require("../expectHelpers")
const {
  UnauthorizedError,
  UnauthorizedDeleteError,
  UnauthorizedUpdateError,
  DuplicateRoutineActivityError,
} = require("../../errors")

const { objectContaining, arrayContaining } = expect

const { getRoutineById } = require("../../db")

describe("/api/routines", () => {
  describe("GET /api/routines", () => {
    it("Returns a list of public routines, includes the activities with them", async () => {
      const { fakeUser } = await createFakeUserWithToken("Jan")
      const fakeRoutine = await createFakePublicRoutine(
        fakeUser.id,
        "Forever",
        "No end in sight"
      )
      const fakeActivity = await createFakeActivity(
        "Dance",
        "Like you just don't care"
      )

      await createFakeRoutineActivity(fakeRoutine.id, fakeActivity.id)

      const response = await request(app).get("/api/routines")

      expectNotToBeError(response.body)

      expect(response.body).toEqual(
        arrayContaining([
          {
            id: fakeRoutine.id,
            name: fakeRoutine.name,
            creatorId: fakeUser.id,
            goal: fakeRoutine.goal,
            isPublic: fakeRoutine.isPublic,
            activities: arrayContaining([objectContaining(fakeActivity)]),
            creatorName: fakeUser.username,
          },
        ])
      )
    })
  })

  describe("POST /api/routines (*)", () => {
    it("Creates a new routine, with the creatorId matching the logged in user", async () => {
      const { fakeUser, token } = await createFakeUserWithToken("Marsha")

      const routineData = {
        isPublic: true,
        name: "Daily",
        goal: "Until I get tired of it",
      }

      const response = await request(app)
        .post("/api/routines")
        .set("Authorization", `Bearer ${token}`)
        .send(routineData)

      expectNotToBeError(response.body)

      expect(response.body).toEqual(expect.objectContaining(routineData))
      expect(response.body.creatorId).toEqual(fakeUser.id)
    })

    it("Requires logged in user", async () => {
      const routineData = {
        isPublic: true,
        name: "Weekly",
        goal: "As long as I can stand it",
      }

      const response = await request(app)
        .post("/api/routines")
        .send(routineData)

      expectToHaveErrorMessage(response.body, UnauthorizedError())
    })
  })

  describe("PATCH /api/routines/:routineId (**)", () => {
    it("Updates a routine, notably changing public/private, the name, and the goal", async () => {
      const { fakeUser, token } = await createFakeUserWithToken("Bradley")
      // Create a routine so we can update it.
      const routine = await createFakePublicRoutine(
        fakeUser.id,
        "On Tuesdays",
        "Until tuesdays don't exist"
      )

      const newRoutineData = {
        isPublic: false,
        name: "Every other day",
        goal: "Until I lose 10 lbs.",
      }

      const response = await request(app)
        .patch(`/api/routines/${routine.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(newRoutineData)

      expectNotToBeError(response.body)

      expect(response.body).toMatchObject(newRoutineData)
    })

    it("Requires logged in user", async () => {
      // Create a routine so we can update it.
      const { fakeUser } = await createFakeUserWithToken("Jefferson")
      const fakeRoutine = createFakePublicRoutine(
        fakeUser.id,
        "On the weekends",
        "Until I get healthy"
      )

      const newRoutineData = {
        isPublic: false,
        name: "Every Month",
        goal: "Until I give up",
      }

      const response = await request(app)
        .patch(`/api/routines/${fakeRoutine.id}`)
        .send(newRoutineData)

      expectToHaveErrorMessage(response.body, UnauthorizedError())
    })

    it("returns a 403 when a user tries to edit a routine that is not theirs", async () => {
      const { fakeUser } = await createFakeUserWithToken("Marques")
      const { fakeUser: anotherUser, token: anotherUsersToken } =
        await createFakeUserWithToken("Mandy")
      const fakeRoutine = await createFakePublicRoutine(
        fakeUser.id,
        "Every day",
        "Until I'm exhausted"
      )

      const newRoutineData = {
        isPublic: false,
        name: "All Day",
        goal: "until I'm exhausted",
      }

      const response = await request(app)
        .patch(`/api/routines/${fakeRoutine.id}`)
        .send(newRoutineData)
        .set("Authorization", `Bearer ${anotherUsersToken}`)

      expect(response.status).toEqual(403)

      expectToHaveErrorMessage(
        response.body,
        UnauthorizedUpdateError(anotherUser.username, fakeRoutine.name)
      )
    })
  })

  describe("DELETE /api/routines/:routineId (**)", () => {
    it("Hard deletes a routine. Makes sure to delete all the routineActivities whose routine is the one being deleted.", async () => {
      // Create a routine so we can delete it
      const { fakeUser, token } = await createFakeUserWithToken("John")
      const fakeRoutine = await createFakePublicRoutine(
        fakeUser.id,
        "On Thursdays",
        "Until I fit into those pants"
      )

      const response = await request(app)
        .delete(`/api/routines/${fakeRoutine.id}`)
        .set("Authorization", `Bearer ${token}`)

      expectNotToBeError(response.body)

      expect(response.body).toMatchObject(fakeRoutine)
      const shouldBeDeleted = await getRoutineById(response.body.id)
      expect(shouldBeDeleted).toBeFalsy()
    })

    it("returns a 403 when the user deletes a routine that isn't theirs", async () => {
      const { fakeUser } = await createFakeUserWithToken("Janice")
      const fakeRoutine = await createFakePublicRoutine(
        fakeUser.id,
        "On even days",
        "until I decide to do it on odd days"
      )
      const { fakeUser: anotherUser, token: anotherUsersToken } =
        await createFakeUserWithToken("Lucas")

      const response = await request(app)
        .delete(`/api/routines/${fakeRoutine.id}`)
        .set("Authorization", `Bearer ${anotherUsersToken}`)

      expect(response.status).toEqual(403)

      expectToHaveErrorMessage(
        response.body,
        UnauthorizedDeleteError(anotherUser.username, fakeRoutine.name)
      )
    })
  })

  describe("POST /api/routines/:routineId/activities", () => {
    it("Attaches a single activity to a routine.", async () => {
      const { fakeUser, token } = await createFakeUserWithToken("Jerry")
      const fakeActivity = await createFakeActivity(
        "Stair machine",
        "30 minutes"
      )
      const fakeRoutine = await createFakePublicRoutine(
        fakeUser.id,
        "Every Monday",
        "Until we just don't care"
      )

      const activityRoutineData = {
        routineId: fakeRoutine.id,
        activityId: fakeActivity.id,
        count: faker.random.number(),
        duration: faker.random.number(),
      }

      const response = await request(app)
        .post(`/api/routines/${fakeRoutine.id}/activities`)
        .set("Authorization", `Bearer ${token}`)
        .send(activityRoutineData)

      expectNotToBeError(response.body)

      expect(response.body).toMatchObject(activityRoutineData)
    })

    it("Prevents duplication on (routineId, activityId) pair.", async () => {
      const { fakeUser, token } = await createFakeUserWithToken("Jill")
      const fakeRoutine = await createFakePublicRoutine(
        fakeUser.id,
        "On Weekdays",
        "Because the weekend is for rest"
      )
      const fakeActivity = await createFakeActivity(
        "Jumping jacks",
        "It's a gas gas gas."
      )
      // Create a routine_activity entry
      await createFakeRoutineActivity(fakeRoutine.id, fakeActivity.id)

      const routineActivityData = {
        routineId: fakeRoutine.id,
        activityId: fakeActivity.id,
        count: faker.random.number(),
        duration: faker.random.number(),
      }

      // Now try to send the same activity and routine id
      const response = await request(app)
        .post(`/api/routines/${fakeRoutine.id}/activities`)
        .set("Authorization", `Bearer ${token}`)
        .send(routineActivityData)

      expectToHaveErrorMessage(
        response.body,
        DuplicateRoutineActivityError(fakeRoutine.id, fakeActivity.id)
      )
    })
  })
})

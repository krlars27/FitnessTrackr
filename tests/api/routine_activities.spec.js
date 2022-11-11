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
  UnauthorizedUpdateError,
  UnauthorizedDeleteError,
} = require("../../errors")

const { objectContaining } = expect

describe("/api/routine_activities", () => {
  describe("PATCH /api/routine_activities/:routineActivityId (**)", () => {
    it("Updates the count or duration on the routine activity", async () => {
      const { fakeUser, token } = await createFakeUserWithToken("Smith")
      const fakeRoutine = await createFakePublicRoutine(
        fakeUser.id,
        "On Saturday",
        "Until I'm stronger"
      )
      const fakeActivity = await createFakeActivity(
        "Free Weights",
        "Lift all the things"
      )
      const fakeRoutineActivity = await createFakeRoutineActivity(
        fakeRoutine.id,
        fakeActivity.id
      )

      const updatedRoutineActivityData = {
        count: faker.random.number(),
        duration: faker.random.number(),
      }

      const response = await request(app)
        .patch(`/api/routine_activities/${fakeRoutineActivity.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updatedRoutineActivityData)

      expectNotToBeError(response.body)

      expect(response.body).toMatchObject(updatedRoutineActivityData)
    })

    it("should return an error if the owner of the routine isn't the one trying to edit it", async () => {
      const { fakeUser } = await createFakeUserWithToken("Lauren")

      const fakeRoutine = await createFakePublicRoutine(
        fakeUser.id,
        "In the evening",
        "until I lose 5 pounds"
      )
      const fakeActivity = await createFakeActivity(
        "Jump Rope",
        "Just like we did on the school yard"
      )
      const fakeRoutineActivity = await createFakeRoutineActivity(
        fakeRoutine.id,
        fakeActivity.id
      )

      const updatedRoutineActivityData = {
        count: faker.random.number(),
        duration: faker.random.number(),
      }

      // Create a second user
      const { fakeUser: secondUser, token: secondUserToken } =
        await createFakeUserWithToken("Lizzy")

      // That user tries to modify the routine activity
      const response = await request(app)
        .patch(`/api/routine_activities/${fakeRoutineActivity.id}`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(updatedRoutineActivityData)

      expectToHaveErrorMessage(
        response.body,
        UnauthorizedUpdateError(secondUser.username, fakeRoutine.name)
      )
    })
  })

  describe("DELETE /api/routine_activities/:routineActivityId (**)", () => {
    it("Removes an activity from a routine, uses hard delete", async () => {
      const { fakeUser, token } = await createFakeUserWithToken("Linus")
      const fakeRoutine = await createFakePublicRoutine(
        fakeUser.id,
        "In the morning",
        "Early bird gets the worm"
      )
      const fakeActivity = await createFakeActivity(
        "Walk 10 miles",
        "All the walking"
      )
      const fakeRoutineActivity = await createFakeRoutineActivity(
        fakeRoutine.id,
        fakeActivity.id
      )

      const response = await request(app)
        .delete(`/api/routine_activities/${fakeRoutineActivity.id}`)
        .set("Authorization", `Bearer ${token}`)

      expectNotToBeError(response.body)

      expect(response.body).toStrictEqual(objectContaining(fakeRoutineActivity))
    })

    it("Logged in user should be the owner of the modified object.", async () => {
      const { fakeUser } = await createFakeUserWithToken("Lucy")

      const fakeRoutine = await createFakePublicRoutine(
        fakeUser.id,
        "In the afternoon",
        "Until Charlie Brown gives up"
      )
      const fakeActivity = await createFakeActivity(
        "Football Kicking",
        "Make sure you pull it away quick"
      )
      const fakeRoutineActivity = await createFakeRoutineActivity(
        fakeRoutine.id,
        fakeActivity.id
      )

      // Create a second user
      const { fakeUser: secondUser, token: secondUserToken } =
        await createFakeUserWithToken("Charlie")

      const response = await request(app)
        .delete(`/api/routine_activities/${fakeRoutineActivity.id}`)
        .set("Authorization", `Bearer ${secondUserToken}`)
      expect(response.status).toEqual(403)

      expectToHaveErrorMessage(
        response.body,
        UnauthorizedDeleteError(secondUser.username, fakeRoutine.name)
      )
    })
  })
})

/* 

DO NOT CHANGE THIS FILE

*/
require("dotenv").config()
const request = require("supertest")
const app = require("../../app")
const {
  createFakeUserWithToken,
  createFakeUserWithRoutines,
  createFakeActivity,
  createFakeRoutineActivity,
} = require("../helpers")
const {
  expectToBeError,
  expectNotToBeError,
  expectToHaveErrorMessage,
} = require("../expectHelpers")

const { ActivityExistsError, ActivityNotFoundError } = require("../../errors")

const { arrayContaining } = expect

const { getPublicRoutinesByActivity } = require("../../db")

describe("/api/activities", () => {
  describe("GET /api/activities", () => {
    it("Just returns a list of all activities in the database", async () => {
      // Create a fake activity to watch for
      const fakeActivity = await createFakeActivity(
        "Running",
        "Let's Go for a jog"
      )

      const response = await request(app).get("/api/activities")

      expectNotToBeError(response.body)

      expect(response.body).toEqual(arrayContaining([fakeActivity]))
    })
  })

  describe("POST /api/activities (*)", () => {
    it("Creates a new activity", async () => {
      const { token } = await createFakeUserWithToken("bob")

      const activityData = {
        name: "Pull ups",
        description: "Do 20 reps",
      }

      const response = await request(app)
        .post("/api/activities")
        .send(activityData)
        .set("Authorization", `Bearer ${token}`)

      expectNotToBeError(response.body)

      expect(response.body).toMatchObject(activityData)
    })

    it("responds with an error when a activity already exists with the same name", async () => {
      const { token } = await createFakeUserWithToken("alice")

      await createFakeActivity("Push Ups", "Do 30 reps")

      const activityData = {
        name: "Push Ups",
        description: "Do 25 reps",
      }

      const response = await request(app)
        .post("/api/activities")
        .send(activityData)
        .set("Authorization", `Bearer ${token}`)

      expectToHaveErrorMessage(
        response.body,
        ActivityExistsError(activityData.name)
      )
    })
  })

  describe("PATCH /api/activities/:activityId (*)", () => {
    it("Anyone can update an activity (yes, this could lead to long term problems a la wikipedia)", async () => {
      const { token } = await createFakeUserWithToken("Allison")
      const fakeActivity = await createFakeActivity(
        "Run in Place",
        "30 minutes"
      )

      const newActivityData = {
        name: "Walk in Place",
        description: "45 minutes",
      }

      const response = await request(app)
        .patch(`/api/activities/${fakeActivity.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(newActivityData)

      expectNotToBeError(response.body)

      expect(response.body).toEqual({
        id: expect.any(Number),
        ...newActivityData,
      })
    })

    it("returns an error when updating an activity that does not exist", async () => {
      const { token } = await createFakeUserWithToken("Barry")

      const newActivityData = {
        name: "Run laps",
        description: "Run 3 laps",
      }

      const response = await request(app)
        .patch(`/api/activities/10000`)
        .set("Authorization", `Bearer ${token}`)
        .send(newActivityData)

      expectToHaveErrorMessage(response.body, ActivityNotFoundError(10000))
    })

    it("returns an error when changing an activity to have the name of an existing activity", async () => {
      const { token } = await createFakeUserWithToken("Jane")
      const fakeActivity = await createFakeActivity(
        "Beat Saber",
        "VR is good exercise"
      )
      const secondFakeActivity = await createFakeActivity(
        "Aerobics",
        "Good for the heart"
      )

      const newActivityData = {
        name: secondFakeActivity.name,
        description: "Good for the heart",
      }

      const response = await request(app)
        .patch(`/api/activities/${fakeActivity.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(newActivityData)

      expectToHaveErrorMessage(
        response.body,
        ActivityExistsError(secondFakeActivity.name)
      )
      expectToBeError(response.body)
    })
  })

  describe("GET /api/activities/:activityId/routines", () => {
    it("Get a list of all public routines which feature that activity", async () => {
      const { fakeRoutines } = await createFakeUserWithRoutines("Allen")
      const fakeActivity = await createFakeActivity(
        "Weight Lifting",
        "30 lbs for 20 reps"
      )

      // Loop through the routines and associate the activity with them
      for (const fakeRoutine of fakeRoutines) {
        await createFakeRoutineActivity(fakeRoutine.id, fakeActivity.id)
      }

      const response = await request(app).get(
        `/api/activities/${fakeActivity.id}/routines`
      )

      expectNotToBeError(response.body)

      // Get the routines from the DB Directly
      const routinesFromDB = await getPublicRoutinesByActivity(fakeActivity)

      expect(response.body).toEqual(routinesFromDB)
    })

    it("Should return an error when you ask for an activity that does not exist", async () => {
      const response = await request(app).get("/api/activities/10000/routines")

      expectToHaveErrorMessage(response.body, ActivityNotFoundError(10000))
    })
  })
})

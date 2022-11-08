/* 

DO NOT CHANGE THIS FILE

*/
require("dotenv").config();
const client = require('../../db/client');
const {
  getAllActivities,
  createActivity,
  updateActivity,
  getActivityById,
  getActivityByName,
} = require("../../db");
const { createFakeActivity } = require("../helpers");

describe("DB Activities", () => {

  describe("getAllActivities", () => {
    it("selects and returns an array of all activities", async () => {
      await createFakeActivity("Sit ups", "Do 100 reps");
      const activities = await getAllActivities();
      const { rows: activitiesFromDatabase } = await client.query(`
        SELECT * FROM activities;
      `);
      expect(activities).toEqual(activitiesFromDatabase);
    });
  });

  describe("getActivityById", () => {
    it("gets activities by their id", async () => {
      const fakeActivity = await createFakeActivity("Crunches", "Do 40 reps");

      const activity = await getActivityById(fakeActivity.id);

      expect(activity.id).toEqual(fakeActivity.id);
      expect(activity.name).toEqual(fakeActivity.name);
      expect(activity.description).toEqual(fakeActivity.description);
    });
  });

  describe("getActivityByName", () => {
    it("gets an activity by it's name", async () => {
      const fakeActivity = await createFakeActivity("Power Walking", "At the mall");
      const activity = await getActivityByName(fakeActivity.name);
      expect(activity.id).toEqual(fakeActivity.id);
    });
  });

  describe("createActivity({ name, description })", () => {
    it("Creates and returns the new activity", async () => {
      const activityToCreate = {
        name: "Marathon",
        description: "Run all the miles",
      };
      const createdActivity = await createActivity(activityToCreate);
      expect(createdActivity.name).toBe(activityToCreate.name);
      expect(createdActivity.description).toBe(activityToCreate.description);
    });
  });

  describe("updateActivity", () => {
    it("Updates name without affecting the ID. Returns the updated Activity.", async () => {
      const fakeActivity = await createFakeActivity("Baseball", "Run the bases");
      const name = "Softball";
      const updatedActivity = await updateActivity({
        id: fakeActivity.id,
        name,
      });
      expect(updatedActivity.id).toEqual(fakeActivity.id);
      expect(updatedActivity.name).toEqual(name);
      expect(updatedActivity.description).toEqual(fakeActivity.description);
    });

    it("Updates description without affecting the ID. Returns the updated Activity.", async () => {
      const fakeActivity = await createFakeActivity("Soccer", "After school");
      const description = "Football is life!";
      const updatedActivity = await updateActivity({
        id: fakeActivity.id,
        description,
      });
      expect(updatedActivity.id).toEqual(fakeActivity.id);
      expect(updatedActivity.name).toEqual(fakeActivity.name);
      expect(updatedActivity.description).toEqual(description);
    });
  });
});


const {
    getAllActivities,
    createActivity,
    updateActivity,
    getActivityById,
    getActivityByName,
} = require("../../db/activities");

describe("Activity SQL Injection Security", () => {
    it("treats SQL injection in an activity name lookup as literal text", async () => {
        await createActivity({
            name: "Running",
            description: "Daily exercise",
        });

        const maliciousName = "' OR '1'='1' --";
        const result = await getActivityByName(maliciousName);

        expect(result).toBeNull();
    });

    it("stores SQL injection attempts as literal activity data", async () => {
        const maliciousName = "'; DROP TABLE activities; --";

        const createdActivity = await createActivity({
            name: maliciousName,
            description: "Security test",
        });

        expect(createdActivity.name).toBe(maliciousName);

        const retrievedActivity = await getActivityById(createdActivity.id);

        expect(retrievedActivity.name).toBe(maliciousName);

        // The activities table should still exist and remain queryable.
        const activities = await getAllActivities();

        expect(activities.length).toBeGreaterThan(0);
    });

    it("treats SQL injection attempts in updates as literal text", async () => {
        const activity = await createActivity({
            name: "Security Test Activity",
            description: "Original description",
        });

        const maliciousDescription = "'; DROP TABLE activities; --";

        const updatedActivity = await updateActivity({
            id: activity.id,
            description: maliciousDescription,
        });

        expect(updatedActivity.description).toBe(maliciousDescription);

        const retrievedActivity = await getActivityById(activity.id);

        expect(retrievedActivity.description).toBe(maliciousDescription);

        // Confirm the table and original record remain intact.
        expect(await getActivityByName("Security Test Activity")).not.toBeNull();
    });
});

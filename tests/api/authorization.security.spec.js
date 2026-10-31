
require("dotenv").config();

const request = require("supertest");
const app = require("../../app");

const {
    createFakeUserWithToken,
    createFakePublicRoutine,
    createFakeActivity,
    createFakeRoutineActivity,
} = require("../helpers");

const {
    getRoutineById,
    getRoutineActivityById,
} = require("../../db");

describe("Authorization Security Tests", () => {
    it("prevents another user from modifying a routine", async () => {
        const { fakeUser } = await createFakeUserWithToken("RoutineOwner");
        const { token: attackerToken } =
            await createFakeUserWithToken("UnauthorizedUser");

        const routine = await createFakePublicRoutine(
            fakeUser.id,
            "Original Routine",
            "Original Goal"
        );

        const response = await request(app)
            .patch(`/api/routines/${routine.id}`)
            .set("Authorization", `Bearer ${attackerToken}`)
            .send({
                name: "Hacked Routine",
                goal: "Unauthorized change",
            });

        expect(response.status).toBe(403);

        const savedRoutine = await getRoutineById(routine.id);

        expect(savedRoutine.name).toBe("Original Routine");
        expect(savedRoutine.goal).toBe("Original Goal");
    });

    it("prevents another user from deleting a routine", async () => {
        const { fakeUser } = await createFakeUserWithToken("DeleteOwner");
        const { token: attackerToken } =
            await createFakeUserWithToken("DeleteAttacker");

        const routine = await createFakePublicRoutine(
            fakeUser.id,
            "Protected Routine",
            "Do not delete"
        );

        const response = await request(app)
            .delete(`/api/routines/${routine.id}`)
            .set("Authorization", `Bearer ${attackerToken}`);

        expect(response.status).toBe(403);

        const savedRoutine = await getRoutineById(routine.id);

        expect(savedRoutine).not.toBeNull();
        expect(savedRoutine.name).toBe("Protected Routine");
    });

    it("prevents another user from modifying a routine activity", async () => {
        const { fakeUser } = await createFakeUserWithToken("ActivityOwner");
        const { token: attackerToken } =
            await createFakeUserWithToken("ActivityAttacker");

        const routine = await createFakePublicRoutine(fakeUser.id);
        const activity = await createFakeActivity(
            "Protected Exercise",
            "Original description"
        );

        const routineActivity = await createFakeRoutineActivity(
            routine.id,
            activity.id
        );

        const response = await request(app)
            .patch(`/api/routine_activities/${routineActivity.id}`)
            .set("Authorization", `Bearer ${attackerToken}`)
            .send({
                count: 999,
                duration: 999,
            });

        expect(response.status).toBe(403);

        const savedActivity = await getRoutineActivityById(
            routineActivity.id
        );

        expect(savedActivity.count).toBe(routineActivity.count);
        expect(savedActivity.duration).toBe(routineActivity.duration);
    });

    it("prevents another user from deleting a routine activity", async () => {
        const { fakeUser } = await createFakeUserWithToken("ActivityDeleteOwner");
        const { token: attackerToken } =
            await createFakeUserWithToken("ActivityDeleteAttacker");

        const routine = await createFakePublicRoutine(fakeUser.id);
        const activity = await createFakeActivity();

        const routineActivity = await createFakeRoutineActivity(
            routine.id,
            activity.id
        );

        const response = await request(app)
            .delete(`/api/routine_activities/${routineActivity.id}`)
            .set("Authorization", `Bearer ${attackerToken}`);

        expect(response.status).toBe(403);

        const savedActivity = await getRoutineActivityById(
            routineActivity.id
        );

        expect(savedActivity).not.toBeNull();
    });
});

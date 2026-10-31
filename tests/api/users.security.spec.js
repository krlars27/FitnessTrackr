require("dotenv").config();


const request = require("supertest");
const app = require("../../app");

const { createUser } = require("../../db/users");
const { createFakeUserWithToken } = require("../helpers");

it("does not expose password hashes during login", async () => {
    const username = "SecureLoginUser";
    const password = "TestPassword123";

    await createUser({ username, password });

    const response = await request(app)
        .post("/api/users/login")
        .send({ username, password });

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.user.passwordHash).toBeUndefined();
});
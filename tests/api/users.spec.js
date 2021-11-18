/* 

DO NOT CHANGE THIS FILE

*/
require("dotenv").config()
const request = require("supertest")
const faker = require("faker")
const client = require("../../db/client")
const app = require("../../app")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {
  createFakeUserWithToken,
  createFakeUserWithRoutines,
} = require("../helpers")
const {
  expectToBeError,
  expectNotToBeError,
  expectToHaveErrorMessage,
} = require("../expectHelpers")

const { JWT_SECRET = "neverTell" } = process.env

const { objectContaining } = expect

const {
  getPublicRoutinesByUser,
  createUser,
  getAllRoutinesByUser,
} = require("../../db")
const {
  UserTakenError,
  PasswordTooShortError,
  UnauthorizedError,
} = require("../../errors")

describe("/api/users", () => {
  describe("POST /api/users/register", () => {
    it("Creates a new user.", async () => {
      // Create some fake user data
      const fakeUserData = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
      }
      // Register the user
      const response = await request(app)
        .post("/api/users/register")
        .send(fakeUserData)

      expectNotToBeError(response.body)

      expect(response.body).toMatchObject({
        message: expect.any(String),
        token: expect.any(String),
        user: {
          id: expect.any(Number),
          username: fakeUserData.username,
        },
      })
    })

    it("EXTRA CREDIT: Hashes password before saving user to DB.", async () => {
      // Create some fake user data
      const fakeUserData = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
      }

      // Create the user through the API
      const response = await request(app)
        .post("/api/users/register")
        .send(fakeUserData)

      expectNotToBeError(response.body)

      // Grab the user from the DB manually so we can
      // get the hashed password and check it
      const {
        rows: [user],
      } = await client.query(
        `
          SELECT *
          FROM users
          WHERE id = $1;
        `,
        [response.body.user.id]
      )

      const hashedPassword = user.password

      // The original password and the hashedPassword shouldn't be the same
      expect(fakeUserData.password).not.toBe(hashedPassword)
      // Bcrypt.compare should return true.
      expect(await bcrypt.compare(fakeUserData.password, hashedPassword)).toBe(
        true
      )
    })

    it("Throws errors for duplicate username", async () => {
      // Create a fake user in the DB
      const { fakeUser: firstUser } = await createFakeUserWithToken()
      // Now try to create a user with the same username
      const secondUserData = {
        username: firstUser.username,
        password: faker.internet.password(),
      }

      const response = await request(app)
        .post("/api/users/register")
        .send(secondUserData)

      expectToBeError(response.body)

      expectToHaveErrorMessage(
        response.body,
        UserTakenError(firstUser.username)
      )
    })

    it("returns error if password is less than 8 characters.", async () => {
      // Create some user data with a password with 7 characters
      const newUserShortPassword = {
        username: faker.internet.userName(),
        password: faker.internet.password(7),
      }

      const response = await request(app)
        .post("/api/users/register")
        .send(newUserShortPassword)

      expectToHaveErrorMessage(response.body, PasswordTooShortError())
    })
  })

  describe("POST /api/users/login", () => {
    it("Logs in the user. Requires username and password, and verifies that hashed login password matches the saved hashed password.", async () => {
      // Create some fake user data
      const userData = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
      }
      // Create the user in the DB
      await createUser(userData)
      // Login the user
      const response = await request(app)
        .post("/api/users/login")
        .send(userData)

      expectNotToBeError(response.body)

      expect(response.body).toEqual(
        objectContaining({
          message: "you're logged in!",
        })
      )
    })

    it("Logs in the user and returns the user back to us", async () => {
      // Create some fake user data
      const userData = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
      }
      // Create the user in the DB
      const user = await createUser(userData)
      // Login the user
      const response = await request(app)
        .post("/api/users/login")
        .send(userData)

      expectNotToBeError(response.body)

      // The body should contain the user info
      expect(response.body).toMatchObject({
        user,
      })
    })

    it("Returns a JSON Web Token. Stores the id and username in the token.", async () => {
      const userData = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
      }
      // Create the user in the DB
      const user = await createUser(userData)
      // Login the user
      const { body } = await request(app)
        .post("/api/users/login")
        .send(userData)

      expectNotToBeError(body)

      expect(body).toMatchObject({
        token: expect.any(String),
      })
      // Verify the JWT token
      const parsedToken = jwt.verify(body.token, JWT_SECRET)
      // The token should return an object just like the user
      expect(parsedToken).toMatchObject(user)
    })
  })

  describe("GET /api/users/me", () => {
    it("sends back users data if valid token is supplied in header", async () => {
      const { fakeUser, token } = await createFakeUserWithToken()

      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${token}`)

      expectNotToBeError(response.body)

      expect(response.body).toEqual(objectContaining(fakeUser))
    })

    it("rejects requests with no valid token", async () => {
      const response = await request(app).get("/api/users/me")

      expect(response.status).toBe(401)

      expectToHaveErrorMessage(response.body, UnauthorizedError())
    })
  })

  describe("GET /api/users/:username/routines", () => {
    it("Gets a list of public routines for a particular user.", async () => {
      // Create a fake user with a bunch of routines associated
      const { fakeUser, token } = await createFakeUserWithRoutines("Greg")

      const response = await request(app)
        .get(`/api/users/${fakeUser.username}/routines`)
        .set("Authorization", `Bearer ${token}`)

      expectNotToBeError(response.body)

      // Get the routines from the DB
      const routinesFromDB = await getPublicRoutinesByUser(fakeUser)

      expect(response.body).toEqual([...routinesFromDB])
    })

    it("gets a list of all routines for the logged in user", async () => {
      const { fakeUser, token } = await createFakeUserWithRoutines("Angela")
      const response = await request(app)
        .get(`/api/users/${fakeUser.username}/routines`)
        .set("Authorization", `Bearer ${token}`)

      expectNotToBeError(response.body)

      const routinesFromDB = await getAllRoutinesByUser(fakeUser)

      expect(response.body).toEqual([...routinesFromDB])
    })
  })
})

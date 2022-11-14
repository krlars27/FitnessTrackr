/* 

DO NOT CHANGE THIS FILE

*/
require("dotenv").config()
const request = require("supertest")
require("../../db/client");
const app = require("../../app");

describe("/api/health", () => {
  it("responds to a request at /api/health with a message specifying it is healthy", async (done) => {
    const response = await request(app).get("/api/health")
    expect(response.status).toEqual(200);
    expect(typeof response.body.message).toEqual("string")
    done();
  })
})

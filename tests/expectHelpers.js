function expectNotToBeError(body) {
  expect(body).not.toEqual({
    message: expect.any(String),
    name: expect.any(String),
    error: expect.any(String)
  });
}

function expectToBeError(body) {
  expect(body).toEqual({
    message: expect.any(String),
    name: expect.any(String),
    error: expect.any(String)
  });
}

function expectToHaveErrorMessage(body, message) {
  expect(body).toEqual({
    message,
    name: expect.any(String),
    error: expect.any(String)
  })
}

module.exports = {
  expectToBeError,
  expectNotToBeError,
  expectToHaveErrorMessage
}

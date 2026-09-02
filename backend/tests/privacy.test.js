const assert = require('node:assert/strict')
const test = require('node:test')

const { errorHandler } = require('../src/middleware/errorHandler')

test('errorHandler does not log an id card carried by an underlying database error', () => {
  const error = new Error('database write failed')
  error.sql = "INSERT INTO reservation (id_card) VALUES ('11010519491231002X')"
  const logged = []
  const originalConsoleError = console.error
  console.error = (...args) => logged.push(args)

  try {
    const response = {
      headersSent: false,
      status() { return this },
      json() {},
    }
    errorHandler(error, {}, response, () => {})
  } finally {
    console.error = originalConsoleError
  }

  assert.doesNotMatch(JSON.stringify(logged), /11010519491231002X/)
})

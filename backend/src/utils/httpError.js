function createHttpError(status, message, data = null) {
  const error = new Error(message)
  error.status = status
  error.data = data
  return error
}

module.exports = { createHttpError }

function notFoundHandler(request, response) {
  response.status(404).json({
    code: 404,
    message: 'resource not found',
    data: null,
  })
}

function errorHandler(error, request, response, next) {
  console.error(error)

  if (response.headersSent) {
    return next(error)
  }

  response.status(500).json({
    code: 500,
    message: 'internal server error',
    data: null,
  })
}

module.exports = { errorHandler, notFoundHandler }

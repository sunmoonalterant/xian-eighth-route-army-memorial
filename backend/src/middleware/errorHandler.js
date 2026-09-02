function notFoundHandler(request, response) {
  response.status(404).json({
    code: 404,
    message: 'resource not found',
    data: null,
  })
}

function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error)
  }

  const status = Number.isInteger(error.status) ? error.status : 500
  if (status >= 500) {
    console.error({ code: error.code || 'INTERNAL_ERROR', message: error.message })
  }
  response.status(status).json({
    code: status,
    message: status === 500 ? 'internal server error' : error.message,
    data: status === 500 ? null : (error.data ?? null),
  })
}

module.exports = { errorHandler, notFoundHandler }

const { recordVisit } = require('../services/visitLogService')

function createVisitLogController(pool) {
  return {
    record: async (request, response, next) => {
      try {
        await recordVisit(pool, request.body)
        response.json({ code: 200, message: 'success', data: null })
      } catch (error) {
        next(error)
      }
    },
  }
}

module.exports = { createVisitLogController }

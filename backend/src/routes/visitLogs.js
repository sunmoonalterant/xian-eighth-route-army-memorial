const express = require('express')
const { createVisitLogController } = require('../controllers/visitLogController')

function createVisitLogRouter(pool) {
  const router = express.Router()
  const controller = createVisitLogController(pool)
  router.post('/visit-logs', controller.record)
  return router
}

module.exports = createVisitLogRouter

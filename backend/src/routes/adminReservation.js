const express = require('express')
const { createAdminReservationController } = require('../controllers/adminReservationController')

function createAdminReservationRouter(pool, authenticate) {
  const router = express.Router()
  const controller = createAdminReservationController(pool)

  router.use(authenticate)
  router.get('/', controller.getReservations)
  router.get('/:id', controller.getReservation)
  router.patch('/:id/status', controller.updateReservationStatus)

  return router
}

module.exports = createAdminReservationRouter

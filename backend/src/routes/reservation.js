const express = require('express')
const { createReservationController } = require('../controllers/reservationController')

function createReservationRouter(pool) {
  const router = express.Router()
  const controller = createReservationController(pool)

  router.get('/visit-schedules', controller.getVisitSchedules)
  router.post('/reservations', controller.createReservation)
  router.get('/reservations/query', controller.queryReservation)
  router.post('/reservations/:reservationNo/cancel', controller.cancelReservation)

  return router
}

module.exports = createReservationRouter

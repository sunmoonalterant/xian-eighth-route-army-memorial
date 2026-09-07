const express = require('express')
const { createStatisticsController } = require('../controllers/statisticsController')

function createStatisticsRouter(pool, authenticate) {
  const router = express.Router()
  const controller = createStatisticsController(pool)
  router.use(authenticate)
  router.get('/overview', controller.overview)
  router.get('/traffic-trend', controller.trafficTrend)
  router.get('/page-ranking', controller.pageRanking)
  router.get('/reservations', controller.reservations)
  router.get('/reservation-trend', controller.reservationTrend)
  router.get('/period-distribution', controller.periodDistribution)
  return router
}

module.exports = createStatisticsRouter

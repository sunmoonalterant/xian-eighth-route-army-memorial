const statisticsService = require('../services/statisticsService')

function createStatisticsController(pool) {
  return {
    overview: async (request, response, next) => {
      try { response.json({ code: 200, message: 'success', data: await statisticsService.getOverview(pool) }) } catch (error) { next(error) }
    },
    trafficTrend: async (request, response, next) => {
      try {
        const days = statisticsService.parseBoundedInteger(request.query.days, 'days', 7, 90)
        response.json({ code: 200, message: 'success', data: await statisticsService.getTrafficTrend(pool, days) })
      } catch (error) { next(error) }
    },
    pageRanking: async (request, response, next) => {
      try {
        const limit = statisticsService.parseBoundedInteger(request.query.limit, 'limit', 10, 50)
        response.json({ code: 200, message: 'success', data: await statisticsService.getPageRanking(pool, limit) })
      } catch (error) { next(error) }
    },
    reservations: async (request, response, next) => {
      try { response.json({ code: 200, message: 'success', data: await statisticsService.getReservationSummary(pool) }) } catch (error) { next(error) }
    },
    reservationTrend: async (request, response, next) => {
      try {
        const days = statisticsService.parseBoundedInteger(request.query.days, 'days', 7, 90)
        response.json({ code: 200, message: 'success', data: await statisticsService.getReservationTrend(pool, days) })
      } catch (error) { next(error) }
    },
    periodDistribution: async (request, response, next) => {
      try { response.json({ code: 200, message: 'success', data: await statisticsService.getPeriodDistribution(pool) }) } catch (error) { next(error) }
    },
  }
}

module.exports = { createStatisticsController }

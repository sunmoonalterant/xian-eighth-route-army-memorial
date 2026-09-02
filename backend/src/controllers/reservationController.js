const visitScheduleService = require('../services/visitScheduleService')
const reservationService = require('../services/reservationService')
const { createHttpError } = require('../utils/httpError')
const { validatePhone, validateReservationInput, validateReservationNo } = require('../utils/reservationValidation')
const { parseVisitDate } = require('../utils/visitDate')

function createReservationController(pool) {
  return {
    getVisitSchedules: async (request, response, next) => {
      try {
        const visitDate = parseVisitDate(request.query.date)
        const schedules = await visitScheduleService.getSchedules(pool, visitDate)
        response.json({ code: 200, message: 'success', data: schedules })
      } catch (error) {
        next(error)
      }
    },
    createReservation: async (request, response, next) => {
      try {
        const input = validateReservationInput(request.body)
        const reservation = await reservationService.createReservation(pool, input)
        response.status(201).json({ code: 201, message: 'success', data: reservation })
      } catch (error) {
        next(error)
      }
    },
    queryReservation: async (request, response, next) => {
      try {
        if (!request.query.reservationNo || !request.query.phone) {
          throw createHttpError(400, 'reservationNo and phone are required')
        }
        const reservationNo = validateReservationNo(request.query.reservationNo)
        const phone = validatePhone(request.query.phone)
        const reservation = await reservationService.getReservationByNoAndPhone(pool, reservationNo, phone)
        if (!reservation) throw createHttpError(404, 'reservation not found')
        response.json({ code: 200, message: 'success', data: reservation })
      } catch (error) {
        next(error)
      }
    },
    cancelReservation: async (request, response, next) => {
      try {
        const reservationNo = validateReservationNo(request.params.reservationNo)
        const phone = validatePhone(request.body?.phone)
        const reservation = await reservationService.cancelReservation(pool, reservationNo, phone)
        response.json({ code: 200, message: 'success', data: reservation })
      } catch (error) {
        next(error)
      }
    },
  }
}

module.exports = { createReservationController }

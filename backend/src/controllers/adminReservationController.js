const adminReservationService = require('../services/adminReservationService')
const { createHttpError } = require('../utils/httpError')
const { parsePagination, parsePositiveInteger } = require('../utils/pagination')

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function parseStatus(value) {
  if (value === undefined || value === '') return undefined
  const status = typeof value === 'string' ? value.trim().toUpperCase() : ''
  if (!Object.hasOwn(adminReservationService.STATUS_VALUES, status)) {
    throw createHttpError(400, 'status is invalid')
  }
  return adminReservationService.STATUS_VALUES[status]
}

function parseFilterDate(value) {
  if (value === undefined || value === '') return undefined
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw createHttpError(400, 'visitDate must use YYYY-MM-DD format')
  }
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw createHttpError(400, 'visitDate must use YYYY-MM-DD format')
  }
  return value
}

function parseNextStatus(value) {
  const status = typeof value === 'string' ? value.trim().toUpperCase() : ''
  if (!Object.hasOwn(adminReservationService.STATUS_VALUES, status)) {
    throw createHttpError(400, 'status is invalid')
  }
  return status
}

function createAdminReservationController(pool) {
  return {
    getReservations: async (request, response, next) => {
      try {
        const pagination = parsePagination(request.query)
        const keyword = typeof request.query.keyword === 'string' ? request.query.keyword.trim() : ''
        const result = await adminReservationService.getReservationList(pool, {
          keyword,
          status: parseStatus(request.query.status),
          visitDate: parseFilterDate(request.query.visitDate),
        }, pagination)
        response.json({
          code: 200,
          message: 'success',
          data: { ...result, page: pagination.page, pageSize: pagination.pageSize },
        })
      } catch (error) {
        next(error)
      }
    },
    getReservation: async (request, response, next) => {
      try {
        const id = parsePositiveInteger(request.params.id, 'id')
        const reservation = await adminReservationService.getReservationDetail(pool, id)
        if (!reservation) throw createHttpError(404, 'reservation not found')
        response.json({ code: 200, message: 'success', data: reservation })
      } catch (error) {
        next(error)
      }
    },
    updateReservationStatus: async (request, response, next) => {
      try {
        const id = parsePositiveInteger(request.params.id, 'id')
        const status = parseNextStatus(request.body?.status)
        const reservation = await adminReservationService.updateReservationStatus(pool, id, status)
        response.json({ code: 200, message: 'success', data: reservation })
      } catch (error) {
        next(error)
      }
    },
  }
}

module.exports = { createAdminReservationController, parseFilterDate, parseNextStatus, parseStatus }

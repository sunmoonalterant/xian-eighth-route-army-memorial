const service = require('../services/historyEventService')
const { createHttpError } = require('../utils/httpError')
const { parsePagination, parsePositiveInteger } = require('../utils/pagination')

function parseOptionalBoolean(value) {
  if (value === undefined || value === '') return undefined
  return value === true || value === 1 || value === 'true' || value === '1'
}

function parseHistoryFilters(query, admin = false) {
  const featured = parseOptionalBoolean(query.featured)
  const result = {
    keyword: typeof query.keyword === 'string' ? query.keyword.trim() : '',
    featured: featured === true,
  }

  if (!admin) return result

  if (query.reviewStatus) result.reviewStatus = query.reviewStatus
  if (query.status !== undefined && query.status !== '') result.status = Number(query.status)
  if (featured !== undefined) result.featured = featured
  return result
}

function createHistoryEventController(pool, admin = false) {
  return {
    list: async (req, res, next) => {
      try {
        const pagination = parsePagination(req.query)
        const result = await service.getList(pool, parseHistoryFilters(req.query, admin), pagination, admin)
        res.json({ code: 200, message: 'success', data: { ...result, page: pagination.page, pageSize: pagination.pageSize } })
      } catch (error) { next(error) }
    },
    getOne: async (req, res, next) => {
      try {
        const row = await service.getOne(pool, parsePositiveInteger(req.params.id, 'id'), admin)
        if (!row) throw createHttpError(404, 'history event not found')
        res.json({ code: 200, message: 'success', data: row })
      } catch (error) { next(error) }
    },
    create: async (req, res, next) => {
      try { res.status(201).json({ code: 201, message: 'success', data: await service.create(pool, req.body) }) } catch (error) { next(error) }
    },
    update: async (req, res, next) => {
      try { res.json({ code: 200, message: 'success', data: await service.update(pool, parsePositiveInteger(req.params.id, 'id'), req.body) }) } catch (error) { next(error) }
    },
    remove: async (req, res, next) => {
      try { res.json({ code: 200, message: 'success', data: await service.hide(pool, parsePositiveInteger(req.params.id, 'id')) }) } catch (error) { next(error) }
    },
  }
}

module.exports = { createHistoryEventController, parseHistoryFilters }

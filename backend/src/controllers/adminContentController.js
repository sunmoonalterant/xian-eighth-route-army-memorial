const service = require('../services/adminContentService')
const { createHttpError } = require('../utils/httpError')
const { parsePagination, parsePositiveInteger } = require('../utils/pagination')

function parseFilters(query, supportsCategory) {
  const filters = { keyword: typeof query.keyword === 'string' ? query.keyword.trim() : '' }
  if (supportsCategory && query.categoryId !== undefined && query.categoryId !== '') {
    filters.categoryId = parsePositiveInteger(query.categoryId, 'categoryId')
  }
  return filters
}

function createAdminContentController(pool, domain, { supportsCategory = false } = {}) {
  return {
    list: async (request, response, next) => {
      try {
        const pagination = parsePagination(request.query)
        const data = await service.getList(pool, domain, parseFilters(request.query, supportsCategory), pagination)
        response.json({ code: 200, message: 'success', data: { ...data, page: pagination.page, pageSize: pagination.pageSize } })
      } catch (error) { next(error) }
    },
    categories: async (request, response, next) => {
      try { response.json({ code: 200, message: 'success', data: await service.getCategories(pool, domain) }) } catch (error) { next(error) }
    },
    getOne: async (request, response, next) => {
      try {
        const id = parsePositiveInteger(request.params.id, 'id')
        const data = await service.getOne(pool, domain, id)
        if (!data) throw createHttpError(404, `${domain} not found`)
        response.json({ code: 200, message: 'success', data })
      } catch (error) { next(error) }
    },
    create: async (request, response, next) => {
      try { response.status(201).json({ code: 201, message: 'success', data: await service.create(pool, domain, request.body) }) } catch (error) { next(error) }
    },
    update: async (request, response, next) => {
      try {
        const id = parsePositiveInteger(request.params.id, 'id')
        response.json({ code: 200, message: 'success', data: await service.update(pool, domain, id, request.body) })
      } catch (error) { next(error) }
    },
    remove: async (request, response, next) => {
      try {
        const id = parsePositiveInteger(request.params.id, 'id')
        response.json({ code: 200, message: 'success', data: await service.hide(pool, domain, id) })
      } catch (error) { next(error) }
    },
  }
}

module.exports = { createAdminContentController }

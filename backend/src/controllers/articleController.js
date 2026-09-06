const service = require('../services/adminContentService')
const { applyPublicMedia } = require('../services/mediaAssetService')
const { createHttpError } = require('../utils/httpError')
const { parsePagination, parsePositiveInteger } = require('../utils/pagination')

function createArticleController(pool) {
  return {
    list: async (request, response, next) => {
      try {
        const pagination = parsePagination(request.query)
        const filters = { keyword: typeof request.query.keyword === 'string' ? request.query.keyword.trim() : '' }
        if (request.query.categoryId !== undefined && request.query.categoryId !== '') filters.categoryId = parsePositiveInteger(request.query.categoryId, 'categoryId')
        const result = await service.getList(pool, 'article', filters, pagination, true)
        result.list = await Promise.all(result.list.map((article) => applyPublicMedia(pool, 'article', article)))
        response.json({ code: 200, message: 'success', data: { ...result, page: pagination.page, pageSize: pagination.pageSize } })
      } catch (error) { next(error) }
    },
    getOne: async (request, response, next) => {
      try {
        const article = await service.getOne(pool, 'article', parsePositiveInteger(request.params.id, 'id'), true)
        if (!article) throw createHttpError(404, 'article not found')
        response.json({ code: 200, message: 'success', data: await applyPublicMedia(pool, 'article', article) })
      } catch (error) { next(error) }
    },
  }
}

module.exports = { createArticleController }

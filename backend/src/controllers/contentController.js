const exhibitionService = require('../services/exhibitionService')
const museumService = require('../services/museumService')
const relicService = require('../services/relicService')
const personService = require('../services/personService')
const { createHttpError } = require('../utils/httpError')
const { parsePagination, parsePositiveInteger } = require('../utils/pagination')

function createContentController(pool) {
  return {
    getMuseum: async (request, response, next) => {
      try {
        const museum = await museumService.getMuseum(pool)
        if (!museum) throw createHttpError(404, 'museum not found')
        response.json({ code: 200, message: 'success', data: museum })
      } catch (error) {
        next(error)
      }
    },
    getRelics: async (request, response, next) => {
      try {
        const pagination = parsePagination(request.query)
        const categoryId = request.query.categoryId === undefined
          ? undefined
          : parsePositiveInteger(request.query.categoryId, 'categoryId')
        const keyword = typeof request.query.keyword === 'string' ? request.query.keyword.trim() : ''
        const result = await relicService.getRelicList(pool, { keyword, categoryId }, pagination)
        response.json({ code: 200, message: 'success', data: { ...result, page: pagination.page, pageSize: pagination.pageSize } })
      } catch (error) {
        next(error)
      }
    },
    getRelic: async (request, response, next) => {
      try {
        const id = parsePositiveInteger(request.params.id, 'id')
        const relic = await relicService.getRelic(pool, id)
        if (!relic) throw createHttpError(404, 'relic not found')
        response.json({ code: 200, message: 'success', data: relic })
      } catch (error) {
        next(error)
      }
    },
    getExhibitions: async (request, response, next) => {
      try {
        const pagination = parsePagination(request.query)
        const result = await exhibitionService.getExhibitionList(pool, pagination)
        response.json({ code: 200, message: 'success', data: { ...result, page: pagination.page, pageSize: pagination.pageSize } })
      } catch (error) {
        next(error)
      }
    },
    getExhibition: async (request, response, next) => {
      try {
        const id = parsePositiveInteger(request.params.id, 'id')
        const exhibition = await exhibitionService.getExhibition(pool, id)
        if (!exhibition) throw createHttpError(404, 'exhibition not found')
        response.json({ code: 200, message: 'success', data: exhibition })
      } catch (error) {
        next(error)
      }
    },
    getPeople: async (request,response,next)=>{try{const p=parsePagination(request.query);const keyword=typeof request.query.keyword==='string'?request.query.keyword.trim():'';const result=await personService.getPeople(pool,{keyword},p);response.json({code:200,message:'success',data:{...result,page:p.page,pageSize:p.pageSize}})}catch(error){next(error)}},
    getPerson: async (request,response,next)=>{try{const id=parsePositiveInteger(request.params.id,'id');const person=await personService.getPerson(pool,id);if(!person)throw createHttpError(404,'person not found');response.json({code:200,message:'success',data:person})}catch(error){next(error)}},
  }
}

module.exports = { createContentController }

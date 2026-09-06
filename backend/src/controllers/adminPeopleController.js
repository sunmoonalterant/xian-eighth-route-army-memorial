const peopleService = require('../services/adminPeopleService')
const mediaAssetService = require('../services/mediaAssetService')
const { createHttpError } = require('../utils/httpError')
const { uploadImage } = require('../utils/imageUploadMiddleware')
const { parsePagination, parsePositiveInteger } = require('../utils/pagination')

function parseId(value, name = 'id') { return parsePositiveInteger(value, name) }
function createAdminPeopleController(pool) {
  return {
    list: async (request, response, next) => { try { const pagination = parsePagination(request.query); const keyword = typeof request.query.keyword === 'string' ? request.query.keyword.trim() : ''; const data = await peopleService.getList(pool, { keyword }, pagination); response.json({ code: 200, message: 'success', data: { ...data, page: pagination.page, pageSize: pagination.pageSize } }) } catch (error) { next(error) } },
    getOne: async (request, response, next) => { try { const data = await peopleService.getOne(pool, parseId(request.params.id)); if (!data) throw createHttpError(404, 'person not found'); response.json({ code: 200, message: 'success', data }) } catch (error) { next(error) } },
    update: async (request, response, next) => { try { response.json({ code: 200, message: 'success', data: await peopleService.update(pool, parseId(request.params.id), request.body) }) } catch (error) { next(error) } },
    listImages: async (request, response, next) => { try { response.json({ code: 200, message: 'success', data: await mediaAssetService.listAdminAssets(pool, 'person', parseId(request.params.id)) }) } catch (error) { next(error) } },
    addImage: async (request, response, next) => { try { if (!request.file) throw createHttpError(400, 'image file is required'); response.status(201).json({ code: 201, message: 'success', data: await mediaAssetService.addAsset(pool, 'person', parseId(request.params.id), request.file, request.body) }) } catch (error) { next(error) } },
    updateImage: async (request, response, next) => { try { response.json({ code: 200, message: 'success', data: await mediaAssetService.updateAsset(pool, 'person', parseId(request.params.id), parseId(request.params.imageId, 'imageId'), request.body) }) } catch (error) { next(error) } },
    removeImage: async (request, response, next) => { try { response.json({ code: 200, message: 'success', data: await mediaAssetService.removeAsset(pool, 'person', parseId(request.params.id), parseId(request.params.imageId, 'imageId')) }) } catch (error) { next(error) } },
  }
}
module.exports = { createAdminPeopleController, uploadImage }

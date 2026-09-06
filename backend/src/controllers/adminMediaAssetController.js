const mediaAssetService = require('../services/mediaAssetService')
const { createHttpError } = require('../utils/httpError')
const { parsePositiveInteger } = require('../utils/pagination')

function parseId(value, name = 'id') {
  return parsePositiveInteger(value, name)
}

function createAdminMediaAssetController(pool, entityType) {
  return {
    listImages: async (request, response, next) => {
      try { response.json({ code: 200, message: 'success', data: await mediaAssetService.listAdminAssets(pool, entityType, parseId(request.params.id)) }) } catch (error) { next(error) }
    },
    addImage: async (request, response, next) => {
      try {
        if (!request.file) throw createHttpError(400, 'image file is required')
        response.status(201).json({ code: 201, message: 'success', data: await mediaAssetService.addAsset(pool, entityType, parseId(request.params.id), request.file, request.body) })
      } catch (error) { next(error) }
    },
    updateImage: async (request, response, next) => {
      try { response.json({ code: 200, message: 'success', data: await mediaAssetService.updateAsset(pool, entityType, parseId(request.params.id), parseId(request.params.imageId, 'imageId'), request.body) }) } catch (error) { next(error) }
    },
    removeImage: async (request, response, next) => {
      try { response.json({ code: 200, message: 'success', data: await mediaAssetService.removeAsset(pool, entityType, parseId(request.params.id), parseId(request.params.imageId, 'imageId')) }) } catch (error) { next(error) }
    },
  }
}

module.exports = { createAdminMediaAssetController }

const express = require('express')
const { createAdminMediaAssetController } = require('../controllers/adminMediaAssetController')
const { uploadImage } = require('../utils/imageUploadMiddleware')

function createAdminMediaAssetRouter(pool, authenticate, entityType) {
  const router = express.Router()
  const controller = createAdminMediaAssetController(pool, entityType)
  router.use(authenticate)
  router.get('/:id/images', controller.listImages)
  router.post('/:id/images', uploadImage, controller.addImage)
  router.put('/:id/images/:imageId', controller.updateImage)
  router.delete('/:id/images/:imageId', controller.removeImage)
  return router
}

module.exports = createAdminMediaAssetRouter

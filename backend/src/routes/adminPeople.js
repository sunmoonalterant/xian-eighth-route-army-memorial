const express = require('express')
const { createAdminPeopleController, uploadImage } = require('../controllers/adminPeopleController')
function createAdminPeopleRouter(pool, authenticate) { const router = express.Router(); const controller = createAdminPeopleController(pool); router.use(authenticate); router.get('/', controller.list); router.get('/:id/images', controller.listImages); router.post('/:id/images', uploadImage, controller.addImage); router.put('/:id/images/:imageId', controller.updateImage); router.delete('/:id/images/:imageId', controller.removeImage); router.get('/:id', controller.getOne); router.put('/:id', controller.update); return router }
module.exports = createAdminPeopleRouter

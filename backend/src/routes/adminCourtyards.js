const express = require('express')
const { createCourtyardController, createDigitalMuseumController } = require('../controllers/courtyardController')
function createAdminCourtyardRouter(pool, authenticate) { const router = express.Router(); const controller = createCourtyardController(pool,true); router.use(authenticate); router.get('/',controller.list); router.post('/',controller.create); router.get('/:id',controller.getOne); router.put('/:id',controller.update); router.delete('/:id',controller.remove); return router }
function createAdminDigitalMuseumRouter(pool, authenticate) { const router = express.Router(); const controller = createDigitalMuseumController(pool,true); router.use(authenticate); router.get('/',controller.get); router.put('/',controller.save); return router }
module.exports = { createAdminCourtyardRouter, createAdminDigitalMuseumRouter }

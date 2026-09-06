const express = require('express')
const { createCourtyardController, createDigitalMuseumController } = require('../controllers/courtyardController')
function createCourtyardRouter(pool) { const router = express.Router(); const controller = createCourtyardController(pool); router.get('/', controller.list); router.get('/:id', controller.getOne); return router }
function createDigitalMuseumRouter(pool) { const router = express.Router(); router.get('/', createDigitalMuseumController(pool).get); return router }
module.exports = { createCourtyardRouter, createDigitalMuseumRouter }

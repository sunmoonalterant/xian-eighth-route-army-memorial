const express = require('express')
const { createContentController } = require('../controllers/contentController')

function createContentRouter(pool) {
  const router = express.Router()
  const controller = createContentController(pool)

  router.get('/museum', controller.getMuseum)
  router.get('/relics', controller.getRelics)
  router.get('/relics/:id', controller.getRelic)
  router.get('/exhibitions', controller.getExhibitions)
  router.get('/exhibitions/:id', controller.getExhibition)
  router.get('/people', controller.getPeople)
  router.get('/people/:id', controller.getPerson)

  return router
}

module.exports = createContentRouter

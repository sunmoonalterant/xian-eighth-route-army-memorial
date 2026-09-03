const express = require('express')
const { createAdminContentController } = require('../controllers/adminContentController')

function mountCrud(router, path, controller, { categories = false } = {}) {
  router.get(path, controller.list)
  if (categories) router.get(`${path}/categories`, controller.categories)
  router.get(`${path}/:id`, controller.getOne)
  router.post(path, controller.create)
  router.put(`${path}/:id`, controller.update)
  router.delete(`${path}/:id`, controller.remove)
}

function createAdminContentRouter(pool, authenticate) {
  const router = express.Router()
  router.use(authenticate)
  mountCrud(router, '/relics', createAdminContentController(pool, 'relic', { supportsCategory: true }), { categories: true })
  mountCrud(router, '/articles', createAdminContentController(pool, 'article', { supportsCategory: true }), { categories: true })
  mountCrud(router, '/exhibitions', createAdminContentController(pool, 'exhibition'))
  return router
}

module.exports = createAdminContentRouter

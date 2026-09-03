const express = require('express')
const { createArticleController } = require('../controllers/articleController')

function createArticleRouter(pool) {
  const router = express.Router()
  const controller = createArticleController(pool)
  router.get('/articles', controller.list)
  router.get('/articles/:id', controller.getOne)
  return router
}

module.exports = createArticleRouter

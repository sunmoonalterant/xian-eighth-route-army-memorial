const express = require('express')
const { createAdminAuthController } = require('../controllers/adminAuthController')
const { requireAdminAuth } = require('../middleware/requireAdminAuth')

function createAdminAuthRouter(pool) {
  const router = express.Router()
  const controller = createAdminAuthController(pool)

  router.post('/admin/auth/login', controller.login)
  router.get('/admin/auth/me', requireAdminAuth, controller.me)

  return router
}

module.exports = createAdminAuthRouter

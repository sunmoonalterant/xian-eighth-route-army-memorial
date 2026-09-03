const adminAuthService = require('../services/adminAuthService')

function createAdminAuthController(pool) {
  return {
    login: async (request, response, next) => {
      try {
        const result = await adminAuthService.login(pool, request.body)
        response.json({ code: 200, message: 'success', data: result })
      } catch (error) {
        next(error)
      }
    },
    me: async (request, response, next) => {
      try {
        const admin = await adminAuthService.getCurrentAdmin(pool, request.admin.adminId)
        response.json({ code: 200, message: 'success', data: admin })
      } catch (error) {
        next(error)
      }
    },
  }
}

module.exports = { createAdminAuthController }

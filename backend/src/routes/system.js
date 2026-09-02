const express = require('express')

function createSystemRouter(pool) {
  const router = express.Router()

  router.get('/health', (request, response) => {
    response.json({
      code: 200,
      message: 'server running',
      data: { status: 'ok' },
    })
  })

  router.get('/test-db', async (request, response, next) => {
    try {
      await pool.query('SELECT 1 AS ok')
      response.json({
        code: 200,
        message: 'database connected',
        data: { connected: true },
      })
    } catch (error) {
      next(error)
    }
  })

  return router
}

module.exports = createSystemRouter

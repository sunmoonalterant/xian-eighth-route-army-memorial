const cors = require('cors')
const express = require('express')
const dbPool = require('./config/db')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')
const createAdminAuthRouter = require('./routes/adminAuth')
const createAdminReservationRouter = require('./routes/adminReservation')
const { requireAdminAuth } = require('./middleware/requireAdminAuth')
const createContentRouter = require('./routes/content')
const createReservationRouter = require('./routes/reservation')
const createSystemRouter = require('./routes/system')

function createApp({ pool = dbPool } = {}) {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/api', createSystemRouter(pool))
  app.use('/api', createContentRouter(pool))
  app.use('/api', createReservationRouter(pool))
  app.use('/api', createAdminAuthRouter(pool))
  app.use('/api/admin/reservations', createAdminReservationRouter(pool, requireAdminAuth))
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

const app = createApp()

module.exports = app
module.exports.createApp = createApp

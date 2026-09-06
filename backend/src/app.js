const cors = require('cors')
const express = require('express')
const path = require('node:path')
const dbPool = require('./config/db')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')
const createAdminAuthRouter = require('./routes/adminAuth')
const createAdminContentRouter = require('./routes/adminContent')
const createAdminReservationRouter = require('./routes/adminReservation')
const createAdminPeopleRouter = require('./routes/adminPeople')
const createAdminMediaAssetRouter = require('./routes/adminMediaAsset')
const createArticleRouter = require('./routes/articles')
const { requireAdminAuth } = require('./middleware/requireAdminAuth')
const createContentRouter = require('./routes/content')
const createReservationRouter = require('./routes/reservation')
const createSystemRouter = require('./routes/system')

function createApp({ pool = dbPool } = {}) {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/uploads', express.static(path.resolve(__dirname, '../uploads'), { fallthrough: false, index: false }))
  app.use('/api', createSystemRouter(pool))
  app.use('/api', createContentRouter(pool))
  app.use('/api', createArticleRouter(pool))
  app.use('/api', createReservationRouter(pool))
  app.use('/api', createAdminAuthRouter(pool))
  app.use('/api/admin', createAdminContentRouter(pool, requireAdminAuth))
  app.use('/api/admin/people', createAdminPeopleRouter(pool, requireAdminAuth))
  app.use('/api/admin/relics', createAdminMediaAssetRouter(pool, requireAdminAuth, 'relic'))
  app.use('/api/admin/articles', createAdminMediaAssetRouter(pool, requireAdminAuth, 'article'))
  app.use('/api/admin/exhibitions', createAdminMediaAssetRouter(pool, requireAdminAuth, 'exhibition'))
  app.use('/api/admin/reservations', createAdminReservationRouter(pool, requireAdminAuth))
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

const app = createApp()

module.exports = app
module.exports.createApp = createApp

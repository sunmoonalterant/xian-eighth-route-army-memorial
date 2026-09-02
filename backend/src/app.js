const cors = require('cors')
const express = require('express')
const dbPool = require('./config/db')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')
const createSystemRouter = require('./routes/system')

function createApp({ pool = dbPool } = {}) {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/api', createSystemRouter(pool))
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

const app = createApp()

module.exports = app
module.exports.createApp = createApp

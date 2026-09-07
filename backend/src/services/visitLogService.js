const visitLogModel = require('../models/visitLogModel')
const { validateVisitPath, validateVisitorId } = require('../utils/visitPath')

async function recordVisit(pool, input) {
  const visitorId = validateVisitorId(input?.visitorId)
  const path = validateVisitPath(input?.path)
  await visitLogModel.insertVisitLog(pool, { visitorId, path })
}

module.exports = { recordVisit }

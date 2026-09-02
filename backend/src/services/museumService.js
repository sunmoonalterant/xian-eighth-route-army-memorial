const museumModel = require('../models/museumModel')
const { toMuseum } = require('../utils/serializers')

async function getMuseum(pool) {
  const record = await museumModel.findMuseum(pool)
  return record ? toMuseum(record) : null
}

module.exports = { getMuseum }

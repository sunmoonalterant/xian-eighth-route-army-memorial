const relicModel = require('../models/relicModel')
const { toRelic } = require('../utils/serializers')

async function getRelicList(pool, filters, pagination) {
  const [records, total] = await Promise.all([
    relicModel.findRelics(pool, filters, pagination),
    relicModel.countRelics(pool, filters),
  ])
  return { list: records.map(toRelic), total }
}

async function getRelic(pool, id) {
  const record = await relicModel.findRelicById(pool, id)
  return record ? toRelic(record) : null
}

module.exports = { getRelic, getRelicList }

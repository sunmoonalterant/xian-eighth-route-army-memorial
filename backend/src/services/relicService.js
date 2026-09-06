const relicModel = require('../models/relicModel')
const { toRelic } = require('../utils/serializers')
const { applyPublicMedia } = require('./mediaAssetService')

function withImages(pool, record) {
  return applyPublicMedia(pool, 'relic', toRelic(record))
}

async function getRelicList(pool, filters, pagination) {
  const [records, total] = await Promise.all([
    relicModel.findRelics(pool, filters, pagination),
    relicModel.countRelics(pool, filters),
  ])
  return { list: await Promise.all(records.map((record) => withImages(pool, record))), total }
}

async function getRelic(pool, id) {
  const record = await relicModel.findRelicById(pool, id)
  return record ? withImages(pool, record) : null
}

module.exports = { getRelic, getRelicList }

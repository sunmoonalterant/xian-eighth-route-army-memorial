const exhibitionModel = require('../models/exhibitionModel')
const { toExhibition } = require('../utils/serializers')
const { applyPublicMedia } = require('./mediaAssetService')

async function withImages(pool, record) {
  return applyPublicMedia(pool, 'exhibition', toExhibition(record))
}

async function getExhibitionList(pool, pagination) {
  const [records, total] = await Promise.all([
    exhibitionModel.findExhibitions(pool, pagination),
    exhibitionModel.countExhibitions(pool),
  ])
  return { list: await Promise.all(records.map((record) => withImages(pool, record))), total }
}

async function getExhibition(pool, id) {
  const record = await exhibitionModel.findExhibitionById(pool, id)
  return record ? withImages(pool, record) : null
}

module.exports = { getExhibition, getExhibitionList }

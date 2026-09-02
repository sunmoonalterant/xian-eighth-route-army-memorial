const exhibitionModel = require('../models/exhibitionModel')
const { toExhibition } = require('../utils/serializers')

async function getExhibitionList(pool, pagination) {
  const [records, total] = await Promise.all([
    exhibitionModel.findExhibitions(pool, pagination),
    exhibitionModel.countExhibitions(pool),
  ])
  return { list: records.map(toExhibition), total }
}

async function getExhibition(pool, id) {
  const record = await exhibitionModel.findExhibitionById(pool, id)
  return record ? toExhibition(record) : null
}

module.exports = { getExhibition, getExhibitionList }

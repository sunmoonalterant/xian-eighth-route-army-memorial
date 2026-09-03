const model = require('../models/adminContentModel')
const { createHttpError } = require('../utils/httpError')
const { validateArticleInput, validateExhibitionInput, validateRelicInput } = require('../utils/contentValidation')

const domains = {
  relic: { categoryTable: 'relic_category', validate: validateRelicInput, find: model.findRelic, list: model.findRelics, count: model.countRelics, insert: model.insertRelic, update: model.updateRelic, hide: model.hideRelic },
  article: { categoryTable: 'article_category', validate: validateArticleInput, find: model.findArticle, list: model.findArticles, count: model.countArticles, insert: model.insertArticle, update: model.updateArticle, hide: model.hideArticle },
  exhibition: { validate: validateExhibitionInput, find: model.findExhibition, list: model.findExhibitions, count: model.countExhibitions, insert: model.insertExhibition, update: model.updateExhibition, hide: model.hideExhibition },
}

function getDomain(name) {
  const domain = domains[name]
  if (!domain) throw new Error(`unknown content domain: ${name}`)
  return domain
}

function toRecord(record) {
  if (!record) return null
  return {
    id: record.id, name: record.name, title: record.title, categoryId: record.category_id ?? null, category: record.category ?? null,
    era: record.era ?? null, summary: record.summary ?? null, content: record.content ?? null, coverImage: record.cover_image ?? null,
    views: Number(record.views || 0), publishTime: record.published_at || null, startDate: record.start_date || null,
    endDate: record.end_date || null, sourceUrl: record.source_url ?? null, sourceApiId: record.source_api_id ?? null,
    status: Number(record.status), createdAt: record.created_at, updatedAt: record.updated_at,
  }
}

async function assertCategory(pool, domain, categoryId) {
  if (!domain.categoryTable || categoryId === null) return
  if (!await model.categoryExists(pool, domain.categoryTable, categoryId)) throw createHttpError(400, 'categoryId does not exist')
}

async function getList(pool, domainName, filters, pagination, publicOnly = false) {
  const domain = getDomain(domainName)
  const [records, total] = await Promise.all([domain.list(pool, filters, pagination, publicOnly), domain.count(pool, filters, publicOnly)])
  return { list: records.map(toRecord), total }
}

async function getOne(pool, domainName, id, publicOnly = false) {
  return toRecord(await getDomain(domainName).find(pool, id, publicOnly))
}

async function create(pool, domainName, body) {
  const domain = getDomain(domainName)
  const input = domain.validate(body)
  await assertCategory(pool, domain, input.categoryId)
  const id = await domain.insert(pool, input)
  return getOne(pool, domainName, id)
}

async function update(pool, domainName, id, body) {
  const domain = getDomain(domainName)
  if (!await domain.find(pool, id, false)) throw createHttpError(404, `${domainName} not found`)
  const input = domain.validate(body)
  await assertCategory(pool, domain, input.categoryId)
  await domain.update(pool, id, input)
  return getOne(pool, domainName, id)
}

async function hide(pool, domainName, id) {
  const domain = getDomain(domainName)
  if (!await domain.find(pool, id, false)) throw createHttpError(404, `${domainName} not found`)
  await domain.hide(pool, id)
  return { id, status: 0 }
}

async function getCategories(pool, domainName) {
  const domain = getDomain(domainName)
  return domain.categoryTable ? model.listCategories(pool, domain.categoryTable) : []
}

module.exports = { create, getCategories, getList, getOne, hide, toRecord, update }

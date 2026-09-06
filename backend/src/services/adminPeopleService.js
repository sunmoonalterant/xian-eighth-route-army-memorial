const model = require('../models/adminPeopleModel')
const { createHttpError } = require('../utils/httpError')

function toAdminPerson(record) { return { id: record.id, name: record.name, summary: record.summary, content: record.content, image: record.image, sourceUrl: record.source_url, status: Number(record.status), createdAt: record.created_at, updatedAt: record.updated_at } }
function nullable(value, name, limit) { if (value === undefined || value === null || value === '') return null; if (typeof value !== 'string' || value.trim().length > limit) throw createHttpError(400, `${name} is invalid`); return value.trim() || null }
function validatePerson(input = {}) { const name = nullable(input.name, 'name', 100); if (!name) throw createHttpError(400, 'name is required'); const sourceUrl = nullable(input.sourceUrl, 'sourceUrl', 500); if (sourceUrl) { try { const url = new URL(sourceUrl); if (!['http:', 'https:'].includes(url.protocol)) throw new Error() } catch { throw createHttpError(400, 'sourceUrl must be a valid http or https URL') } }; const status = Number(input.status); if (![0, 1].includes(status)) throw createHttpError(400, 'status must be 0 or 1'); return { name, summary: nullable(input.summary, 'summary', 10000), content: nullable(input.content, 'content', 100000), sourceUrl, status } }
async function getList(pool, filters, pagination) { const [records, total] = await Promise.all([model.findPeople(pool, filters, pagination), model.countPeople(pool, filters)]); return { list: records.map(toAdminPerson), total } }
async function getOne(pool, id) { const record = await model.findById(pool, id); return record ? toAdminPerson(record) : null }
async function update(pool, id, input) { if (!await model.findById(pool, id)) throw createHttpError(404, 'person not found'); return toAdminPerson(await model.update(pool, id, validatePerson(input))) }
module.exports = { getList, getOne, toAdminPerson, update }

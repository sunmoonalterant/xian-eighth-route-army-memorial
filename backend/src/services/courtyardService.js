const model = require('../models/courtyardModel')
const siteModel = require('../models/digitalMuseumModel')
const { createHttpError } = require('../utils/httpError')
const { normalizeCourtyardInput, toPublicCourtyard } = require('../utils/courtyard')
const { normalizeSiteInput, toAdminSite, toPublicSite } = require('../utils/digitalMuseum')
const { applyPublicMedia } = require('./mediaAssetService')
function toAdmin(record) { return { id:record.id,candidateId:record.candidate_id,name:record.name,aliases:record.aliases ? record.aliases.split('|') : [],summary:record.description,content:record.content,historicalUse:record.historical_use,currentUse:record.current_use,positionX:record.position_x === null ? null : Number(record.position_x),positionY:record.position_y === null ? null : Number(record.position_y),sourceUrl:record.source_url,sourceName:record.source_name,evidence:record.evidence,reviewStatus:record.review_status,status:Number(record.status),sortOrder:Number(record.sort_order),updatedAt:record.updated_at } }
async function publicRecord(pool, record) { const courtyard = toPublicCourtyard(record); return courtyard ? applyPublicMedia(pool, 'courtyard', courtyard) : null }
async function list(pool, filters, page, admin = false) { const [records,total] = await Promise.all([model.list(pool,filters,page,!admin),model.count(pool,filters,!admin)]); return { list: admin ? records.map(toAdmin) : (await Promise.all(records.map((record) => publicRecord(pool,record)))).filter(Boolean), total } }
async function getOne(pool,id,admin=false) { const record = await model.find(pool,id,!admin); return record ? (admin ? toAdmin(record) : publicRecord(pool,record)) : null }
async function create(pool,body) { const id = await model.insert(pool,normalizeCourtyardInput(body)); return getOne(pool,id,true) }
async function update(pool,id,body) { if (!await model.find(pool,id)) throw createHttpError(404,'courtyard not found'); await model.update(pool,id,normalizeCourtyardInput(body)); return getOne(pool,id,true) }
async function hide(pool,id) { if (!await model.find(pool,id)) throw createHttpError(404,'courtyard not found'); await model.hide(pool,id); return { id, status:0 } }
async function getDigitalMuseum(pool) { const [siteRecord,courtyards] = await Promise.all([siteModel.findCurrent(pool,true),list(pool,{}, { page:1,pageSize:100,offset:0 })]); const site = toPublicSite(siteRecord); if (site) { const assets = await applyPublicMedia(pool,'digital_museum',site); site.mapImage = assets.coverImage; } return { site, courtyards:courtyards.list } }
async function getAdminSite(pool) { return toAdminSite(await siteModel.findCurrent(pool)) }
async function saveAdminSite(pool,body) { const id = await siteModel.save(pool,normalizeSiteInput(body)); return toAdminSite(await siteModel.findById(pool,id)) }
module.exports = { create, getAdminSite, getDigitalMuseum, getOne, hide, list, saveAdminSite, update }

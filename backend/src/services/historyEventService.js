const model = require('../models/historyEventModel')
const { createHttpError } = require('../utils/httpError')
const { normalizeHistoryEventInput, toPublicHistoryEvent } = require('../utils/historyEvent')
const { applyPublicMedia } = require('./mediaAssetService')
function toAdmin(record) { return { id:record.id,candidateId:record.candidate_id,timeText:record.time_text,year:record.year,month:record.month,day:record.day,timePrecision:record.time_precision,title:record.title,summary:record.summary,content:record.content,coverImage:record.cover_image,sourceUrl:record.source_url,sourceName:record.source_name,evidence:record.evidence,reviewStatus:record.review_status,status:Number(record.status),isFeatured:Number(record.is_featured),sortOrder:Number(record.sort_order),updatedAt:record.updated_at } }
async function publicRecord(pool, record) { return applyPublicMedia(pool, 'history_event', toPublicHistoryEvent(record)) }
async function getList(pool, filters, pagination, admin = false) { const [records,total] = await Promise.all([model.list(pool,filters,pagination,!admin),model.count(pool,filters,!admin)]); return { list: admin ? records.map(toAdmin) : (await Promise.all(records.map((record)=>publicRecord(pool,record)))).filter(Boolean), total } }
async function getOne(pool,id,admin=false) { const record = await model.find(pool,id,!admin); return record ? (admin ? toAdmin(record) : publicRecord(pool,record)) : null }
async function create(pool,body) { const id=await model.insert(pool,normalizeHistoryEventInput(body)); return getOne(pool,id,true) }
async function update(pool,id,body) { if (!await model.find(pool,id)) throw createHttpError(404,'history event not found'); await model.update(pool,id,normalizeHistoryEventInput(body)); return getOne(pool,id,true) }
async function hide(pool,id) { if (!await model.find(pool,id)) throw createHttpError(404,'history event not found'); await model.hide(pool,id); return {id,status:0} }
module.exports={create,getList,getOne,hide,toAdmin,update}

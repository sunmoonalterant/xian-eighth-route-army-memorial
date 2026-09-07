const { createHttpError } = require('./httpError')

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const DETAIL_PATTERNS = [
  [/^\/relic\/\d+$/, '/relic/:id'],
  [/^\/person\/\d+$/, '/person/:id'],
  [/^\/news\/\d+$/, '/news/:id'],
  [/^\/exhibition\/\d+$/, '/exhibition/:id'],
]
const PAGE_NAMES = Object.freeze({
  '/': '首页', '/museum': '展馆介绍', '/history': '峥嵘岁月', '/relics': '馆藏文物', '/relic/:id': '文物详情',
  '/people': '历史人物', '/person/:id': '人物详情', '/exhibitions': '陈列展览', '/exhibition/:id': '展览详情',
  '/news': '文博资讯', '/news/:id': '新闻详情', '/digital-museum': '数字纪念馆', '/visit': '参观服务',
  '/reservation': '在线预约', '/reservation/result': '预约结果', '/reservation/query': '预约查询', '/search': '全站搜索',
})

function validateVisitorId(value) {
  if (typeof value !== 'string' || !UUID_V4.test(value)) throw createHttpError(400, 'visitorId is invalid')
  return value
}

function validateVisitPath(value) {
  if (typeof value !== 'string' || value.length < 1 || value.length > 255 || !value.startsWith('/') || /[?#<>\u0000-\u001f]/.test(value)) {
    throw createHttpError(400, 'path is invalid')
  }
  return value
}

function normalizeVisitPath(path) {
  const value = validateVisitPath(path)
  return DETAIL_PATTERNS.find(([pattern]) => pattern.test(value))?.[1] || value
}

function getPageName(path) {
  const normalizedPath = normalizeVisitPath(path)
  return PAGE_NAMES[normalizedPath] || normalizedPath
}

module.exports = { getPageName, normalizeVisitPath, validateVisitPath, validateVisitorId }

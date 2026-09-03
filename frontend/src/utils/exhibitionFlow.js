function normalizeIdentityValue(value) {
  return String(value || '').replace(/\s+/gu, '')
}

function exhibitionIdentity(record) {
  return [record.sourceUrl, record.title, record.contentText || record.content]
    .map(normalizeIdentityValue)
    .join('\u0000')
}

export function dedupeExhibitions(records) {
  const seen = new Set()
  return records.filter((record) => {
    const identity = exhibitionIdentity(record)
    if (seen.has(identity)) return false
    seen.add(identity)
    return true
  })
}

export function findExhibitionFallback(records, id) {
  return records.find((record) => String(record.id) === String(id)) || null
}

export function toExhibitionDetail(record, fallbackImage = '') {
  const startDate = record.startDate || ''
  const endDate = record.endDate || ''
  return {
    ...record,
    image: record.coverImage || record.image || fallbackImage,
    content: record.content || record.contentText || record.summary || '',
    dateText: [startDate, endDate].filter(Boolean).join(' 至 '),
  }
}

export function getExhibitionErrorMessage(error, id) {
  if (error?.status === 404) return '未找到该展览资料'
  if (!/^\d+$/.test(String(id))) return '展览编号无效'
  return '展览资料暂时无法加载'
}

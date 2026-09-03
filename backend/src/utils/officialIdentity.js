function normalizeIdentityValue(value) {
  return String(value || '').replace(/\s+/gu, '')
}

function exhibitionIdentity(record) {
  return [record.sourceUrl || record.source_url, record.title, record.contentText || record.content]
    .map(normalizeIdentityValue)
    .join('\u0000')
}

function dedupeExhibitions(records) {
  const seen = new Set()
  return records.filter((record) => {
    const identity = exhibitionIdentity(record)
    if (seen.has(identity)) return false
    seen.add(identity)
    return true
  })
}

function preferLocalCoverImage(incomingCover, existingCover) {
  if (String(existingCover || '').startsWith('/images/') && !String(incomingCover || '').startsWith('/images/')) {
    return existingCover
  }
  return incomingCover || existingCover || null
}

module.exports = { dedupeExhibitions, exhibitionIdentity, normalizeIdentityValue, preferLocalCoverImage }

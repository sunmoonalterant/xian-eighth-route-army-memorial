function exhibitionIdentity(record) {
  return `${record.sourceUrl || ''}\u0000${record.contentText || ''}`
}

module.exports = { exhibitionIdentity }

export function sortByViews(records) {
  return [...records].sort((first, second) => (second.views || 0) - (first.views || 0))
}

export function paginate(records, currentPage = 1, pageSize = 6) {
  const total = records.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(currentPage, 1), totalPages)
  const start = (page - 1) * pageSize

  return { items: records.slice(start, start + pageSize), total, totalPages, page }
}

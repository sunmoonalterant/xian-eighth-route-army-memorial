function toMuseum(record) {
  return {
    id: record.id,
    title: record.title,
    summary: record.summary,
    content: record.content,
    coverImage: record.cover_image,
    sourceUrl: record.source_url,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

function toRelic(record) {
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    era: record.era,
    summary: record.summary,
    content: record.content,
    coverImage: record.cover_image,
    views: record.views,
    sourceUrl: record.source_url,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

function toExhibition(record) {
  return {
    id: record.id,
    title: record.title,
    category: record.category,
    summary: record.summary,
    content: record.content,
    coverImage: record.cover_image,
    startDate: record.start_date || null,
    endDate: record.end_date || null,
    views: record.views,
    sourceUrl: record.source_url,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

module.exports = { toExhibition, toMuseum, toRelic }

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
function toPerson(record) { const content=record.content||''; const field=(label)=>content.match(new RegExp(`${label}：([^\\n]+)`))?.[1]||null; return {id:record.id,name:record.name,role:field('身份/职务'),relation:field('与西安八办/七贤庄的关系'),summary:record.summary,content,image:record.image||null,sourceUrl:record.source_url,createdAt:record.created_at,updatedAt:record.updated_at} }

module.exports = { toExhibition, toMuseum, toRelic, toPerson }

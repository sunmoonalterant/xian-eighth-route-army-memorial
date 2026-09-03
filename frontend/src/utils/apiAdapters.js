export function toRelicView(record, fallbackImage) {
  return {
    ...record,
    image: record.coverImage || fallbackImage,
    contentText: record.content || record.summary || '',
  }
}

export function toMuseumView(record, fallback) {
  const image = record.coverImage || fallback.image
  return {
    ...fallback,
    title: record.title || fallback.title,
    intro: record.summary || fallback.intro,
    image,
    sourceUrl: record.sourceUrl || fallback.sourceUrl,
    retrievedAt: record.createdAt || fallback.retrievedAt,
    sections: [{ title: record.title || fallback.title, text: record.content || record.summary || '', image }],
  }
}

export function toExhibitionCard(record, fallbackImage) {
  return {
    ...record,
    type: record.category || '未分类',
    time: [record.startDate, record.endDate].filter(Boolean).join(' 至 '),
    image: record.coverImage || fallbackImage,
    to: `/exhibition/${record.id}`,
  }
}

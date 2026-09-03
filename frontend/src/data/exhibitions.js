import { images } from './imageAssets.js'
import { officialExhibitions } from './officialExhibitions.js'
import { dedupeExhibitions } from '../utils/exhibitionFlow.js'

export const exhibitions = dedupeExhibitions(officialExhibitions)
  .map(item => ({ ...item, type: item.category || '未分类', time: [item.startDate, item.endDate].filter(Boolean).join(' 至 '), image: item.coverImage || images.exhibitionHall }))

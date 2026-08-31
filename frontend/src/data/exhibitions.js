import { images } from './imageAssets.js'
import { officialExhibitions } from './officialExhibitions.js'
export const exhibitions = officialExhibitions.map(item => ({ ...item, type: item.category || '未分类', time: [item.startDate, item.endDate].filter(Boolean).join(' 至 '), image: item.coverImage || images.exhibitionHall }))

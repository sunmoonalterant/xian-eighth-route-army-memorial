import { images } from './imageAssets.js'
import { officialRelics } from './officialRelics.js'
export const relicCategories = ['全部', '未分类']
export const relics = officialRelics.map((item, index) => ({ ...item, image: item.coverImage || images.relicObject, summary: item.summary || item.contentText, background: item.contentText, views: 128 - index * 7 }))

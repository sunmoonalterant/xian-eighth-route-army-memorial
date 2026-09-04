import { images } from './imageAssets.js'
import { officialMuseum } from './officialMuseum.js'
import { officialVisit } from './officialVisit.js'
export const museum = { title: officialMuseum.title, subtitle: '官方资料整理展示，仍待史料核实', intro: officialMuseum.summary, image: officialMuseum.imageUrls?.[0] || images.courtyard, sourceName: officialMuseum.sourceName, sourceUrl: officialMuseum.sourceUrl, retrievedAt: officialMuseum.retrievedAt, sections: [{ title: '纪念馆简介', text: officialMuseum.contentText, html: officialMuseum.contentHtml, image: officialMuseum.imageUrls?.[0] || images.courtyard }] }
export const historyEvents = Array.from({ length: 5 }, (_, index) => ({
  id: `h-0${index + 1}`,
  year: '资料整理中',
  date: '时间待核实',
  title: `历史事件${index + 1}（演示）`,
  description: '资料整理中 / 待史料核实。',
  image: images.historyPaper,
  isPlaceholder: true,
}))
export const visitGuide = { openHours: officialVisit.openingHours, address: '', notice: officialVisit.visitorNotice, sourceName: officialVisit.sourceName, sourceUrl: officialVisit.sourceUrls?.[0] || '', retrievedAt: officialVisit.retrievedAt }

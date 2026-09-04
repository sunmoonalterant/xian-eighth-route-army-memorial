import { images } from './imageAssets.js'
import { officialMuseum } from './officialMuseum.js'
import { officialVisit } from './officialVisit.js'
export const museum = { title: officialMuseum.title, subtitle: '官方资料整理展示，仍待史料核实', intro: officialMuseum.summary, image: officialMuseum.imageUrls?.[0] || images.courtyard, sourceName: officialMuseum.sourceName, sourceUrl: officialMuseum.sourceUrl, retrievedAt: officialMuseum.retrievedAt, sections: [{ title: '纪念馆简介', text: officialMuseum.contentText, html: officialMuseum.contentHtml, image: officialMuseum.imageUrls?.[0] || images.courtyard }] }
// 当前项目没有可公开展示的已核实历史事件，不以演示事件填充时间轴。
export const historyEvents = []
export const visitGuide = { openHours: officialVisit.openingHours, address: '', notice: officialVisit.visitorNotice, sourceName: officialVisit.sourceName, sourceUrl: officialVisit.sourceUrls?.[0] || '', retrievedAt: officialVisit.retrievedAt }

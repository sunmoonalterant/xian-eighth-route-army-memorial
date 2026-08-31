const asset = (path) => new URL(path, import.meta.url).href

const heroMuseum = asset('../assets/reference/xabb/exhibition-courtyard.jpg')
const courtyard = asset('../assets/reference/xabb/exhibition-main.png')
const historyPaper = asset('../assets/reference/xabb/news-feature.png')
const relicDocument = asset('../assets/reference/xabb/relic-calligraphy.png')
const relicBadge = asset('../assets/reference/xabb/relic-poem.png')
const relicObject = asset('../assets/reference/xabb/relic-sleepwear.png')
const personPortrait = asset('../assets/images/person-portrait.jpg')
const exhibitionHall = asset('../assets/reference/xabb/exhibition-documents.jpg')
const digitalGuide = asset('../assets/reference/xabb/education-public.jpg')
const newsActivity = asset('../assets/reference/xabb/education-volunteer.jpg')
const relicRaincoat = asset('../assets/reference/xabb/relic-raincoat.png')
const serviceRoute = asset('../assets/reference/xabb/service-route.png')
const serviceTime = asset('../assets/reference/xabb/service-time.png')
const serviceGuide = asset('../assets/reference/xabb/service-guide.png')
const serviceNotice = asset('../assets/reference/xabb/service-notice.png')
const personPlaceholder = asset('../assets/reference/xabb/person-placeholder.svg')

export const images = {
  heroMuseum,
  courtyard,
  historyPaper,
  relicDocument,
  relicBadge,
  relicObject,
  personPortrait,
  exhibitionHall,
  digitalGuide,
  newsActivity,
  relicRaincoat,
  serviceRoute,
  serviceTime,
  serviceGuide,
  serviceNotice,
  personPlaceholder,
}

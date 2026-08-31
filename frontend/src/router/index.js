import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  ['/', 'Home', 'Home'], ['/museum', 'Museum', 'Museum'], ['/history', 'History', 'History'],
  ['/relics', 'Relics', 'Relics'], ['/relic/:id', 'RelicDetail', 'RelicDetail'], ['/people', 'People', 'People'],
  ['/person/:id', 'PersonDetail', 'PersonDetail'], ['/exhibitions', 'Exhibitions', 'Exhibitions'], ['/news', 'News', 'News'],
  ['/news/:id', 'NewsDetail', 'NewsDetail'], ['/digital-museum', 'DigitalMuseum', 'DigitalMuseum'], ['/visit', 'Visit', 'Visit'],
  ['/reservation', 'Reservation', 'Reservation'], ['/reservation/result', 'ReservationResult', 'ReservationResult'],
  ['/reservation/query', 'ReservationQuery', 'ReservationQuery'], ['/search', 'Search', 'Search'],
].map(([path, name, view]) => ({ path, name, component: () => import(`../views/${view}.vue`) }))

routes.push({ path: '/:pathMatch(.*)*', redirect: '/' })

export default createRouter({ history: createWebHistory(), routes, scrollBehavior: () => ({ top: 0 }) })

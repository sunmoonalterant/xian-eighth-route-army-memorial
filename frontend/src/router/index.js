import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentAdmin } from '../api/adminAuth.js'
import { adminSession, clearAdminSession, getAdminToken, setAdminProfile } from '../stores/adminSession.js'
import { trackVisitorRoute } from '../utils/visitTracking.js'

const routes = [
  ['/', 'Home', 'Home'], ['/museum', 'Museum', 'Museum'], ['/history', 'History', 'History'],
  ['/relics', 'Relics', 'Relics'], ['/relic/:id', 'RelicDetail', 'RelicDetail'], ['/people', 'People', 'People'],
  ['/person/:id', 'PersonDetail', 'PersonDetail'], ['/exhibitions', 'Exhibitions', 'Exhibitions'], ['/exhibition/:id', 'ExhibitionDetail', 'ExhibitionDetail'], ['/news', 'News', 'News'],
  ['/news/:id', 'NewsDetail', 'NewsDetail'], ['/digital-museum', 'DigitalMuseum', 'DigitalMuseum'], ['/visit', 'Visit', 'Visit'],
  ['/reservation', 'Reservation', 'Reservation'], ['/reservation/result', 'ReservationResult', 'ReservationResult'],
  ['/reservation/query', 'ReservationQuery', 'ReservationQuery'], ['/search', 'Search', 'Search'],
].map(([path, name, view]) => ({ path, name, component: () => import(`../views/${view}.vue`) }))

routes.push({ path: '/:pathMatch(.*)*', redirect: '/' })

routes.unshift(
  { path: '/admin/login', name: 'AdminLogin', component: () => import('../views/AdminLogin.vue'), meta: { adminGuest: true } },
  {
    path: '/admin',
    component: () => import('../views/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'AdminDashboard', component: () => import('../views/AdminDashboard.vue'), meta: { requiresAdmin: true } },
      { path: 'reservations', name: 'AdminReservations', component: () => import('../views/AdminReservations.vue'), meta: { requiresAdmin: true } },
      { path: 'relics', name: 'AdminRelics', component: () => import('../views/AdminRelics.vue'), meta: { requiresAdmin: true } },
      { path: 'news', name: 'AdminNews', component: () => import('../views/AdminNews.vue'), meta: { requiresAdmin: true } },
      { path: 'exhibitions', name: 'AdminExhibitions', component: () => import('../views/AdminExhibitions.vue'), meta: { requiresAdmin: true } },
      { path: 'people', name: 'AdminPeople', component: () => import('../views/AdminPeople.vue'), meta: { requiresAdmin: true } },
      { path: 'history', name: 'AdminHistory', component: () => import('../views/AdminHistory.vue'), meta: { requiresAdmin: true } },
      { path: 'digital-museum', name: 'AdminDigitalMuseum', component: () => import('../views/AdminDigitalMuseum.vue'), meta: { requiresAdmin: true } },
    ],
  },
)

const router = createRouter({ history: createWebHistory(), routes, scrollBehavior: () => ({ top: 0 }) })

router.beforeEach(async (to) => {
  if (to.meta.adminGuest && getAdminToken()) return '/admin/reservations'
  if (!to.meta.requiresAdmin) return true
  if (!getAdminToken()) return '/admin/login'
  if (adminSession.admin) return true

  adminSession.loading = true
  try {
    setAdminProfile(await getCurrentAdmin())
    return true
  } catch {
    clearAdminSession()
    return '/admin/login'
  } finally {
    adminSession.loading = false
  }
})

router.afterEach((to, from, failure) => {
  if (!failure) void trackVisitorRoute(to)
})

export default router

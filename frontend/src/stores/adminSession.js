import { reactive } from 'vue'
import { sanitizeAdminSession } from '../utils/adminReservationFlow.js'

export const adminTokenStorageKey = 'admin_token'

function readToken() {
  if (typeof window === 'undefined') return ''
  return window.sessionStorage.getItem(adminTokenStorageKey) || ''
}

export const adminSession = reactive({
  token: readToken(),
  admin: null,
  loading: false,
})

export function getAdminToken() {
  return adminSession.token
}

export function setAdminSession(payload) {
  const safe = sanitizeAdminSession(payload)
  adminSession.token = safe.token
  adminSession.admin = safe.admin
  if (typeof window !== 'undefined') window.sessionStorage.setItem(adminTokenStorageKey, safe.token)
}

export function clearAdminSession() {
  adminSession.token = ''
  adminSession.admin = null
  if (typeof window !== 'undefined') window.sessionStorage.removeItem(adminTokenStorageKey)
}

export function setAdminProfile(admin) {
  adminSession.admin = sanitizeAdminSession({ token: adminSession.token, admin }).admin
}

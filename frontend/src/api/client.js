import axios from 'axios'
import { clearAdminSession, getAdminToken } from '../stores/adminSession.js'

const client = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 5000,
})

client.interceptors.request.use((config) => {
  const url = String(config.url || '')
  if (url.startsWith('/admin/')) {
    const token = getAdminToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => {
    const payload = response.data
    if (![200, 201].includes(payload?.code)) {
      return Promise.reject(new Error(payload?.message || 'request failed'))
    }
    return payload.data
  },
  (error) => {
    const requestUrl = String(error.config?.url || '')
    const status = error.response?.status
    if (status === 401 && requestUrl.startsWith('/admin/') && requestUrl !== '/admin/auth/login') {
      clearAdminSession()
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
        window.location.assign('/admin/login')
      }
    }
    const requestError = new Error(error.response?.data?.message || 'service unavailable')
    requestError.status = status
    return Promise.reject(requestError)
  },
)

export default client

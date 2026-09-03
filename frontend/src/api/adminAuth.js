import client from './client.js'

export function createAdminAuthApi(http = client) {
  return {
    login: ({ username, password }) => http.post('/admin/auth/login', { username, password }),
    getCurrentAdmin: () => http.get('/admin/auth/me'),
  }
}

const adminAuthApi = createAdminAuthApi()

export const { getCurrentAdmin, login } = adminAuthApi

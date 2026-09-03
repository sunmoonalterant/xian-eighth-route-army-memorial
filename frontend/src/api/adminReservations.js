import client from './client.js'

export function createAdminReservationApi(http = client) {
  return {
    getList: (params) => http.get('/admin/reservations', { params }),
    getById: (id) => http.get(`/admin/reservations/${encodeURIComponent(id)}`),
    updateStatus: (id, status) => http.patch(`/admin/reservations/${encodeURIComponent(id)}/status`, { status }),
  }
}

const adminReservationApi = createAdminReservationApi()

export const { getById, getList, updateStatus } = adminReservationApi

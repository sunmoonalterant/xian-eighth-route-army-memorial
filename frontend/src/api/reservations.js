import client from './client.js'

export function createReservationApi(http = client) {
  return {
    getVisitSchedules: (date) => http.get('/visit-schedules', { params: { date } }),
    createReservation: (payload) => http.post('/reservations', payload),
    queryReservation: (params) => http.get('/reservations/query', { params }),
    cancelReservation: (reservationNo, phone) => http.post(`/reservations/${encodeURIComponent(reservationNo)}/cancel`, { phone }),
  }
}

const reservationApi = createReservationApi()

export const { cancelReservation, createReservation, getVisitSchedules, queryReservation } = reservationApi

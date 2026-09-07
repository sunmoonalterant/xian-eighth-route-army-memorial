import client from './client.js'

export function createStatisticsApi(http = client) {
  return {
    fetchOverview: () => http.get('/admin/statistics/overview'),
    fetchTrafficTrend: (days) => http.get('/admin/statistics/traffic-trend', { params: { days } }),
    fetchPageRanking: (limit = 10) => http.get('/admin/statistics/page-ranking', { params: { limit } }),
    fetchReservationStatistics: () => http.get('/admin/statistics/reservations'),
    fetchReservationTrend: (days) => http.get('/admin/statistics/reservation-trend', { params: { days } }),
    fetchPeriodDistribution: () => http.get('/admin/statistics/period-distribution'),
  }
}

export const {
  fetchOverview,
  fetchTrafficTrend,
  fetchPageRanking,
  fetchReservationStatistics,
  fetchReservationTrend,
  fetchPeriodDistribution,
} = createStatisticsApi()

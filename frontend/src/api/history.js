import client from './client.js'
export const fetchHistoryEvents = (params = {}) => client.get('/history-events', { params })
export const fetchFeaturedHistoryEvents = (params = {}) => client.get('/history-events', { params: { ...params, featured: true } })

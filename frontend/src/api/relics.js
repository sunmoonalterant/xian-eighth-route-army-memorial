import client from './client'

export function getRelics(params) {
  return client.get('/relics', { params })
}

export function getRelicById(id) {
  return client.get(`/relics/${id}`)
}

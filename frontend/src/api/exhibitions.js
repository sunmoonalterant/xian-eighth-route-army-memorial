import client from './client'

export function getExhibitions(params) {
  return client.get('/exhibitions', { params })
}

export function getExhibitionById(id) {
  return client.get(`/exhibitions/${id}`)
}

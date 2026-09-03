import client from './client.js'

export function createExhibitionApi(http) {
  return {
    getList: (params) => http.get('/exhibitions', { params }),
    getById: (id) => http.get(`/exhibitions/${id}`),
  }
}

const exhibitionApi = createExhibitionApi(client)

export const getExhibitions = exhibitionApi.getList
export const getExhibitionById = exhibitionApi.getById

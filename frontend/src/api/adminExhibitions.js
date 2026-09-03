import client from './client.js'
export const getList = (params) => client.get('/admin/exhibitions', { params })
export const getById = (id) => client.get(`/admin/exhibitions/${id}`)
export const create = (data) => client.post('/admin/exhibitions', data)
export const update = (id, data) => client.put(`/admin/exhibitions/${id}`, data)
export const remove = (id) => client.delete(`/admin/exhibitions/${id}`)

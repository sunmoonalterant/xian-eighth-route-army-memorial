import client from './client.js'
export const getList = (params) => client.get('/admin/relics', { params })
export const getById = (id) => client.get(`/admin/relics/${id}`)
export const getCategories = () => client.get('/admin/relics/categories')
export const create = (data) => client.post('/admin/relics', data)
export const update = (id, data) => client.put(`/admin/relics/${id}`, data)
export const remove = (id) => client.delete(`/admin/relics/${id}`)

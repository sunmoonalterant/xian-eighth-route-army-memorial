import client from './client.js'
export const getList = (params) => client.get('/admin/articles', { params })
export const getById = (id) => client.get(`/admin/articles/${id}`)
export const getCategories = () => client.get('/admin/articles/categories')
export const create = (data) => client.post('/admin/articles', data)
export const update = (id, data) => client.put(`/admin/articles/${id}`, data)
export const remove = (id) => client.delete(`/admin/articles/${id}`)

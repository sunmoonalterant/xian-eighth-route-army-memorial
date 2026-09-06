import client from './client.js'

export const getList = (params) => client.get('/admin/people', { params })
export const getById = (id) => client.get(`/admin/people/${id}`)
export const update = (id, data) => client.put(`/admin/people/${id}`, data)
export const getImages = (id) => client.get(`/admin/people/${id}/images`)
export const uploadImage = (id, data) => client.post(`/admin/people/${id}/images`, data)
export const updateImage = (id, imageId, data) => client.put(`/admin/people/${id}/images/${imageId}`, data)
export const removeImage = (id, imageId) => client.delete(`/admin/people/${id}/images/${imageId}`)

import client from './client.js'
export const getArticles = (params) => client.get('/articles', { params })
export const getArticleById = (id) => client.get(`/articles/${id}`)

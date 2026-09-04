import client from './client'
export const getPeople=(params)=>client.get('/people',{params})
export const getPersonById=(id)=>client.get(`/people/${id}`)

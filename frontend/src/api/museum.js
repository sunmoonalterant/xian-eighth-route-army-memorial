import client from './client'

export function getMuseum() {
  return client.get('/museum')
}

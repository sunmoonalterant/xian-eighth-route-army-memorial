import client from './client.js'

export function createVisitLogApi(http = client) {
  return {
    recordVisit: ({ visitorId, path }) => http.post('/visit-logs', { visitorId, path }),
  }
}

export const { recordVisit } = createVisitLogApi()

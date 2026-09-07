import { recordVisit } from '../api/visitLogs.js'
import { getVisitorId } from './visitorId.js'

export function shouldRecordVisit(path) {
  return typeof path === 'string' && path.startsWith('/') && !(path === '/admin' || path.startsWith('/admin/'))
}

export function createVisitTracker({ getVisitorId: resolveVisitorId = getVisitorId, recordVisit: sendVisit = recordVisit, debug = console.debug } = {}) {
  return async ({ path } = {}) => {
    if (!shouldRecordVisit(path)) return
    try {
      await sendVisit({ visitorId: resolveVisitorId(), path })
    } catch (error) {
      debug('visit log failed', error)
    }
  }
}

export const trackVisitorRoute = createVisitTracker()

const jwt = require('jsonwebtoken')
const { createHttpError } = require('../utils/httpError')

function requireAdminAuth(request, response, next) {
  const authorization = request.get('authorization') || ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  if (!match) return next(createHttpError(401, 'authentication required'))

  if (!process.env.JWT_SECRET) return next(createHttpError(500, 'authentication service is not configured'))

  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET)
    if (!Number.isInteger(payload.adminId) || typeof payload.username !== 'string') {
      throw new Error('invalid payload')
    }
    request.admin = { adminId: payload.adminId, username: payload.username }
    return next()
  } catch {
    return next(createHttpError(401, 'authentication required'))
  }
}

module.exports = { requireAdminAuth }

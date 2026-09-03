const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const adminModel = require('../models/adminModel')
const { createHttpError } = require('../utils/httpError')

function toAdmin(record) {
  return {
    id: record.id,
    username: record.username,
    displayName: record.display_name,
    role: record.role,
  }
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw createHttpError(500, 'authentication service is not configured')
  return secret
}

function validateCredentials(input = {}) {
  const username = typeof input.username === 'string' ? input.username.trim() : ''
  const password = typeof input.password === 'string' ? input.password : ''
  if (!username || !password) throw createHttpError(400, 'username and password are required')
  return { username, password }
}

async function login(pool, input) {
  const { username, password } = validateCredentials(input)
  const admin = await adminModel.findEnabledByUsername(pool, username)
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    throw createHttpError(401, 'invalid credentials')
  }

  const token = jwt.sign(
    { adminId: admin.id, username: admin.username },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' },
  )
  return { token, admin: toAdmin(admin) }
}

async function getCurrentAdmin(pool, adminId) {
  const admin = await adminModel.findEnabledById(pool, adminId)
  if (!admin) throw createHttpError(401, 'authentication required')
  return toAdmin(admin)
}

module.exports = { getCurrentAdmin, login, toAdmin, validateCredentials }

const assert = require('node:assert/strict')
const bcrypt = require('bcryptjs')
const { test } = require('node:test')

const { migrateAdminDisplayName } = require('../scripts/migrateAdminDisplayName')
const { seedAdmin } = require('../scripts/seedAdmin')

test('migrateAdminDisplayName adds display_name only when the existing admin table lacks it', async () => {
  const calls = []
  const pool = {
    query: async (sql) => {
      calls.push(sql)
      if (sql.startsWith('SHOW COLUMNS')) return [[]]
      return [{ affectedRows: 0 }]
    },
  }

  const result = await migrateAdminDisplayName(pool)

  assert.deepEqual(result, { displayNameColumnAdded: true })
  assert.ok(calls.some((sql) => sql.includes('ADD COLUMN `display_name` VARCHAR(100)')))
})

test('seedAdmin upserts a bcrypt password hash without passing a plaintext password to SQL', async () => {
  let query
  const pool = {
    query: async (sql, values) => {
      query = { sql, values }
      return [{ affectedRows: 1 }]
    },
  }

  const result = await seedAdmin(pool, {
    username: 'seed-admin',
    password: 'synthetic-seed-password',
    displayName: '测试管理员',
  })

  assert.deepEqual(result, { username: 'seed-admin' })
  assert.match(query.sql, /INSERT INTO `admin`/)
  assert.equal(query.values.includes('synthetic-seed-password'), false)
  assert.equal(await bcrypt.compare('synthetic-seed-password', query.values[2]), true)
  assert.deepEqual(query.values.slice(0, 2), ['seed-admin', '测试管理员'])
})

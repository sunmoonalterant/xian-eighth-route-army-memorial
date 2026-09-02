const assert = require('node:assert/strict')
const path = require('node:path')
const test = require('node:test')

const { exhibitionIdentity } = require('../src/utils/officialIdentity')

test('reviewed exhibitions that share a source page retain distinct stable identities', () => {
  const exhibitions = require(path.resolve(__dirname, '../../crawler/node/output/reviewed/exhibitions.json'))
  const identities = exhibitions.map(exhibitionIdentity)

  assert.equal(new Set(identities).size, 3)
})

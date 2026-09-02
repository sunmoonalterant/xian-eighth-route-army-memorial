require('dotenv').config({ quiet: true })

const pool = require('../src/config/db')

const SCHEDULE_PERIODS = Object.freeze(['morning', 'afternoon'])
const DEVELOPMENT_CAPACITY = 100 // 课程设计模拟容量，不代表纪念馆官方真实限额。

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildScheduleDates({ days = 21, startDate = new Date() } = {}) {
  const firstDate = new Date(startDate)
  firstDate.setHours(12, 0, 0, 0)
  const dates = []

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(firstDate)
    date.setDate(firstDate.getDate() + offset)
    if (date.getDay() !== 1) dates.push(formatDate(date))
  }

  return dates
}

async function seedVisitSchedules(dbPool, {
  dates = buildScheduleDates(),
  capacity = DEVELOPMENT_CAPACITY,
} = {}) {
  let inserted = 0
  let skipped = 0

  for (const visitDate of dates) {
    for (const period of SCHEDULE_PERIODS) {
      const [result] = await dbPool.query(`
        INSERT IGNORE INTO \`visit_schedule\` (visit_date, period, capacity, reserved_count, status)
        VALUES (?, ?, ?, 0, 1)
      `, [visitDate, period, capacity])
      if (result.affectedRows === 1) inserted += 1
      else skipped += 1
    }
  }

  return { inserted, skipped, total: dates.length * SCHEDULE_PERIODS.length }
}

async function main() {
  try {
    const result = await seedVisitSchedules(pool)
    console.log(`visit schedules inserted: ${result.inserted}`)
    console.log(`visit schedules already present: ${result.skipped}`)
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('visit schedule seed failed:', error.message)
    process.exitCode = 1
  })
}

module.exports = { DEVELOPMENT_CAPACITY, SCHEDULE_PERIODS, buildScheduleDates, seedVisitSchedules }

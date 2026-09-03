const fs = require('node:fs/promises')
const path = require('node:path')

const TABLES = {
  museum: { directory: 'museum', filename: 'museum', tableName: 'museum' },
  relic: { directory: 'relics', filename: 'relic', tableName: 'relic' },
  article: { directory: 'news', filename: 'news', tableName: 'article' },
  exhibition: { directory: 'exhibitions', filename: 'exhibition', tableName: 'exhibition' },
}
const publicRoot = path.resolve(__dirname, '../../frontend/public')
const manifestPath = path.resolve(__dirname, 'data/image-localization-manifest.json')
const reportPath = path.resolve(__dirname, '../../docs/image-localization-report.md')

function isRemoteImageUrl(value) {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function extensionFromUrl(sourceUrl) {
  const extension = path.posix.extname(new URL(sourceUrl).pathname)
  return /^\.[A-Za-z0-9]{1,10}$/.test(extension) ? extension : null
}

function toLocalPath(table, id, sourceUrl) {
  const config = TABLES[table]
  const extension = extensionFromUrl(sourceUrl)
  if (!config || !Number.isSafeInteger(Number(id)) || Number(id) < 1 || !extension) return null
  return `/images/${config.directory}/${config.filename}-${id}-01${extension}`
}

function buildCandidates(records = []) {
  return records.flatMap((record) => {
    if (!TABLES[record.table] || !isRemoteImageUrl(record.coverImage)) return []
    const localPath = toLocalPath(record.table, record.id, record.coverImage)
    if (!localPath) return []
    return [{ table: record.table, id: Number(record.id), sourceUrl: record.coverImage, localPath }]
  })
}

function toFilePath(localPath, outputRoot = publicRoot) {
  return path.resolve(outputRoot, `.${localPath}`)
}

async function fetchWithTimeout(sourceUrl, fetchImpl = global.fetch) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    return await fetchImpl(sourceUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'xabb-memorial-course-project/1.0 (local image archival)' },
    })
  } finally {
    clearTimeout(timer)
  }
}

async function localizeCandidates(candidates, options = {}) {
  const dryRun = options.dryRun === true
  const outputRoot = options.outputRoot || publicRoot
  const fetchImpl = options.fetchImpl || global.fetch
  const writeFile = options.writeFile || fs.writeFile
  const mkdir = options.mkdir || fs.mkdir
  const updateCover = options.updateCover || (async () => ({ affectedRows: 1 }))
  const result = { planned: candidates.length, succeeded: 0, failed: 0, skipped: 0, records: [] }

  if (dryRun) {
    result.records = candidates.map((candidate) => ({ ...candidate, status: 'planned' }))
    return result
  }

  for (const candidate of candidates) {
    const target = toFilePath(candidate.localPath, outputRoot)
    try {
      const response = await fetchWithTimeout(candidate.sourceUrl, fetchImpl)
      const contentType = response.headers?.get?.('content-type') || ''
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (!/^image\//i.test(contentType)) throw new Error(`unexpected content type: ${contentType || 'missing'}`)
      const buffer = Buffer.from(await response.arrayBuffer())
      if (buffer.length === 0) throw new Error('empty image response')

      await mkdir(path.dirname(target), { recursive: true })
      await writeFile(target, buffer)
      const updateResult = await updateCover(candidate)
      if (updateResult?.affectedRows === 0) throw new Error('database cover image was changed before update')
      result.succeeded += 1
      result.records.push({ ...candidate, status: 'localized' })
    } catch (error) {
      result.failed += 1
      result.records.push({ ...candidate, status: 'failed', reason: error.message || 'unknown error' })
    }
  }
  return result
}

async function loadRecords(pool) {
  const rows = []
  for (const [table, config] of Object.entries(TABLES)) {
    const [records] = await pool.execute(`SELECT id, cover_image AS coverImage FROM \`${config.tableName}\` WHERE cover_image IS NOT NULL AND cover_image <> ''`)
    rows.push(...records.map((record) => ({ ...record, table })))
  }
  return rows
}

async function updateFallbackSources(localizedRecords) {
  const replacements = new Map(localizedRecords.map((record) => [record.sourceUrl, record.localPath]))
  const files = [
    path.resolve(__dirname, '../../frontend/src/data/officialRelics.js'),
    path.resolve(__dirname, '../../frontend/src/data/officialExhibitions.js'),
  ]
  for (const file of files) {
    let content = await fs.readFile(file, 'utf8')
    for (const [sourceUrl, localPath] of replacements) content = content.replaceAll(sourceUrl, localPath)
    await fs.writeFile(file, content, 'utf8')
  }

  const newsFile = path.resolve(__dirname, '../../frontend/src/data/officialNews.js')
  let news = await fs.readFile(newsFile, 'utf8')
  for (const [sourceUrl, localPath] of replacements) {
    const sourcePath = new URL(sourceUrl).pathname
    news = news.replaceAll(`\${imageBase}${sourcePath}`, localPath)
  }
  await fs.writeFile(newsFile, news, 'utf8')
}

function makeReport(result) {
  return `# 图片本地化报告\n\n- 执行时间：${new Date().toISOString()}\n- 发现远程封面：${result.planned}\n- 成功本地化：${result.succeeded}\n- 下载或更新失败：${result.failed}\n- 保留原地址：${result.failed}\n\n本次只处理 museum、relic、article、exhibition 四张表中已使用的远程封面。成功记录的数据库 \`cover_image\` 已更新为 \`/images/...\`，\`source_url\` 保持官网资料页面地址不变。文件位于 \`frontend/public/images/\`，游客端与本地 fallback 使用同一公开路径。失败记录未修改数据库中的原始封面地址。\n`
}

async function main() {
  require('dotenv').config()
  const pool = require('../src/config/db')
  const dryRun = process.argv.includes('--dry-run')
  try {
    const candidates = buildCandidates(await loadRecords(pool))
    const result = await localizeCandidates(candidates, {
      dryRun,
      updateCover: async (candidate) => {
        const config = TABLES[candidate.table]
        const [update] = await pool.execute(
          `UPDATE \`${config.tableName}\` SET cover_image = ? WHERE id = ? AND cover_image = ?`,
          [candidate.localPath, candidate.id, candidate.sourceUrl],
        )
        return update
      },
    })
    for (const record of result.records) console.log(`${record.status}: ${record.table}#${record.id} ${record.sourceUrl} -> ${record.localPath}${record.reason ? ` (${record.reason})` : ''}`)
    console.log(`planned: ${result.planned}, succeeded: ${result.succeeded}, failed: ${result.failed}`)
    if (!dryRun) {
      await fs.mkdir(path.dirname(manifestPath), { recursive: true })
      await fs.writeFile(manifestPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), ...result }, null, 2)}\n`, 'utf8')
      await updateFallbackSources(result.records.filter((record) => record.status === 'localized'))
      await fs.writeFile(reportPath, makeReport(result), 'utf8')
    }
  } finally {
    await pool.end()
  }
}

if (require.main === module) main().catch((error) => { console.error(`image localization failed: ${error.message}`); process.exitCode = 1 })

module.exports = { buildCandidates, localizeCandidates, toLocalPath }

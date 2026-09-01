# 官网全栏目公开资料采集与前台整理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 低频采集官网十个公开栏目中可确认的全部列表和详情，并把资料导出为可审计的静态前端数据。

**Architecture:** Node 采集器先从保存的栏目页面源码发现 API，再顺序分页和保存响应；导出器只将已明确映射的待审核资料转换为 Vue 静态模块。

**Tech Stack:** Node.js 原生 fetch、Node test runner、Vue 3/Vite。

**Spec:** `docs/superpowers/specs/2026-09-01-official-all-columns-collection.md`

## Global Constraints

- 只请求 `www.xabb.org.cn` 无需登录的页面和源码中明确出现的 API。
- 单线程、每次请求前随机等待 1--3 秒；不使用代理、并发、Playwright 或图片下载。
- 收到 401、403、405、429、登录/验证码、非 JSON 或异常 payload 时，记录并停止该 endpoint，绝不规避或重复请求。
- 输出保留原始页面/API 快照、来源 URL、时间和逐栏状态；所有资料固定 `verified: false`、`reviewStatus: "pending"`。
- 不推断历史、人物、年代、地址或正文；前端仅导入静态模块并给未映射内容保留待补充标记。

### Task 1: 建立主工作区独立采集器并证明 API 发现逻辑

**Files:**

- Create: `crawler/node/package.json`, `crawler/node/README.md`, `crawler/node/src/{api,config,http,normalize,collect,review,discover}.js`
- Create: `crawler/node/test/{api,http,normalize,review,discover}.test.js`

**Interfaces:**

- `discoverColumn(html) -> { listEndpoint: string|null, detailEndpoint: string|null }`
- `createHttpClient()` exposes `getText(url)` and `postJson(url)`.

- [ ] **Step 1: Write the failing API-discovery test.**

```js
test('discovers only endpoint names literally present in page source', () => {
  const value = discoverColumn('<script>this.$http.post("apiSiteProtectionSelectSiteProtectionList?"+data)</script>');
  assert.equal(value.listEndpoint, 'apiSiteProtectionSelectSiteProtectionList');
  assert.equal(value.detailEndpoint, null);
});
```

- [ ] **Step 2: Run `npm test -- --test-name-pattern="literally present"`; expect FAIL because `discover.js` is absent.**
- [ ] **Step 3: Copy the existing tested collector modules from `.worktrees/crawler-framework/crawler/node/` and add the smallest literal-regex `discoverColumn` implementation.**
- [ ] **Step 4: Run `npm test`; expect PASS.**
- [ ] **Step 5: Commit with `git add crawler/node` then `git commit -m "feat: add official public-source collector"`.**

### Task 2: Discover every menu column from its public HTML

**Files:**

- Modify: `crawler/node/src/{config,discover}.js`
- Create: `crawler/node/output/debug/pages/<column>.html`, `crawler/node/output/debug/discovery.json`
- Test: `crawler/node/test/discover.test.js`

**Interfaces:**

- `discoverSite({ client, pageDefinitions, debugRoot }) -> Promise<DiscoveryReport>` records a status, endpoints, fields and reason for every column.

- [ ] **Step 1: Write the failing test asserting a static page produces `{status:'skipped',reason:'no-explicit-api'}`.**
- [ ] **Step 2: Run `npm test -- --test-name-pattern="no explicit API"`; expect FAIL because `discoverSite` is absent.**
- [ ] **Step 3: Implement the ten page definitions: home, museum, news, exhibitions, education, relics, research, courtyards, visit, financial; persist source HTML and only literal endpoint evidence.**
- [ ] **Step 4: Run the discovery test; expect PASS.**
- [ ] **Step 5: Run `npm run discover -- --live`; expect a report with exactly ten columns and no guessed endpoint.**

### Task 3: Sequentially paginate confirmed APIs and produce raw audit data

**Files:**

- Modify: `crawler/node/src/{api,collect,normalize,review}.js`
- Create: `crawler/node/output/debug/api/*.json`, `crawler/node/output/raw/{home,museum,news,exhibitions,education,relics,research,courtyards,visit,financial,history,people,all}.json`, `crawler/node/output/collection-summary.json`
- Test: `crawler/node/test/{api,collect,normalize,review}.test.js`

**Interfaces:**

- `pageConfirmedList({ getPage, totalFrom, itemsFrom, pageSize }) -> Promise<unknown[]>`
- `collect({ client, outputRoot, discovery }) -> Promise<raw>` writes status for all ten columns.

- [ ] **Step 1: Write a failing test where two pages report `totalSize: 3` and yield ids 1, 2, 3.**
- [ ] **Step 2: Run `npm test -- --test-name-pattern="reported total"`; expect FAIL because `pageConfirmedList` is absent.**
- [ ] **Step 3: Implement serial paging, endpoint-specific stop summaries, source-id/URL de-duplication, response snapshots and safe normalizers for every discovered payload.**
- [ ] **Step 4: Run `npm test; npm run collect -- --all`; expect tests PASS and each accepted/refused column to be reported exactly once.**
- [ ] **Step 5: Commit with `git add crawler/node` then `git commit -m "feat: collect confirmed official columns sequentially"`.**

### Task 4: Export static official modules and replace supported placeholders

**Files:**

- Modify: `crawler/node/src/export-frontend.js`, `frontend/src/data/{museum,relics,exhibitions,visit,news,digitalMuseum,people}.js`, `frontend/src/views/{News,DigitalMuseum,People,History,Home}.vue`
- Create: `crawler/node/output/reviewed/{home,museum,news,exhibitions,education,relics,research,courtyards,visit,financial,collection-audit}.json`, `frontend/src/data/official{News,Courtyards}.js`
- Test: `frontend/tests/{frontStageData,contentLookup,homeNarrative}.test.js`

**Interfaces:**

- `exportOfficialData({ sourceRoot, reviewedRoot, frontendDataRoot }) -> Promise<ExportSummary>`
- `officialNews` and `officialCourtyards` contain title, sourceUrl, sourcePage, retrievedAt, `verified:false`, `reviewStatus:'pending'`.

- [ ] **Step 1: Write the failing test asserting every `officialCourtyards` item includes source metadata and pending review fields.**
- [ ] **Step 2: Run `npm test -- --test-name-pattern="official courtyard"`; expect FAIL because `officialCourtyards.js` is absent.**
- [ ] **Step 3: Implement conservative exports, source labels, sanitised HTML and explicit UI fallback/pending labels; do not create a frontend view for education, research or financial data without existing routing.**
- [ ] **Step 4: Run `node crawler/node/src/export-frontend.js; npm --prefix frontend test; npm --prefix frontend run build`; expect PASS.**
- [ ] **Step 5: Commit with `git add crawler/node frontend/src frontend/tests` then `git commit -m "feat: show collected official pending data"`.**

### Task 5: Verify and hand off the complete per-column audit

**Files:**

- Modify: `crawler/node/src/review.js`, `crawler/node/README.md`
- Create: `crawler/node/output/reviewed/collection-audit.md`
- Test: `crawler/node/test/review.test.js`

**Interfaces:**

- `buildCollectionAudit(results) -> {columns: Record<string, {status,count,sourcePage,reason?}>}` always contains ten configured columns.

- [ ] **Step 1: Write a failing test asserting an input with only `home` still returns ten audit columns and financial status `not-attempted`.**
- [ ] **Step 2: Run `npm test -- --test-name-pattern="ten audit columns"`; expect FAIL because `buildCollectionAudit` is absent.**
- [ ] **Step 3: Implement exhaustive audit JSON/Markdown reporting for collected, skipped, stopped, not-mapped and not-attempted states.**
- [ ] **Step 4: Run `npm test; node crawler/node/src/review.js; npm --prefix frontend test; npm --prefix frontend run build`; expect all tests and build PASS.**
- [ ] **Step 5: Commit with `git add crawler/node` then `git commit -m "docs: add official collection audit"`.**

## Plan Self-Review

- Task 1 provides a main-workspace collector with a test-first evidence rule; Task 2 examines every requested public menu page; Task 3 collects safely with full pagination and explicit stops; Task 4 maps only supported data into static frontend modules; Task 5 creates a complete, auditable handoff.
- No task relies on unknown selectors, a hidden API, unrecorded data source or fabricated historical content.
- Discovery feeds collection, collection feeds export, and export feeds the audit; all interfaces use the same source and review fields.

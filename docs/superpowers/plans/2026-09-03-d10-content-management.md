# D10 Content Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe administrator CRUD for relics, articles, and exhibitions, seed public official news into MySQL, and use that public news API in the visitor frontend.

**Architecture:** Reuse the established route → controller → service → model layers. Admin and public operations access the same tables; status is the display lifecycle (`1` public, `0` hidden), while the existing frontend copy continues to describe source-review status. The frontend adds protected API adapters and three Element Plus management views; visitors use public articles with a local official-data fallback.

**Tech Stack:** Express 5, MySQL2, JWT middleware, sanitize-html, Vue 3, Vue Router, Axios, Element Plus, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-03-d10-content-management-design.md`

## Global Constraints

- Do not modify database schema: existing content `status` fields provide logical deletion.
- Admin routes require existing `requireAdminAuth`; public APIs remain read-only.
- Use only parameterized SQL and explicit write-field whitelists.
- Never let admin forms edit `relic.source_api_id`.
- Preserve `source_url`; warn before deleting source-backed content.
- Do not invent dates, categories, historical facts, content, or source identifiers.
- `status=1` means visitor-visible, not source-history verification; keep the visitor notice “官网公开资料整理，待人工审核”.
- Do not create image upload, rich-text editor, RBAC, analytics, D11 functionality, backend files outside the requested scope, or a Git commit.
- Do not stage `.env`, node_modules, passwords, or JWT values.

---

## File map

| Path | Responsibility |
| --- | --- |
| `backend/src/utils/contentValidation.js` | Common ID, URL, HTML and field validation/normalization. |
| `backend/src/models/adminRelicModel.js` | Admin relic SQL, categories and logical deletion. |
| `backend/src/models/adminArticleModel.js` | Admin/public article SQL, categories and logical deletion. |
| `backend/src/models/adminExhibitionModel.js` | Admin exhibition SQL and logical deletion. |
| `backend/src/services/adminRelicService.js` | Validated relic CRUD orchestration. |
| `backend/src/services/adminArticleService.js` | Validated article CRUD and public mapping. |
| `backend/src/services/adminExhibitionService.js` | Validated exhibition CRUD orchestration. |
| `backend/src/controllers/adminContentController.js` | HTTP parsing and uniform responses for all admin content domains. |
| `backend/src/controllers/articleController.js` | Public article list/detail HTTP responses. |
| `backend/src/routes/adminContent.js` | JWT-protected admin relic/article/exhibition routes. |
| `backend/src/routes/articles.js` | Public read-only article routes. |
| `backend/scripts/seedOfficialNews.js` | ESM dynamic-import based idempotent official-news seed. |
| `backend/src/app.js` | Mount the two new route groups. |
| `backend/package.json` | Add `sanitize-html` and `seed:news`. |
| `frontend/src/api/adminRelics.js` | Protected relic request adapters. |
| `frontend/src/api/adminNews.js` | Protected article request adapters. |
| `frontend/src/api/adminExhibitions.js` | Protected exhibition request adapters. |
| `frontend/src/api/news.js` | Public article request adapters. |
| `frontend/src/utils/adminContentForm.js` | Pure validation, API parameter and source-warning helpers. |
| `frontend/src/views/AdminRelics.vue` | Relic list and reusable create/edit/detail Dialog. |
| `frontend/src/views/AdminNews.vue` | Article list and reusable create/edit/detail Dialog. |
| `frontend/src/views/AdminExhibitions.vue` | Exhibition list and reusable create/edit/detail Dialog. |
| `frontend/src/views/AdminLayout.vue` | Add only implemented management menu items. |
| `frontend/src/router/index.js` | Add three authenticated child routes. |
| `frontend/src/views/News.vue` | API-first visitor list with local fallback notice. |
| `frontend/src/views/NewsDetail.vue` | API-first visitor detail with local fallback notice. |

### Task 1: Add safe, testable content validation

**Files:**
- Create: `backend/src/utils/contentValidation.js`
- Create: `backend/tests/content-validation.test.js`
- Modify: `backend/package.json`
- Modify: `backend/package-lock.json`

**Interfaces:**
- Produces `sanitizeContent(value)`, `parseOptionalUrl(value, name)`, `normalizeStatus(value)`, `validateRelicInput(input)`, `validateArticleInput(input)`, and `validateExhibitionInput(input)`.
- Input validators return only allowed camelCase fields and reject unknown or invalid data with existing `createHttpError`.

- [ ] **Step 1: Write failing validation tests**

```js
test('sanitizeContent strips scripts, event handlers, and javascript URLs', () => {
  const output = sanitizeContent('<p onclick="x()">safe</p><script>bad()</script><a href="javascript:x()">bad</a>')
  assert.equal(output.includes('<script'), false)
  assert.equal(output.includes('onclick'), false)
  assert.equal(output.includes('javascript:'), false)
})

test('validateExhibitionInput rejects a reversed date range', () => {
  assert.throws(() => validateExhibitionInput({ title: '演示', startDate: '2026-09-03', endDate: '2026-09-02' }), /endDate/)
})
```

- [ ] **Step 2: Run the test file and confirm it fails because the module is absent**

Run: `npm test -- tests/content-validation.test.js`

- [ ] **Step 3: Install and use `sanitize-html` with a restrictive configuration**

```js
const sanitizeHtml = require('sanitize-html')
const SAFE_TAGS = ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'blockquote']
function sanitizeContent(value) {
  return sanitizeHtml(String(value || ''), { allowedTags: SAFE_TAGS, allowedAttributes: {} }).trim()
}
```

Validate 1–200 character relic names, 1–255 character titles, nullable positive `categoryId`, `http:`/`https:` URLs, date strings, and `status` values `0`/`1`. Return a fresh explicit object; do not spread request input.

- [ ] **Step 4: Run validation tests and full backend tests**

Run: `npm test -- tests/content-validation.test.js` then `npm test`

### Task 2: Implement admin relic CRUD with status-based deletion

**Files:**
- Create: `backend/src/models/adminRelicModel.js`
- Create: `backend/src/services/adminRelicService.js`
- Modify: `backend/src/models/relicModel.js`
- Create: `backend/tests/admin-relic-api.test.js`

**Interfaces:**
- Consumes validation from Task 1 and `parsePagination`/`parsePositiveInteger`.
- Produces `listRelics(pool, filters, pagination)`, `getRelic(pool, id)`, `createRelic(pool, input)`, `updateRelic(pool, id, input)`, `hideRelic(pool, id)` and `listRelicCategories(pool)`.
- Admin list records include `categoryId`, `category`, `sourceUrl`, `sourceApiId`, `status`, `updatedAt`; public relic queries add `r.status = 1`.

- [ ] **Step 1: Write failing admin API tests**

```js
test('admin relic APIs reject an unauthenticated request', async () => {
  assert.equal((await fetch(`${baseUrl}/api/admin/relics`)).status, 401)
})
test('admin relic creates, updates, and hides only the requested record', async () => {
  // Fake pool records INSERT, UPDATE and status=0 SQL arguments.
  // Assert response codes 201, 200, 200 and that source_api_id is never in an UPDATE statement.
})
```

- [ ] **Step 2: Run the test and confirm route/service failures**

Run: `npm test -- tests/admin-relic-api.test.js`

- [ ] **Step 3: Implement model/service behavior**

Use `LEFT JOIN relic_category`, `WHERE r.id = ?`, `LIKE ?`, `category_id = ?`, `LIMIT ? OFFSET ?`, and `UPDATE relic SET status = 0 WHERE id = ?`. Before create/update, query the requested category ID and return 400 if unavailable. Updates set only name/category/era/summary/content/cover_image/source_url/status and retain `views`, `source_api_id`, timestamps and all unknown request fields.

- [ ] **Step 4: Restrict public relic model queries to visible content**

Add a fixed `r.status = 1` predicate to public `findRelics`, `countRelics`, and `findRelicById`; retain current result serializer fields and parameterization.

- [ ] **Step 5: Run relic tests and full backend suite**

Run: `npm test -- tests/admin-relic-api.test.js` then `npm test`

### Task 3: Implement admin exhibition CRUD with nullable dates

**Files:**
- Create: `backend/src/models/adminExhibitionModel.js`
- Create: `backend/src/services/adminExhibitionService.js`
- Modify: `backend/src/models/exhibitionModel.js`
- Create: `backend/tests/admin-exhibition-api.test.js`

**Interfaces:**
- Consumes `validateExhibitionInput` from Task 1.
- Produces `listExhibitions(pool, filters, pagination)`, `getExhibition(pool, id)`, `createExhibition(pool, input)`, `updateExhibition(pool, id, input)`, `hideExhibition(pool, id)`.
- Admin/external fields are `title`, `category`, `summary`, `content`, `coverImage`, `startDate`, `endDate`, `sourceUrl`, `status`; dates stay `null` if empty.

- [ ] **Step 1: Write failing exhibition tests**

```js
test('admin exhibition list accepts page and keyword with bound values', async () => {
  // Assert LIKE ? and LIMIT/OFFSET values are passed separately to pool.query.
})
test('admin exhibition rejects endDate before startDate and hides by status', async () => {
  // Assert 400 for invalid dates and UPDATE status=0 for delete.
})
```

- [ ] **Step 2: Run the test file and observe failing imports/routes**

Run: `npm test -- tests/admin-exhibition-api.test.js`

- [ ] **Step 3: Implement admin SQL and visible public filters**

Build fixed `WHERE` clauses for `title LIKE ?`; update only the approved fields. Public `exhibitionModel` list/count/detail uses `status = 1`; it does not fabricate date values.

- [ ] **Step 4: Run focused and full backend tests**

Run: `npm test -- tests/admin-exhibition-api.test.js` then `npm test`

### Task 4: Implement article CRUD, public API and official-news seed

**Files:**
- Create: `backend/src/models/adminArticleModel.js`
- Create: `backend/src/services/adminArticleService.js`
- Create: `backend/src/controllers/articleController.js`
- Create: `backend/src/routes/articles.js`
- Create: `backend/scripts/seedOfficialNews.js`
- Create: `backend/tests/admin-article-api.test.js`
- Create: `backend/tests/article-public-api.test.js`
- Create: `backend/tests/seed-official-news.test.js`
- Modify: `backend/package.json`

**Interfaces:**
- Produces admin article CRUD matching Task 2 names and public `getArticleList(pool, filters, pagination)`, `getArticle(pool, id)`.
- Public article data exposes camelCase `categoryId`, `category`, `coverImage`, `publishTime`, `sourceUrl`, `createdAt`, `updatedAt` and has no administrative-only source/identity fields.
- `seedOfficialNews` exports `seedOfficialNews(pool, records)` and dynamically imports the ESM frontend module with `import(pathToFileURL(sourcePath).href)`.

- [ ] **Step 1: Write failing public/admin/seed tests**

```js
test('public article list reads only status=1 rows and returns 404 for absent ids', async () => {
  // Assert model SQL includes a fixed status predicate and detail absent response is 404.
})
test('seedOfficialNews upserts by source_url without inventing a publication time', async () => {
  // Supply records with one sourceUrl and a null date; assert a find-by-source query and null published_at value.
})
```

- [ ] **Step 2: Run focused tests and confirm missing-module failures**

Run: `npm test -- tests/admin-article-api.test.js tests/article-public-api.test.js tests/seed-official-news.test.js`

- [ ] **Step 3: Implement article model/service/controller/route**

Admin list supports `page`, `pageSize`, `keyword`, `categoryId`; matches title and optionally summary through bound `LIKE ?` arguments. It joins `article_category`, validates category IDs, uses logical deletion, and does not auto-fill `published_at` when no value is supplied. Public routes are only `GET /api/articles` and `GET /api/articles/:id`, both fixed to status 1.

- [ ] **Step 4: Implement ESM-safe, repeatable seed**

Use Node `pathToFileURL` with a resolved project-root source path, then destructure `officialNews` from the dynamic import. Convert only existing `date` strings to midnight `published_at`; use null for absent dates. Map category names to existing/new `article_category` records, find existing row by `source_url`, and insert/update only title/category/summary/content/cover image/published date/source URL/status. Set status 1 under the approved display policy; do not create `verified` columns or claim verification.

- [ ] **Step 5: Add `seed:news` and run focused/full tests**

Run: `npm run seed:news` once against local MySQL only after unit tests; record imported/updated counts without printing source content. Then run `npm test`.

### Task 5: Mount all protected and public API routes

**Files:**
- Create: `backend/src/controllers/adminContentController.js`
- Create: `backend/src/routes/adminContent.js`
- Modify: `backend/src/app.js`
- Modify: `backend/tests/admin-relic-api.test.js`
- Modify: `backend/tests/admin-article-api.test.js`
- Modify: `backend/tests/admin-exhibition-api.test.js`

**Interfaces:**
- Admin router is mounted once at `/api/admin`; it receives `(pool, requireAdminAuth)` and adds `/relics`, `/articles`, `/exhibitions` subpaths.
- Public article router is mounted at `/api`.

- [ ] **Step 1: Add failing route-level tests for invalid IDs and JWT**

```js
for (const path of ['/api/admin/relics', '/api/admin/articles', '/api/admin/exhibitions']) {
  test(`${path} rejects a missing token`, async () => assert.equal((await fetch(`${baseUrl}${path}`)).status, 401))
}
test('admin content id abc returns 400 and unknown numeric id returns 404', async () => { /* route assertions */ })
```

- [ ] **Step 2: Run route tests and verify they fail before mounting**

Run: `npm test -- tests/admin-relic-api.test.js tests/admin-article-api.test.js tests/admin-exhibition-api.test.js`

- [ ] **Step 3: Implement controllers and routes**

Controllers use existing positive-integer pagination utilities, call one service method, and return `{ code, message, data }`; POST uses 201, PUT/DELETE use 200. All route mutations are JWT guarded before controller execution. Do not attach public mutation routes.

- [ ] **Step 4: Run backend test suite**

Run: `npm test`

### Task 6: Add protected frontend adapters, routes, and menu

**Files:**
- Create: `frontend/src/api/adminRelics.js`
- Create: `frontend/src/api/adminNews.js`
- Create: `frontend/src/api/adminExhibitions.js`
- Create: `frontend/src/utils/adminContentForm.js`
- Modify: `frontend/src/router/index.js`
- Modify: `frontend/src/views/AdminLayout.vue`
- Create: `frontend/tests/adminContentApiAndForm.test.js`

**Interfaces:**
- Adapters export `getList`, `getById`, `create`, `update`, `remove` for their own `/admin/<domain>` path.
- Form utilities export `buildListParams`, `validateRequiredTitle`, `validateHttpUrl`, `validateExhibitionDates`, and `isSourceBacked`.

- [ ] **Step 1: Write failing pure frontend tests**

```js
test('content adapters call protected content paths with list parameters', () => {
  // Inspect each adapter source or inject client to assert /admin/relics, /admin/articles, /admin/exhibitions.
})
test('admin form utilities reject blank titles, invalid URL and reversed dates', () => {
  assert.equal(validateHttpUrl('ftp://bad'), false)
  assert.equal(validateExhibitionDates('2026-09-03', '2026-09-02'), false)
})
```

- [ ] **Step 2: Run the focused frontend tests and verify they fail**

Run: `npm test -- tests/adminContentApiAndForm.test.js`

- [ ] **Step 3: Implement adapters and utilities**

Use only existing `client.js`; do not duplicate token behavior. List parameters omit blank filters. Add authenticated `/admin/relics`, `/admin/news`, `/admin/exhibitions` children and exactly these menu entries after existing reservation management. Keep menu default active based on current route rather than hard-coding a single path.

- [ ] **Step 4: Run focused frontend tests**

Run: `npm test -- tests/adminContentApiAndForm.test.js`

### Task 7: Build the three content-management views

**Files:**
- Create: `frontend/src/views/AdminRelics.vue`
- Create: `frontend/src/views/AdminNews.vue`
- Create: `frontend/src/views/AdminExhibitions.vue`
- Modify: `frontend/tests/adminContentApiAndForm.test.js`

**Interfaces:**
- Each view loads `getList` on mount and after successful create/update/delete.
- Each uses `mode` (`create`/`edit`/`view`) and one Dialog form rather than separate routes.

- [ ] **Step 1: Add failing component-behavior tests**

```js
test('content views reload list after a successful save or logical delete', () => {
  // Assert source calls loadList after create/update/remove completion.
})
test('source-backed records require an explicit deletion confirmation', () => {
  // Assert isSourceBacked(row) adds the source-specific confirmation copy.
})
```

- [ ] **Step 2: Run frontend tests and confirm view modules are absent**

Run: `npm test -- tests/adminContentApiAndForm.test.js`

- [ ] **Step 3: Implement AdminRelics**

Show name, category, era, source, status, updated time and actions. Add keyword/category filters, pagination, detail dialog, a dialog form for approved fields, and a confirmation before hide. Do not render long content in the table or offer source API ID input.

- [ ] **Step 4: Implement AdminNews**

Show title, category, publication time, source, status, updated time and actions. Use textarea for content. Keep publish time blank when null; never pre-populate a current timestamp.

- [ ] **Step 5: Implement AdminExhibitions**

Show title, start/end date with `—` for null, status, updated time and actions. Validate start/end range before request and show source-backed warning when applicable.

- [ ] **Step 6: Run frontend tests**

Run: `npm test`

### Task 8: Connect visitor news to public MySQL with fallback

**Files:**
- Create: `frontend/src/api/news.js`
- Modify: `frontend/src/views/News.vue`
- Modify: `frontend/src/views/NewsDetail.vue`
- Create: `frontend/tests/newsApiFallback.test.js`

**Interfaces:**
- Exports `getArticles(params)` and `getArticleById(id)` using `/articles`.
- Visitor view adapters convert API `coverImage`/`publishTime` to existing NewsCard `image`/`date` contract.

- [ ] **Step 1: Write failing API/fallback tests**

```js
test('News uses public article API data when the request succeeds', async () => {
  // Assert returned list is rendered through the existing card shape.
})
test('News and NewsDetail fall back to officialNews with a local-data notice on request failure', async () => {
  // Assert fallback item list/detail and “当前展示本地资料” copy.
})
```

- [ ] **Step 2: Run focused test and confirm missing adapter behavior**

Run: `npm test -- tests/newsApiFallback.test.js`

- [ ] **Step 3: Implement API-first list/detail behavior**

Call API in `onMounted` and route-param watch. Maintain loading and empty states without changing the existing visitor visual system. If the request rejects, retain/derive the current `officialNews.js` records, avoid technical error text, and set a local-data notice. Do not delete existing local data.

- [ ] **Step 4: Run frontend tests and production build**

Run: `npm test` then `npm run build`

### Task 9: Seed, browser test, and final regression

**Files:**
- Modify only if verification reveals a scope-compliant defect.

- [ ] **Step 1: Start backend and frontend development servers**

Run from `backend`: `npm run dev`; run from `frontend`: `npm run dev`.

- [ ] **Step 2: Run the seed script and capture only aggregate statistics**

Run: `npm run seed:news`.

Expected: source-backed official records are inserted or updated without duplicates; no passwords, source body dumps, or private data are printed.

- [ ] **Step 3: Conduct admin regression checks**

Visit `/admin/login`, then `/admin/relics`, `/admin/news`, `/admin/exhibitions`. Verify list/search/detail, a clearly named course-design test exhibition create/edit/hide, and refresh-after-save behavior. Delete the test exhibition after verifying it. Do not alter existing official content unless restoring the original value in the same test.

- [ ] **Step 4: Conduct visitor regression checks**

Check `/`, `/museum`, `/relics`, `/relic/:id`, `/exhibitions`, `/news`, `/news/:id`, `/visit`, `/reservation`, `/reservation/query`. Verify visitor news and content pages reflect the same MySQL content where API succeeds, and confirm news fallback only by temporarily stopping backend without modifying saved data.

- [ ] **Step 5: Run final command evidence and report Git state**

Run from `backend`: `npm test`.

Run from `frontend`: `npm test` and `npm run build`.

Run from repository root: `git diff --check` and `git status --short`.

Report file changes, APIs, seed counts, source-display distinction, sanitizer policy, manual results, test/build counts, known issues, and Git status. Do not run `git add`, `git commit`, or `git push`.

# D11.5C 人物资料正式化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically formalize only D11.5B trustworthy people records, import them idempotently, and restore people content through safe API-backed visitor views.

**Architecture:** A Python generator joins D11.5B people text and image review records by `candidateId`, emitting reviewed people only when the trusted-source rule passes. A Node seed upserts those reviewed records into the existing `person` table. Express exposes public people APIs; Vue views consume them and render an empty/safe state when unavailable.

**Tech Stack:** Python/openpyxl, Node.js, MySQL2, Express 5, Vue 3, Vite, Node test runner, Python unittest.

**Spec:** `docs/superpowers/specs/2026-09-04-d11-5c-people-formalization-design.md`

## Global Constraints

- Auto-approve only `APPROVE + A/B sourceLevel + sourceUrl + matching candidateId` people records.
- Never promote an uncertain, missing, rejected, search-CDN, guessed, AI-generated or uncaptioned image to confirmed.
- Do not modify the Excel source, MySQL schema, museum/relic/exhibition/article data, reservation flows, statistics, history events or courtyard records.
- Image download requires reviewed text, a confirmed image, a caption, identity evidence and a reliable original image URL; current expected download count is zero.
- Preserve review metadata in JSON; `person.status = 1` means public, not historical verification semantics.
- Do not run `git add`, `git commit`, or `git push`.

---

### Task 1: Generate trusted-source reviewed people data

**Files:**
- Create: `crawler/node/scripts/d115c_reviewed_people.py`
- Create: `crawler/node/tests/test_d115c_reviewed_people.py`
- Create: `crawler/node/output/reviewed/people.json`
- Modify: `crawler/node/output/review-work/people-review.json` only to add generated rule metadata if required; do not alter source fields.

**Interfaces:**
- Consumes: `people-review.json`, `people-image-review.json`.
- Produces: `generate(people_review_path, image_review_path, output_path) -> list[dict]`.
- Record contract: `candidateId`, `verified`, `reviewStatus`, `reviewedAt`, `approvalMode`, `name`, `role`, `relation`, `summary`, `content`, `sourceUrl`, `sourceType`, `sourceLevel`, `evidence`, `originalText`, and `image`.

- [ ] **Step 1: Write failing tests for the trusted-source gate and image boundary**

```python
def test_only_approve_records_with_an_ab_source_and_url_are_reviewed():
    reviewed = build_reviewed([approved_a, pending_a, approved_c, approved_without_url], {})
    assert [item["candidateId"] for item in reviewed] == ["PEOPLE-001"]
    assert reviewed[0]["verified"] is True
    assert reviewed[0]["approvalMode"] == "trusted-source-rule"

def test_unconfirmed_image_is_kept_missing_and_has_no_local_path():
    reviewed = build_reviewed([approved_a], {"PEOPLE-001": uncertain_image})
    assert reviewed[0]["image"] == {"localPath": None, "status": "missing", ...}
```

- [ ] **Step 2: Run the new test file and confirm it fails because the module does not exist**

Run: `python -m unittest crawler/node/tests/test_d115c_reviewed_people.py -v`

- [ ] **Step 3: Implement the minimal reviewed-data generator**

```python
def is_trusted_person(record):
    return (
        record["recommendedDecision"] == "APPROVE"
        and record["sourceLevel"] in {"A", "B"}
        and bool(record["originalText"]["sourceUrl"])
    )
```

Map `身份/职务`, `与西安八办/七贤庄的关系`, and `关键细节` only from `originalRow`; preserve all original values. Map image information only when the image-review record is `confirmed` with source URL, caption, and identity evidence. Otherwise set `localPath` and `sourceImageUrl` to `None`, `status` to `missing`.

- [ ] **Step 4: Run the tests and generator**

Run: `python -m unittest crawler/node/tests/test_d115c_reviewed_people.py -v`

Run: `python crawler/node/scripts/d115c_reviewed_people.py --people-review crawler/node/output/review-work/people-review.json --image-review crawler/node/output/review-work/people-image-review.json --output crawler/node/output/reviewed/people.json`

Expected: 25 records, all verified, no local image paths, and no PENDING/REJECT IDs.

### Task 2: Add an idempotent reviewed-people seed with dry-run

**Files:**
- Create: `backend/scripts/seedReviewedContent.js`
- Create: `backend/tests/seed-reviewed-people.test.js`
- Modify: `backend/package.json`

**Interfaces:**
- Consumes: `crawler/node/output/reviewed/people.json`.
- Produces: `planPeopleSeed(pool, reviewedPeople)` and `seedReviewedPeople(pool, reviewedPeople)`.
- CLI: `npm run seed:reviewed -- --dry-run` and `npm run seed:reviewed`.

- [ ] **Step 1: Write failing seed tests**

```js
test('dry run classifies inserts without issuing a write query', async () => {
  const report = await planPeopleSeed(pool, reviewedPeople)
  assert.deepEqual(report, { insert: 25, update: 0, skip: 0, conflict: 0 })
})

test('a second seed updates the matching person instead of inserting a duplicate', async () => {
  await seedReviewedPeople(pool, reviewedPeople)
  await seedReviewedPeople(pool, reviewedPeople)
  assert.equal(insertedPeopleCount, 25)
})
```

- [ ] **Step 2: Run the seed test file and confirm it fails because its script exports do not exist**

Run: `npm test --prefix backend -- tests/seed-reviewed-people.test.js`

- [ ] **Step 3: Implement parameterized seed and npm script**

Use a transaction for non-dry-run execution. Match existing records with `SELECT id FROM person WHERE source_url = ? AND name = ? LIMIT 1`, then update or insert with parameter arrays. Store `summary`, `content`, `image.localPath`, `sourceUrl`, and `status = 1`; do not alter tables unrelated to `person`.

- [ ] **Step 4: Verify dry-run before a real seed**

Run: `npm run seed:reviewed --prefix backend -- --dry-run`

Expected: report only; no database writes.

- [ ] **Step 5: Run real seed and repeat it**

Run: `npm run seed:reviewed --prefix backend`

Run: `npm run seed:reviewed --prefix backend`

Expected: first run inserts 25, repeat run updates or skips the same 25 without duplicates.

### Task 3: Expose public people APIs through the existing Express layers

**Files:**
- Create: `backend/src/models/personModel.js`
- Create: `backend/src/services/personService.js`
- Modify: `backend/src/controllers/contentController.js`
- Modify: `backend/src/routes/content.js`
- Modify: `backend/src/utils/serializers.js`
- Create: `backend/tests/people-api.test.js`

**Interfaces:**
- `personModel.findPeople(pool, filters, pagination)`, `countPeople(pool, filters)`, `findPersonById(pool, id)` query only `status = 1`.
- `personService.getPeople(pool, filters, pagination)` returns `{ list, total }`; `getPerson(pool, id)` returns camelCase data or `null`.
- `GET /api/people?page&pageSize&keyword` and `GET /api/people/:id` return `{ code, message, data }`.

- [ ] **Step 1: Write failing route tests**

```js
test('GET /api/people returns only public people with nullable images', async () => {
  const response = await request(app).get('/api/people?page=1&pageSize=9')
  assert.equal(response.body.data.list[0].image, null)
})

test('GET /api/people/:id returns 400 for invalid id and 404 for a missing person', async () => {
  assert.equal((await request(app).get('/api/people/no')).status, 400)
  assert.equal((await request(app).get('/api/people/999')).status, 404)
})
```

- [ ] **Step 2: Run the people API tests and confirm routes are absent**

Run: `npm test --prefix backend -- tests/people-api.test.js`

- [ ] **Step 3: Implement model, service, serializer, controller and route**

Use parameterized keyword `LIKE ?`, the shared pagination parser and `parsePositiveInteger`. Return only `id`, `name`, `summary`, `content`, `image`, `sourceUrl`, `createdAt`, `updatedAt`; derive role/relation in the serializer from the preserved display content only when present.

- [ ] **Step 4: Run people API tests**

Run: `npm test --prefix backend -- tests/people-api.test.js`

### Task 4: Restore people views, homepage entry and search with safe API behavior

**Files:**
- Create: `frontend/src/api/people.js`
- Modify: `frontend/src/views/People.vue`
- Modify: `frontend/src/views/PersonDetail.vue`
- Modify: `frontend/src/views/Home.vue`
- Modify: `frontend/src/views/Search.vue`
- Modify: `frontend/src/components/PersonCard.vue` if it cannot render `image: null` with the existing neutral placeholder.
- Create: `frontend/tests/people-api-flow.test.js`

**Interfaces:**
- `getPeople(params)` calls `/people`; `getPersonById(id)` calls `/people/:id`.
- API failures produce empty/safe display status, not demonstration people data.

- [ ] **Step 1: Write failing frontend tests**

```js
test('people API adapter requests only public people endpoints', () => {
  assert.equal(getPeoplePath({ page: 1, pageSize: 9 }), '/people?page=1&pageSize=9')
})

test('null person image resolves to the neutral local placeholder', () => {
  assert.equal(toPersonCard({ image: null }).image, personPlaceholder)
})

test('search does not include a person when the people API is unavailable', () => {
  assert.deepEqual(buildSearchRecords({ people: null }), [])
})
```

- [ ] **Step 2: Run frontend tests and confirm they fail before the adapter/view helpers exist**

Run: `npm test --prefix frontend -- tests/people-api-flow.test.js`

- [ ] **Step 3: Implement API-backed views and limited homepage/search integration**

In `People.vue`, retain a loading-safe layout and render API results only. In `PersonDetail.vue`, validate route IDs through the API and show source link plus image caption only when supplied. In `Home.vue`, request the first four people and keep the existing chronology placeholder intact. In `Search.vue`, merge only successfully loaded public people; on failure keep relic/news results and show no person records.

- [ ] **Step 4: Run frontend tests and build**

Run: `npm test --prefix frontend -- tests/people-api-flow.test.js`

Run: `npm run build --prefix frontend`

### Task 5: Produce reports and final verification

**Files:**
- Create: `docs/d11-5c-import-report.md`
- Create: `docs/people-image-localization-report.md`
- Modify: `docs/frontend-content-completeness.md`

- [ ] **Step 1: Generate factual reports**

Record 25 rule-approved people, 0 reviewed history/courtyards/other modules, 0 confirmed/localized/download-failed images, 25 missing images, seed insert/update counts, and page status: people complete, history pending, digital museum pending, search partial. The localization report must explicitly state that no image met the confirmed-download threshold.

- [ ] **Step 2: Run final verification**

Run: `python -m unittest discover -s crawler/node/tests -p 'test_*.py' -v`

Run: `npm test --prefix backend`

Run: `npm test --prefix frontend`

Run: `npm run build --prefix frontend`

Run: `git diff --check`

- [ ] **Step 3: Inspect scope without committing**

Run: `git status --short`

Run: `git diff --stat`

Confirm that no Git staging, commit or push operation occurs.

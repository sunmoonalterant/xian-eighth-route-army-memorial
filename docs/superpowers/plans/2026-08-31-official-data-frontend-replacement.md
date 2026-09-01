# Official Data Frontend Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert reviewed xabb official drafts into static Vue data modules and replace only the matching frontend demonstrations.

**Architecture:** A small Node export script reads reviewed JSON and writes static ES modules into the frontend data folder. Vue views consume those modules, render sanitized official HTML, preserve source context, and visibly label unsupported categories as placeholders.

**Tech Stack:** Node.js built-ins, Vue 3, Vite, existing node:test suite.

**Spec:** `docs/superpowers/specs/2026-08-31-official-data-frontend-replacement.md`

## Global Constraints

- Do not collect new web data, solve the news 405, create a backend, or access MySQL.
- Raw collection files are read-only; reviewed data keeps `verified: false` and `reviewStatus: "pending"` while adding only `frontendReady: true`.
- Do not invent categories, years, dates, addresses, history, people, news or courtyard facts.
- Frontend must not load crawler data at runtime; only generated static modules may be imported.
- External official image URLs stay in data modules and use a local fallback on error.

---

### Task 1: Generate audited reviewed JSON and static data modules

**Files:**
- Create: `crawler/node/output/reviewed/museum.json`, `relics.json`, `exhibitions.json`, `visit.json`
- Create: `crawler/node/src/export-frontend.js`, `crawler/node/test/export-frontend.test.js`
- Modify: `crawler/node/package.json`, `frontend/src/data/museum.js`, `frontend/src/data/relics.js`, `frontend/src/data/exhibitions.js`
- Create: `frontend/src/data/visit.js`

- [ ] Write a failing export test asserting all reviewed records remain pending/unverified, are frontend-ready, and nine relics retain source API IDs.
- [ ] Run `node --test crawler/node/test/export-frontend.test.js` and confirm the export module is absent.
- [ ] Implement a deterministic exporter: derive safe summaries, first official image as cover, and format ES modules from reviewed JSON; do not read crawler at frontend runtime.
- [ ] Run the export test, then `node crawler/node/src/export-frontend.js`; verify reviewed and generated modules contain 1 museum, 9 relics, 3 exhibitions and 1 visit record.

### Task 2: Adapt official-data pages and safe image/HTML presentation

**Files:**
- Modify: `frontend/src/views/Home.vue`, `Museum.vue`, `Relics.vue`, `RelicDetail.vue`, `Exhibitions.vue`, `Visit.vue`
- Modify: `frontend/src/components/RelicCard.vue`
- Test: existing `frontend/tests/*.test.js`

- [ ] Add failing tests covering official relic count, an official-source disclosure, address pending text, and no dangerous HTML tag in rendered content.
- [ ] Run `npm test` from `frontend` and confirm failure before view adaptation.
- [ ] Update views to use generated fields, hide empty era/category values, use an image-error fallback, present source and retrieval date, and display the official visit disclaimer.
- [ ] Run the frontend tests and `npm run build`; confirm no compiler error.

### Task 3: Label unsupported demonstration content and verify UI behavior

**Files:**
- Modify: `frontend/src/data/people.js`, `news.js`, `museum.js` history records, and any courtyard source used by views
- Modify: `frontend/src/views/People.vue`, `News.vue`, `History.vue`, and applicable courtyard view

- [ ] Add a failing test asserting empty-official types have `isPlaceholder: true`.
- [ ] Implement subtle “资料整理中 / 待史料核实” labels and replace people photos with a local silhouette/placeholder asset.
- [ ] Run `npm test`, `npm run build`, and manually inspect homepage, museum, relic list/detail, exhibitions and visit at desktop/mobile widths.

## Plan self-review

- Coverage includes reviewed data, static export, official views, safe fields/images/HTML, unsupported-data labels, tests and build verification.
- No API access, fact inference or backend work is included.

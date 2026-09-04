# D11.5 全站资料搜集、来源核验与内容补全 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立可追溯、可人工审核的候选资料集并完成全站缺口盘点，绝不发布未核验史料。

**Architecture:** 将 MySQL 和现有游客数据视为只读证据。新增发现只写入 `crawler/node/output/candidates/` 的 pending JSON；审计、来源、冲突和页面完整度写入 Markdown；不进入数据库、API 或 Vue 页面。

**Tech Stack:** Node.js JSON 解析、现有 reviewed/static 数据、低频公开 HTTP、Markdown、Git 只读检查。

**Spec:** `docs/superpowers/specs/2026-09-04-d11-5-content-verification-design.md`

## Global Constraints

- 不改 MySQL、schema、API、Vue 页面/路由、已确认 D10 内容或图片。
- 每个候选具备 source URL/name/level、retrievedAt、`verified: false`、`reviewStatus: "pending"` 和精简 evidence。
- A/B 实际页面才可支持候选；C 仅为线索。时间精度必须保留，禁止推断事实。
- 不下载图片；仅记录明确对应内容的来源图片和 `confirmed`、`uncertain` 或 `missing` 状态。
- 403/429 后停止该域名访问；不登录、不枚举、不绕过控制、不引用搜索摘要。
- 不执行 `git add`、`git commit` 或 `git push`。

---

### Task 1: 建立只读基线与候选文件

**Files:**
- Read: `frontend/src/data/*.js`, `frontend/src/views/*.vue`, `crawler/node/output/reviewed/*.json`, `docs/init.sql`, `docs/content-verification-report.md`
- Create: `crawler/node/output/candidates/people.json`, `history-events.json`, `courtyards.json`, `museum-review.json`, `relic-review.json`, `exhibition-review.json`, `news-review.json`, `visit-review.json`

**Interfaces:**
- Consumes: 当前公开/只读内容和 D11.5 candidate contract。
- Produces: UTF-8 JSON 数组；空数组表示缺乏可靠证据，不得装入旧占位。

- [ ] **Step 1: 统计既有 reviewed 和 placeholder，不做编辑。**

Run:

```powershell
node -e "for (const f of ['museum','relics','exhibitions','visit']) { const x=require('./crawler/node/output/reviewed/'+f+'.json'); console.log(f, Array.isArray(x)?x.length:1) }"
rg -n "export const (people|history|courtyard)|isPlaceholder|资料整理" frontend/src/data frontend/src/views
```

Expected: museum 1、relics 9、reviewed exhibitions 3、visit 1；人物/历史/院落正式记录缺失。

- [ ] **Step 2: 使用 `apply_patch` 建立上述八个内容为 `[]` 的候选文件。**

- [ ] **Step 3: 验证每个候选文件是 JSON 数组。**

Run: `node -e "const fs=require('fs'); for (const f of fs.readdirSync('crawler/node/output/candidates')) { const x=JSON.parse(fs.readFileSync('crawler/node/output/candidates/'+f,'utf8')); if (!Array.isArray(x)) throw new Error(f+' must be an array'); } console.log('candidate JSON arrays valid')"`

Expected: 全部可解析，且没有记录被自动标为 verified。

### Task 2: 生成缺口与路由完整度审计

**Files:**
- Create: `docs/content-gap-audit.md`, `docs/frontend-content-completeness.md`
- Read: `frontend/src/router/index.js`, `frontend/src/views/*.vue`, `frontend/src/data/*.js`, `backend/src/app.js`, `docs/init.sql`

**Interfaces:**
- Consumes: 基线数量和真实路由/数据使用关系。
- Produces: 基于证据的模块与路由状态表。

- [ ] **Step 1: 映射首页、馆情、人物/详情、历史、文物/详情、展览、新闻/详情、数字纪念馆、参观服务、搜索，以及首页人物/时间线的实际数据路径。**

- [ ] **Step 2: 写模块审计表。** 每个模块写明数量、来源、MySQL/static、placeholder、`source_url`、图片/本地化、是否需补充和主要缺口；解释 `status` 与 `verified/reviewStatus` 不同。

- [ ] **Step 3: 为 `/`、`/museum`、`/history`、`/relics`、`/people`、`/exhibitions`、`/news`、`/digital-museum`、`/visit`、`/search` 赋予 `complete`、`partial` 或 `pending`，并给出实际原因。**

- [ ] **Step 4: 复核审计不含虚构事实。**

Run: `rg -n "待核实|资料整理|pending|0 条|不入库" docs/content-gap-audit.md docs/frontend-content-completeness.md`

Expected: 人物、历史和院落缺口明确；无假姓名、日期、用途或图片。

### Task 3: 来源登记与人物、历史、院落候选搜集

**Files:**
- Create: `docs/content-source-register.md`
- Modify: `crawler/node/output/candidates/people.json`, `history-events.json`, `courtyards.json`

**Interfaces:**
- Consumes: 已有 reviewed 来源和少量公开 A/B 页面中的文字证据。
- Produces: 去重来源登记与零条或多条 pending 候选。

- [ ] **Step 1: 先登记 reviewed 数据和 `officialCourtyards.js` 中的每个不同 URL。** 每条包含 sourceId、sourceName、sourceLevel、sourceUrl、publisher、pageTitle、retrievedAt、applicableDomain、notes。

- [ ] **Step 2: 只低频访问实际 A/B 页面。** 从保存的官网 URL 与已知站点栏目开始；搜索关键词只发现页面。采用明确 User-Agent、保守节奏；403/429 后停止该域名。

- [ ] **Step 3: 人物仅在来源明确关联西安办事处、七贤庄或驻陕办时收录。** 使用 name、aliases、roleOrRelation、summary、content、nullable birth/death、图片来源/状态、来源字段和 evidence；无可靠照片则 imageSourceUrl 为 null、状态为 missing。

- [ ] **Step 4: 历史事件仅保留原始时间精度。** `datePrecision` 为 year/month/day/unknown；“1937年”只能成为 year=1937、month/day/eventDate=null，禁止构造 1937-01-01。

- [ ] **Step 5: 院落仅在来源明确将名称与用途或展示内容对应时收录。** 禁止从文件名或泛旧址保护文章推断；UI 坐标不写进历史候选。

- [ ] **Step 6: 校验每条非空候选。**

Run: `node -e "const fs=require('fs'); for (const f of ['people.json','history-events.json','courtyards.json']) for (const r of JSON.parse(fs.readFileSync('crawler/node/output/candidates/'+f,'utf8'))) { for (const k of ['sourceUrl','sourceName','sourceLevel','retrievedAt','evidence']) if (!r[k]) throw new Error(f+' missing '+k); if (r.verified !== false || r.reviewStatus !== 'pending') throw new Error(f+' unsafe review state'); if (r.imageReviewStatus==='confirmed' && (!r.imageSourceUrl || !r.imageSourcePage)) throw new Error(f+' confirmed image lacks provenance'); } console.log('candidate provenance valid')"`

Expected: 只有 pending/unverified 的可追溯候选，且无不支持事实。

### Task 4: 复核现有馆情、文物、展览、新闻与参观资料

**Files:**
- Modify: `crawler/node/output/candidates/museum-review.json`, `relic-review.json`, `exhibition-review.json`, `news-review.json`, `visit-review.json`, `docs/content-source-register.md`

**Interfaces:**
- Consumes: reviewed JSON、来源登记和实际页面证据。
- Produces: 缺字段、重复、冲突与补充建议；不改正式内容。

- [ ] **Step 1: 复核馆情名称、简介、旧址/建馆表述、来源和封面对应性。** 充分则记录 `needsSupplement: false`，否则只说明缺字段和证据缺口。

- [ ] **Step 2: 复核 9 条文物的稳定 ID、来源、图片、分类、年代、详情和重复风险。** 不能支持的 category/era 保持 null。

- [ ] **Step 3: 以稳定详情页身份与正文语义复核展览。** 记录已知重复项的逻辑下线，不把图库图片当新展览。

- [ ] **Step 4: 复核 5 条新闻的来源/发布时间/分类/图片，以及参观服务当前信息。** 可靠来源冲突则设置 reviewStatus 为 conflict 并登记 conflictingSources，不裁决。

- [ ] **Step 5: 解析全部 JSON。**

Run: `node -e "const fs=require('fs'); for (const f of fs.readdirSync('crawler/node/output/candidates')) JSON.parse(fs.readFileSync('crawler/node/output/candidates/'+f,'utf8')); console.log('all candidate and review JSON valid')"`

Expected: 所有 JSON 合法，D10 正式内容不变。

### Task 5: 人工审核包与最终报告

**Files:**
- Create: `docs/manual-content-review-checklist.md`
- Modify: `docs/content-verification-report.md`
- Read: 全部 candidates、审计和来源登记

**Interfaces:**
- Consumes: 已验证格式的候选、审计和来源记录。
- Produces: 可决定是否入库的人工核验清单与精确汇总。

- [ ] **Step 1: 写模块审核清单。** 人物：身份/关系/生卒/照片；历史：日期/关系；院落：名称/用途/图片；参观：当前有效性；文物：来源/图片/分类/年代；展览：详情页身份；新闻：来源/日期/分类/图片。

- [ ] **Step 2: 更新核验报告。** 列出正式与候选数量、A/B/C 分布、图片候选/确认/不确定/缺失数量、冲突数、找不到来源的内容、推荐人工审核候选和最优先的 10 项。仅当外网确实不稳定或不可用时写 `externalResearchBlocked: true`。

- [ ] **Step 3: 从 JSON 交叉核对报告数量。**

Run: `node -e "const fs=require('fs'),p='crawler/node/output/candidates/'; for (const f of fs.readdirSync(p)) console.log(f,JSON.parse(fs.readFileSync(p+f,'utf8')).length)"`

Expected: 每个报告计数都可追溯到 JSON，零数量也明确。

### Task 6: 边界验证与未提交交付

**Files:**
- Read: `frontend/src/views/People.vue`, `History.vue`, `DigitalMuseum.vue`, `Home.vue`, `docs/init.sql`, Git working tree

**Interfaces:**
- Consumes: 最终候选包和源代码。
- Produces: 未发布候选且未触碰禁止子系统的证据。

- [ ] **Step 1: 检查受限路径。**

Run: `git diff --name-only -- frontend backend docs/init.sql`

Expected: D11.5 不应产生 `frontend/`、`backend/`、`docs/init.sql` 改动。

- [ ] **Step 2: 确认执行记录中没有 seed、migration、INSERT、UPDATE 或图片下载。**

- [ ] **Step 3: 只报告 Git 状态。** 运行 `git status --short` 与 `git diff --stat`，但不得暂存、提交或推送。

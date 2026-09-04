# D11.5 全站资料搜集、来源核验与内容补全设计

## 目标

建立一套可追溯、待人工审核的候选资料集，并完整说明现有网站的资料缺口；本阶段不把任何候选资料作为正式史实发布。

## 范围与边界

- 审计首页、馆情、人物、历史、文物、展览、新闻、数字院落、参观服务、全站搜索及首页人物/时间线。
- 创建候选资料和来源登记文档；候选仅写入 `crawler/node/output/candidates/`。
- 不修改 MySQL 结构或数据，不创建种子脚本、公共 API 或后台 CRUD。
- 不修改 Vue 页面、路由、既有已确认内容；仅发现明确错误时报告，不自动修正。
- 不下载图片或本地化候选图片，不将候选图片列入 `frontend/public/images/`。
- 不提交、不推送 Git。

## 资料分层与发布规则

| 来源级别 | 可接受发布用途 |
| --- | --- |
| A | 纪念馆、政府、官方党史/文博/文旅平台；可作为主要候选来源。 |
| B | 权威党史、档案、国家级文博机构、出版或高校学术机构；仅作补充与交叉核对。 |
| C | 媒体、百科、旅游及普通资讯；只可作为发现线索，不得单独支持正式候选事实。 |

所有候选默认 `verified: false`、`reviewStatus: "pending"`。`status`（前台展示）与人工审核状态不是同一概念。本阶段不会设置候选为 `verified`，也不会将其导入数据库或游客页。

## 资料来源与网络策略

研究优先使用已保存的 `crawler/node/output/reviewed/`、静态官方资料、已知纪念馆官网页面；仅在它们不足时低频访问公开 A/B 级实际页面。每次记录来源 URL、发布者、页面标题、检索时间、适用领域和简短证据摘要。搜索结果摘要只用于发现页面，不能作为证据。遇到 403 或 429 即停止对应来源的访问；不登录、不枚举、不绕过访问控制。

## 候选数据接口

所有记录都有以下基础字段：

```json
{
  "sourceUrl": "https://...",
  "sourceName": "来源名称",
  "sourceLevel": "A",
  "retrievedAt": "2026-09-04T00:00:00+08:00",
  "verified": false,
  "reviewStatus": "pending",
  "evidence": "页面明确支持的简短事实"
}
```

- `people.json` 追加 `name`、`aliases`、`roleOrRelation`、`summary`、`content`、`birthYear`、`deathYear`、`imageSourceUrl`、`imageSourcePage`、`imageReviewStatus`。
- `history-events.json` 追加 `title`、`datePrecision`、`eventDate`、`year`、`month`、`day`、`summary`、`content`。只保留来源的时间精度；缺失值为 `null`，不补成某月或某日。
- `courtyards.json` 追加 `name`、`aliases`、`summary`、`content`、`historicalUse`、`currentUse`、`imageSourceUrl`、`imageSourcePage`、`imageReviewStatus`。院落历史事实不包含 UI 热点坐标。
- 其他 `*-review.json` 用于复核既有资料、记录缺字段、来源冲突和是否无需补充。

图片只记录已确认关联的源地址。`imageReviewStatus` 只能为 `confirmed`、`uncertain` 或 `missing`；只有日后人工确认的 `confirmed` 图片才可被提议本地化。

## 去重与冲突

- 人物使用规范化姓名、关系说明及来源组合判断，避免仅凭同名合并。
- 事件使用规范化标题、原始时间精度和正文语义判断。
- 院落使用规范化名称、来源和用途说明判断。
- 展览使用稳定详情页身份与正文规范化结果判断，图库图片不构成展览记录。
- 新闻使用 `source_url` 或稳定官方文章 ID；文物优先使用官方稳定 ID。
- 两个可靠来源冲突时，保留候选但标记 `reviewStatus: "conflict"`，写入 `conflictingSources`；不自行裁决。

## 交付物

| 文件 | 用途 |
| --- | --- |
| `docs/content-gap-audit.md` | 逐模块内容数量、来源、图片、缺口和补充需求。 |
| `docs/content-source-register.md` | 可追溯的来源登记与来源等级。 |
| `docs/manual-content-review-checklist.md` | 人物、历史、院落、参观服务等人工审核项。 |
| `docs/frontend-content-completeness.md` | 每个游客端路由的 complete/partial/pending 状态。 |
| `docs/content-verification-report.md` | 更新后的正式数据、候选、来源分布、冲突与缺口总报告。 |
| `crawler/node/output/candidates/*.json` | 不可直接发布的候选资料与复核结论。 |

## 验收

1. 每个候选均有来源、来源等级、取回时间、证据摘要和待审状态。
2. 人物、事件、院落没有根据常识补充日期、用途、身份或图片。
3. 找不到可靠资料时，用空数组和报告结论表达，不以 C 级材料补齐。
4. `person`、`history_event`、`courtyard` 表仍为 0 条，游客页面与数据库均不变。
5. 输出 `git status` 与 `git diff --stat`，但不执行任何 Git 写入操作。

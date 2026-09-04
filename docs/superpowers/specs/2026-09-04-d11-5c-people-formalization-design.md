# D11.5C 人物资料正式化设计

## 目标

将 D11.5B 中满足可信来源自动审批规则的历史人物文字资料正式化，并在不新增数据库字段的前提下导入 MySQL、开放游客 API、恢复人物相关游客端内容。

## 自动审批规则

人物记录只有同时满足以下条件时，才会由本阶段规则自动正式化：

- `recommendedDecision` 为 `APPROVE`；
- `sourceLevel` 为 `A` 或 `B`；
- `sourceUrl` 非空；
- D11.5B 人物文字审核记录存在且对应相同 `candidateId`。

该规则预计正式化 25 位人物。`PENDING`、`CONFLICT`、`REJECT` 或 C 级来源人物一律保留在 review-work，不写入 reviewed、MySQL 或游客端。每条正式记录保留 `approvalMode: "trusted-source-rule"`，以区别于人工填写的批准决定。

## 人物与图片边界

文字审核和图片审核继续独立。人物文字通过可信来源规则后，即使没有图片也可正式化。图片只有在审核记录为 `confirmed`，且记录中存在明确的身份依据、说明和可靠原图 URL 时才允许下载。

当前人物图片审核中没有符合这些条件的记录，因此本阶段不下载图片，所有正式人物的 MySQL `image` 保持 `NULL`，游客端用已存在的中性剪影。`uncertain`、`missing`、`rejected` 图片绝不本地化。

## 数据流

1. 读取 `people-review.json` 与 `people-image-review.json`，以 `candidateId` 合并，原始人物文字来自 `people-review.json` 的 `originalRow`。
2. 生成 `reviewed/people.json`。每条包含审核状态、审核规则、原始身份/关系/关键细节、来源、证据及图片溯源结构。
3. `seedReviewedContent.js` 先支持 dry-run；正式运行时仅 upsert `person` 表，稳定匹配优先使用 `source_url + name`，再使用规范化姓名。所有写入用参数化 SQL 与事务。
4. `person` 表不新增字段。`summary` 由原始身份和关系的可见组合生成，`content` 保留原始关系与关键细节；来源 URL 写入 `source_url`，图片为空。
5. 新增只读的 people 路由、controller、service、model。公共 API 仅返回 `status = 1` 的人物。由于本阶段 seed 只写入已正式化数据，`status = 1` 代表公开状态，不替代 reviewed JSON 的历史审核语义。
6. 人物列表、详情、首页人物区和搜索优先读 API。API 不可用时，页面显示安全的暂不可加载状态，不恢复任何演示人物资料。

## 前端范围

- `/people`：展示正式人物名称、身份/关系摘要和图片或中性剪影。
- `/person/:id`：展示人物图片说明（仅有时）、身份、关系、简介、原始详情与来源。
- 首页：仅从已正式人物中选择最多 4 位作为入口。
- `/search`：只重新纳入 API 返回的正式人物。
- `/history`、首页时间线、`/digital-museum`：继续保持资料整理状态；本轮不会将未明确授权的历史事件和院落正式化。

## 安全与非目标

- 不修改 Excel、现有 museum/relic/exhibition/article 正式内容、预约、统计或管理员业务。
- 不新增或修改 MySQL schema；`sourceLevel`、`evidence`、图片说明等审核辅助字段保留在 reviewed JSON。
- 不访问搜索引擎 CDN，不绕过防盗链，不使用 AI 肖像、影视剧照或视觉猜测。
- 不自动执行 Git add、commit 或 push。

## 验收

- 自动审核生成器只产出符合四项条件的 25 条人物；其他 6 条不进入 reviewed。
- reviewed 每条为 `verified: true`、`reviewStatus: "verified"`，有来源和原始文字；图片无 confirmed 则不下载。
- seed dry-run 无数据库写入；正式 seed 可重复运行而不重复插入。
- people API 覆盖分页、详情、无效 ID、404、空图片。
- 前端在 API 正常时展示正式数据，失败时不产生演示资料。
- crawler、backend、frontend 测试、前端构建和 `git diff --check` 均通过。

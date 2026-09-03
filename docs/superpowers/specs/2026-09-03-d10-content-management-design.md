# D10 内容管理设计

## 范围

本阶段只实现文物、新闻与展览的管理员 CRUD，以及新闻的公共只读 API 和游客端接入。保留 D1--D9 的游客接口、预约业务与管理员预约管理；不实现人物、历史事件、院落、馆情、统计、RBAC、上传或富文本编辑器。

## 既有数据模型

不新增或调整数据表。内容使用现有 `relic`、`relic_category`、`exhibition`、`article`、`article_category` 表。

- `relic` 与 `article` 通过分类外键关联分类表；管理员写入时仅接受已存在的分类 ID。
- 三类内容表都有 `status`；`1` 表示游客可展示，`0` 表示隐藏或下线。因此删除使用逻辑下线，不做物理删除。
- 文物的 `source_api_id` 只作为采集稳定标识展示，不属于可编辑白名单。
- 已有 `source_url` 保留。管理员可依实际表单编辑 URL，但删除采集来源记录时须额外确认。

## API 设计

所有管理员接口都通过既有 `requireAdminAuth` 中间件：

- `GET/POST /api/admin/relics`
- `GET/PUT/DELETE /api/admin/relics/:id`
- `GET/POST /api/admin/articles`
- `GET/PUT/DELETE /api/admin/articles/:id`
- `GET/POST /api/admin/exhibitions`
- `GET/PUT/DELETE /api/admin/exhibitions/:id`

新增游客只读新闻接口：

- `GET /api/articles`
- `GET /api/articles/:id`

公共查询强制 `status = 1`。管理员查询可包含已下线内容，供恢复或核对。所有搜索、分页、ID 与分类过滤均使用参数化 SQL；参数和可写字段均在 service 层验证。

管理员创建与编辑只使用显式白名单。文物允许名称、分类、年代、摘要、正文、封面 URL、来源 URL、状态；新闻和展览对应既有字段。标题/名称必填，URL 仅允许 `http` 或 `https`，展览的结束日期不得早于开始日期。

## HTML 与资料安全

新增轻量级 `sanitize-html`，在后端写入前清洗正文，仅保留必要的文本和排版标签。脚本、事件属性和 `javascript:` URL 不会保存或执行。后台编辑使用 textarea，不引入编辑器或上传功能。

## 新闻导入

新增 `seed:news` 脚本，读取 `frontend/src/data/officialNews.js`。该数据是当前唯一的新闻来源；crawler 的 `reviewed` 目录没有新闻数据。

脚本会按 `source_url` 查询以幂等导入，并按数据中已有分类名称复用或创建必要分类。根据本阶段确认，这些官网公开资料以 `status = 1` 写入，以便游客 API 使用，同时保留来源 URL，游客页面继续标注“官网公开资料整理，待人工审核”。导入过程不伪造发布时间、正文或任何史实。

## 后端分层

各内容域使用独立的 admin model、service、controller、route，沿用当前项目的分层方式。公共新闻使用 article model/service/controller，与后台操作同一 `article` 表，不维护内容副本。

## 前端设计

新增后台路由：`/admin/relics`、`/admin/news`、`/admin/exhibitions`，并在已有后台菜单中按预约、文物、新闻、展览排序。

每个内容页采用 Element Plus 的列表、分页、筛选、详情 Dialog 和共用创建/编辑 Dialog。提交成功与删除成功均重新请求 API，不在本地伪造更新。删除采集来源记录时显示来源提醒与确认。

新增 `adminRelics.js`、`adminNews.js`、`adminExhibitions.js` API 适配层并复用现有 Axios JWT 拦截器。游客新闻新增 `news.js`：优先使用 API，失败时保留 `officialNews.js` fallback，并显示本地资料提示。文物和展览继续通过同一公共 MySQL API 刷新。

## 测试与验收

后端新增 admin CRUD、JWT 401、参数验证、危险 HTML、逻辑删除、公共新闻筛选和新闻种子幂等测试；测试使用 mock pool 或隔离实例，不触碰真实 MySQL。

前端新增菜单、API 参数、表单验证、重新加载、删除确认、展览日期校验、401 会话清理和新闻 fallback 测试。最终运行 backend `npm test`、frontend `npm test` 与 `npm run build`，并进行浏览器联调。Git 仅报告状态，不自动创建提交。

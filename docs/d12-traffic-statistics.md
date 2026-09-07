# D12：匿名访问日志与运营统计验收记录

## 范围与数据表

D12 复用既有 MySQL `visit_log`，未新增迁移、统计表或索引。公开写入接口只插入 `visitor_id` 与 `page_path`；既有 `page_title`、`device_type`、`browser`、`referrer` 始终不写入，验收记录中均为 `NULL`。

前端以 `localStorage` 的 `memorial_visitor_id` 保存 UUID v4。该值只代表当前浏览器匿名实例：同一值重复访问会增加 PV 而不会增加 UV；清除该项或换用新浏览器会产生新的匿名访客。

不采集姓名、手机号、身份证号、预约编号、IP、User-Agent、浏览器/设备指纹、Referrer、完整 URL、查询参数或 hash。

## 路由采集规则

Vue Router 只注册一个 `afterEach`。成功进入游客路由后，最佳努力上报 `to.path`；上报失败仅 `console.debug`，不影响导航。`/admin`、`/admin/*` 与 `/admin/login` 全部排除。

动态详情路径由后端统计查询归一化：

- `/relic/<id>` → `/relic/:id`
- `/person/<id>` → `/person/:id`
- `/news/<id>` → `/news/:id`
- `/exhibition/<id>` → `/exhibition/:id`

排行 SQL 在归一化后的子查询中执行 `COUNT(DISTINCT visitor_id)`，因此不会把不同详情页的 UV 直接相加。

## 接口

| 接口 | 鉴权 | 用途 |
| --- | --- | --- |
| `POST /api/visit-logs` | 否 | 写入匿名 UUID 与路由 path，返回 200 包络 |
| `GET /api/admin/statistics/overview` | JWT | 总/当日 PV、UV 与预约概览 |
| `GET /api/admin/statistics/traffic-trend?days=7` | JWT | 最近 1–90 天 PV/UV，缺日补 0 |
| `GET /api/admin/statistics/page-ranking?limit=10` | JWT | 规范化页面 PV/UV 排行，limit 1–50 |
| `GET /api/admin/statistics/reservations` | JWT | 状态、预约总人数与有效预约人数 |
| `GET /api/admin/statistics/reservation-trend?days=7` | JWT | 预约创建量与人数趋势，缺日补 0 |
| `GET /api/admin/statistics/period-distribution` | JWT | 按预约时段的预约数、人数及有效口径 |

预约状态使用现有 `PENDING`、`SUCCESS`、`CANCELLED`、`CHECKED_IN`、`EXPIRED`。有效预约/人数只计 `PENDING`、`SUCCESS`、`CHECKED_IN`；取消和过期不计有效人数。

## 真实 MySQL 验收（2026-09-06）

在 D12 工作树启动的后端（本机 3001，避免占用已有 3000 服务）完成以下验收：

1. `/api/health` 返回 200，`/api/test-db` 返回 200（MySQL 已连接）。
2. 新匿名访客 A 写入 `/` 三次、`/people` 一次：PV 增加 4，UV 增加 1。
3. 新匿名访客 B 写入 `/` 一次后，数据库总量从 `PV=0, UV=0` 变为 `PV=5, UV=2`；五条新增记录的旧分析列均为 `NULL`。
4. 访客 A 访问 `/relic/1` 和 `/relic/2`，访客 B 访问 `/relic/2`；`page-ranking` 返回唯一的 `{ path: '/relic/:id', pageName: '文物详情', pv: 3, uv: 2 }`。
5. 六个管理员统计接口均返回 200；匿名访问 `overview` 返回 401。
6. 本机浏览器实际打开 D12 前端并进行两次首页刷新、进入人物页并刷新；同一个 `memorial_visitor_id` 在 MySQL 中留下 `/`, `/`, `/people`, `/people` 共 4 条记录，即 PV=4、UV=1，验证了 Router `afterEach` 真链路。

为保证这些结果可复核，以上 12 条最小匿名验收记录保留在开发 MySQL 的 `visit_log` 中；不包含可识别个人信息。

## 自动验证

- 后端 `npm test`：78/78 通过。
- 前端 `npm test`：64/64 通过。
- 前端 `npm run build`：通过。
- D12 未新增 ECharts、图表、后台统计页面或 D13 内容。

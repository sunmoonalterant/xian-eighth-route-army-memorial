# 八路军西安办事处纪念馆系统数据库设计

## 1. 技术方案与边界

- 数据库名：`xian_memorial`
- 数据库版本：MySQL 8.x
- 字符集：`utf8mb4`
- 排序规则：`utf8mb4_unicode_ci`
- 主键：各表使用 `BIGINT UNSIGNED AUTO_INCREMENT`，便于 Express 以数字 ID 查询与关联。
- 时间：业务日期使用 `DATE`，精确发表/创建时间使用 `DATETIME`；所有可编辑内容表保留 `created_at`、`updated_at`。
- 本阶段只定义表、字段、索引和少量分类初始数据；不连接数据库、不写 Express、JWT 或预约接口。

设计保持单体、规范化且面向课程设计的最小规模。没有设计微服务、缓存、搜索引擎、分库分表或复杂角色权限表。

## 2. 模块与数据表

| 模块 | 表 | 职责 |
| --- | --- | --- |
| 内容展示 | `museum`、`relic_category`、`relic`、`exhibition`、`article_category`、`article` | 展示馆情、馆藏、展览和新闻内容。 |
| 历史文化 | `person`、`history_event`、`courtyard` | 承接人物档案、时间轴与数字导览热点。 |
| 游客服务 | `visit_schedule`、`reservation`、`feedback` | 管理可预约时段、预约记录和游客留言。 |
| 运营统计 | `visit_log` | 按匿名访客标识计算访问量，不保存真实 IP 或个人证件信息。 |
| 管理 | `admin` | 保存后台账号及密码哈希，角色仅限 `admin`、`editor`。 |

总计 14 张表。

## 3. 核心关系与独立内容表

1. `relic_category` 1:N `relic`：一件文物只能属于一个分类，文物允许尚未分类，因此 `category_id` 可为空。
2. `article_category` 1:N `article`：新闻资讯分类可为空，便于先导入待整理的官网资料。
3. `visit_schedule` 1:N `reservation`：一条排期可关联多条预约；每个日期+时段仅允许一条排期。
4. `museum`、`exhibition`、`person`、`history_event`、`courtyard`、`feedback`、`visit_log` 和 `admin` 暂不强行关联，避免在当前前台需求之外增加不确定外键。

外键使用 `ON DELETE SET NULL`（内容分类）或 `ON DELETE RESTRICT`（预约排期），防止删除分类或排期时误删已展示内容和预约记录。

## 4. 官网采集数据映射

当前前端已经保留部分官网采集结果。后续导入时只将经过人工审核的字段写入正常展示状态，并保留来源链接。

| 当前前端数据 | 目标表 | 主要映射 | 来源保留 |
| --- | --- | --- | --- |
| `officialMuseum` | `museum` | `title`、`summary`、`contentText/contentHtml`、首图 | `source_url` |
| `officialRelics` | `relic` | `name`、`summary`、`contentText/contentHtml`、`coverImage` | `source_url`、`source_api_id` |
| `officialExhibitions` | `exhibition` | `title`、`summary`、`contentText/contentHtml`、`coverImage` | `source_url` |
| `officialNews` | `article` | `title`、`category`、`summary`、`content`、`image`、`date` | `source_url` |
| `officialVisit` | `museum` 或后续服务配置 | 开放说明、交通与须知文本 | 原始官网 URL 应保留在 `source_url` |
| `officialCourtyards` | `courtyard` | `name/title`、`description`、`image` | `source_url` |

官网采集数据的 `source_url` 不等于审核结论：导入流程应先进入隐藏或待审核状态，审核后再将 `status` 设为 `1`。

## 5. 状态约定

| 表 | 字段 | 取值 |
| --- | --- | --- |
| `museum`、`relic`、`exhibition`、`article`、`person`、`history_event`、`courtyard` | `status` | `1` 正常展示；`0` 隐藏或待审核。 |
| `visit_schedule` | `status` | `1` 可预约；`0` 停止预约。 |
| `reservation` | `status` | `0` 待确认；`1` 成功预约；`2` 已取消；`3` 已核销；`4` 已过期。 |
| `feedback` | `status` | `0` 未处理；`1` 已处理。 |
| `admin` | `status` | `1` 启用；`0` 停用。 |

## 6. 索引设计

| 表 | 索引 | 原因 |
| --- | --- | --- |
| `relic` | `idx_relic_name(name)` | 支持文物名称关键字检索。 |
| `relic` | `idx_relic_category_status(category_id, status)` | 支持分类、展示状态筛选。 |
| `article` | `idx_article_title(title)` | 支持新闻标题检索。 |
| `article` | `idx_article_published_at(published_at)` | 支持新闻按发布时间倒序列表。 |
| `article` | `idx_article_category_status(category_id, status)` | 支持新闻分类与展示状态筛选。 |
| `exhibition` | `idx_exhibition_status_date(status, start_date, end_date)` | 支持当前展览和已结束展览筛选。 |
| `history_event` | `idx_history_event_year(year, event_date)` | 支持时间轴排序。 |
| `courtyard` | `idx_courtyard_status(status)` | 支持导览热点只加载可展示院落。 |
| `visit_schedule` | `uk_schedule_date_period(visit_date, period)` | 防止同一日期、时段重复建档。 |
| `reservation` | `uk_reservation_no(reservation_no)` | 预约查询的唯一业务编号。 |
| `reservation` | `uk_reservation_active_phone_visit_date(active_phone, visit_date)` | 硬性阻止同手机号同日期的有效预约重复；取消后允许重新预约。 |
| `reservation` | `idx_reservation_schedule_status(schedule_id, status)` | 支持按排期统计有效预约。 |
| `reservation` | `idx_reservation_visit_date(visit_date)` | 支持按到访日期管理预约。 |
| `visit_log` | `idx_visit_log_created_at(created_at)` | 支持按日、周、月计算 PV。 |
| `visit_log` | `idx_visit_log_visitor_created(visitor_id, created_at)` | 支持按时间范围计算 UV。 |

## 7. 预约人数与并发规则

`visit_schedule.reserved_count` 保存已占用名额，剩余名额为 `capacity - reserved_count`。提交预约时，未来的 `reservation` 服务必须在一个数据库事务中完成：

1. 用 `SELECT ... FOR UPDATE` 锁定指定 `visit_schedule` 行。
2. 检查排期存在、`status = 1`，且同手机号同日期没有预约记录。
3. 计算 `capacity - reserved_count`；若小于 `people_count`，回滚并返回“人数不足”。
4. 写入预约记录，再执行 `reserved_count = reserved_count + people_count`，最后提交事务。
5. 取消成功预约时，同样锁定排期；更新预约状态后仅在 `reserved_count >= people_count` 时执行扣减，防止人数变为负数，再提交。

预约编号使用按日期的 MySQL 命名锁生成：同一日期在锁内读取当前最大四位流水号后递增，`reservation_no` 唯一索引作为最后的数据库保护，避免并发请求生成重复编号。

数据库的 `CHECK (reserved_count <= capacity)` 是最后一道数据完整性约束；事务和行锁负责避免并发超卖。

## 8. 隐私与安全

- `reservation` 只为预约服务保存姓名、电话、身份证号，不用于访问统计。
- `visit_log` 仅保存由前端生成的匿名 `visitor_id`，不保存真实 IP、身份证号、手机号。
- `admin.password_hash` 只接收 bcrypt/Argon2 等哈希结果，绝不保存明文密码。
- 生产阶段应对身份证号实施应用层加密/脱敏展示，并限制管理员查询权限；本阶段不实现该逻辑。

## 9. 前端结构适配结论

当前 `officialMuseum`、`officialRelics`、`officialExhibitions`、`officialNews`、`officialVisit`、`officialCourtyards` 已包含标题、摘要/正文、封面图和官网来源链接，能直接映射到内容表。后续 Axios 适配时建议：

- 将前端 `sourceUrl` 映射为后端 JSON 的 `source_url`；展示层可保留驼峰字段，不必改现有页面。
- 将 `coverImage`/`image` 映射为 `cover_image`/`image`；后端负责统一返回可访问 URL。
- 将新闻 `date` 映射为 `published_at`，将文物 `sourceApiId` 映射为 `source_api_id`。
- 预约前端已使用日期、时段和人数，与 `visit_schedule`、`reservation` 字段一致；后续仅需替换模拟时段数据入口。

无需为了 D3 修改现有前端数据结构；Express 层可承担驼峰/下划线字段转换。

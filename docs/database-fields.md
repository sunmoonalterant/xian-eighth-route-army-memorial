# 数据库字段字典

说明：来源中的“官网采集”指当前或后续从纪念馆官网公开页面整理的数据；导入后仍需人工审核。"系统生成"指数据库、后端或前端匿名标识产生的值；"后台维护"指管理员录入或审核后的值。

## 1. `museum` — 纪念馆基本介绍

| 字段 | 类型 | 可为空 | 说明 | 来源 |
| --- | --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | 否 | 主键 | 系统生成 |
| `title` | VARCHAR(200) | 否 | 页面标题 | 官网采集/后台维护 |
| `summary` | TEXT | 是 | 简介摘要 | 官网采集/后台维护 |
| `content` | LONGTEXT | 是 | 详细介绍，允许保存整理后的 HTML 或纯文本 | 官网采集/后台维护 |
| `cover_image` | VARCHAR(500) | 是 | 封面图片 URL | 官网采集/后台维护 |
| `source_url` | VARCHAR(500) | 是 | 官网资料页面地址 | 官网采集 |
| `status` | TINYINT | 否 | 1 正常，0 隐藏 | 后台维护 |
| `created_at` | DATETIME | 否 | 创建时间 | 系统生成 |
| `updated_at` | DATETIME | 否 | 最近更新时间 | 系统生成 |

## 2. `relic_category` — 文物分类

| 字段 | 类型 | 可为空 | 说明 | 来源 |
| --- | --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | 否 | 主键 | 系统生成 |
| `name` | VARCHAR(100) | 否 | 分类名称，如文件文献、历史照片 | 后台维护/初始化 |
| `sort` | INT | 否 | 升序展示序号 | 后台维护/初始化 |
| `created_at` | DATETIME | 否 | 创建时间 | 系统生成 |

## 3. `relic` — 馆藏文物

| 字段 | 类型 | 可为空 | 说明 | 来源 |
| --- | --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | 否 | 主键 | 系统生成 |
| `name` | VARCHAR(200) | 否 | 文物名称 | 官网采集/后台维护 |
| `category_id` | BIGINT UNSIGNED | 是 | 关联 `relic_category.id` | 后台维护 |
| `era` | VARCHAR(100) | 是 | 年代或时期 | 官网采集/后台维护 |
| `summary` | TEXT | 是 | 列表摘要 | 官网采集/后台维护 |
| `content` | LONGTEXT | 是 | 文物详情 | 官网采集/后台维护 |
| `cover_image` | VARCHAR(500) | 是 | 封面图片 URL | 官网采集/后台维护 |
| `views` | BIGINT UNSIGNED | 否 | 浏览次数 | 系统生成 |
| `source_url` | VARCHAR(500) | 是 | 官网文物详情来源页 | 官网采集 |
| `source_api_id` | VARCHAR(64) | 是 | 官网/采集系统的原始标识 | 官网采集 |
| `status` | TINYINT | 否 | 1 正常，0 隐藏 | 后台维护 |
| `created_at` | DATETIME | 否 | 创建时间 | 系统生成 |
| `updated_at` | DATETIME | 否 | 最近更新时间 | 系统生成 |

## 4. `exhibition` — 陈列展览

| 字段 | 类型 | 可为空 | 说明 | 来源 |
| --- | --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | 否 | 主键 | 系统生成 |
| `title` | VARCHAR(200) | 否 | 展览标题 | 官网采集/后台维护 |
| `category` | VARCHAR(100) | 是 | 基本陈列、专题展览或临时展览 | 官网采集/后台维护 |
| `summary` | TEXT | 是 | 列表摘要 | 官网采集/后台维护 |
| `content` | LONGTEXT | 是 | 展览详情 | 官网采集/后台维护 |
| `cover_image` | VARCHAR(500) | 是 | 展览封面 URL | 官网采集/后台维护 |
| `start_date` | DATE | 是 | 展期开始日期 | 官网采集/后台维护 |
| `end_date` | DATE | 是 | 展期结束日期 | 官网采集/后台维护 |
| `views` | BIGINT UNSIGNED | 否 | 浏览次数 | 系统生成 |
| `source_url` | VARCHAR(500) | 是 | 官网展览资料页 | 官网采集 |
| `status` | TINYINT | 否 | 1 正常，0 隐藏 | 后台维护 |
| `created_at` | DATETIME | 否 | 创建时间 | 系统生成 |
| `updated_at` | DATETIME | 否 | 最近更新时间 | 系统生成 |

## 5. `article_category` — 新闻分类

| 字段 | 类型 | 可为空 | 说明 | 来源 |
| --- | --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | 否 | 主键 | 系统生成 |
| `name` | VARCHAR(100) | 否 | 分类名称 | 后台维护/初始化 |
| `sort` | INT | 否 | 升序展示序号 | 后台维护/初始化 |

## 6. `article` — 新闻资讯

| 字段 | 类型 | 可为空 | 说明 | 来源 |
| --- | --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | 否 | 主键 | 系统生成 |
| `title` | VARCHAR(255) | 否 | 新闻标题 | 官网采集/后台维护 |
| `category_id` | BIGINT UNSIGNED | 是 | 关联 `article_category.id` | 后台维护 |
| `summary` | TEXT | 是 | 列表摘要 | 官网采集/后台维护 |
| `content` | LONGTEXT | 是 | 新闻正文 | 官网采集/后台维护 |
| `cover_image` | VARCHAR(500) | 是 | 封面图片 URL | 官网采集/后台维护 |
| `views` | BIGINT UNSIGNED | 否 | 浏览次数 | 系统生成 |
| `published_at` | DATETIME | 是 | 发布时间 | 官网采集/后台维护 |
| `source_url` | VARCHAR(500) | 是 | 官网新闻详情页 | 官网采集 |
| `status` | TINYINT | 否 | 1 正常，0 隐藏 | 后台维护 |
| `created_at` | DATETIME | 否 | 创建时间 | 系统生成 |
| `updated_at` | DATETIME | 否 | 最近更新时间 | 系统生成 |

## D11.6 `media_asset` — 统一内容图片资源

图片文件保存在 `backend/uploads/`，本表仅保存公开路径和来源、审核元数据；不保存图片二进制。`status` 控制游客端是否可用，`review_status` 独立表示资料核验状态。

| 字段 | 类型 | 可为空 | 说明 | 来源 |
| --- | --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | 否 | 主键 | 系统生成 |
| `entity_type` | VARCHAR(30) | 否 | 归属实体：`person`、`relic`、`article`、`exhibition` | 后台维护 |
| `entity_id` | BIGINT UNSIGNED | 否 | 对应人物或展览 ID | 后台维护 |
| `usage_type` | VARCHAR(30) | 否 | 人物：`portrait`/`historical`；文物：`cover`/`gallery`；新闻：`cover`/`content`；展览：`cover`/`gallery` | 后台维护 |
| `local_path` | VARCHAR(500) | 否 | `/uploads/people/...`、`/uploads/relics/...`、`/uploads/news/...` 或 `/uploads/exhibitions/...` | 系统生成 |
| `source_image_url` | VARCHAR(500) | 是 | 原始图片地址（如有） | 管理员录入 |
| `source_page_url` | VARCHAR(500) | 是 | 图片所在来源页面 URL | 管理员录入 |
| `publisher` | VARCHAR(200) | 是 | 来源机构；可明确为“课程设计本地资料” | 管理员录入 |
| `caption` | TEXT | 是 | 图片说明 | 管理员录入 |
| `identity_evidence` | TEXT | 是 | 人物身份识别依据；合影必填 | 管理员录入 |
| `person_position` | VARCHAR(100) | 是 | 合影中人物位置，如“左三” | 管理员录入 |
| `sort_order` | INT | 否 | 文物图库、新闻正文图、展览图库展示顺序 | 管理员维护 |
| `review_status` | ENUM | 否 | `pending`、`verified`、`rejected`；仅 `verified` 可被游客 API 使用 | 管理员审核 |
| `status` | TINYINT | 否 | 1 可展示，0 不展示；不等同于史料核验 | 管理员维护 |
| `created_at` | DATETIME | 否 | 创建时间 | 系统生成 |
| `updated_at` | DATETIME | 否 | 最近更新时间 | 系统生成 |

## 7. `person` — 历史人物

| 字段 | 类型 | 可为空 | 说明 | 来源 |
| --- | --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | 否 | 主键 | 系统生成 |
| `name` | VARCHAR(100) | 否 | 人物名称；允许后续新增 | 官网采集/后台维护 |
| `birth_year` | SMALLINT UNSIGNED | 是 | 出生年份 | 官网采集/后台维护 |
| `death_year` | SMALLINT UNSIGNED | 是 | 逝世年份 | 官网采集/后台维护 |
| `summary` | TEXT | 是 | 人物摘要 | 官网采集/后台维护 |
| `content` | LONGTEXT | 是 | 生平与关联资料 | 官网采集/后台维护 |
| `image` | VARCHAR(500) | 是 | 旧人物图片回退 URL；新上传资源优先读取 `media_asset` | 官网采集/后台维护 |
| `source_url` | VARCHAR(500) | 是 | 人物资料来源页 | 官网采集 |
| `status` | TINYINT | 否 | 1 正常，0 隐藏/待审核 | 后台维护 |
| `created_at` | DATETIME | 否 | 创建时间 | 系统生成 |
| `updated_at` | DATETIME | 否 | 最近更新时间 | 系统生成 |

## 8. `history_event` — 历史事件时间轴

| 字段 | 类型 | 可为空 | 说明 | 来源 |
| --- | --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | 否 | 主键 | 系统生成 |
| `year` | SMALLINT UNSIGNED | 是 | 用于时间轴排序的年份 | 官网采集/后台维护 |
| `time_text` | VARCHAR(100) | 是 | 来源原始时间文本，游客端优先展示 | 官网采集/后台维护 |
| `month` / `day` | TINYINT UNSIGNED | 是 | 仅在来源明确时保存，绝不补全 | 官网采集/后台维护 |
| `time_precision` | VARCHAR(20) | 否 | `year`、`month`、`day`、`season`、`range`、`unknown` | 后台维护 |
| `review_status` | VARCHAR(20) | 否 | `pending`、`verified`、`conflict`、`rejected` | 人工审核 |
| `is_featured` / `sort_order` | TINYINT / INT | 否 | 首页峥嵘岁月开关与顺序 | 后台维护 |
| `event_date` | DATE | 是 | 经核实的具体日期 | 官网采集/后台维护 |
| `title` | VARCHAR(200) | 否 | 事件标题 | 官网采集/后台维护 |
| `description` | TEXT | 是 | 时间轴短描述 | 官网采集/后台维护 |
| `content` | LONGTEXT | 是 | 事件详细说明 | 官网采集/后台维护 |
| `image` | VARCHAR(500) | 是 | 事件图片 URL | 官网采集/后台维护 |
| `source_url` | VARCHAR(500) | 是 | 史料或官网来源地址 | 官网采集 |
| `status` | TINYINT | 否 | 1 正常，0 隐藏/待审核 | 后台维护 |
| `created_at` | DATETIME | 否 | 创建时间 | 系统生成 |
| `updated_at` | DATETIME | 否 | 最近更新时间 | 系统生成 |

## 9. `courtyard` — 数字导览院落

| 字段 | 类型 | 可为空 | 说明 | 来源 |
| --- | --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | 否 | 主键 | 系统生成 |
| `name` | VARCHAR(100) | 否 | 院落名称，如一号院 | 官网采集/后台维护 |
| `description` | TEXT | 是 | 地图卡片短描述 | 官网采集/后台维护 |
| `content` | LONGTEXT | 是 | 院落详情 | 官网采集/后台维护 |
| `image` | VARCHAR(500) | 是 | 院落图片 URL | 官网采集/后台维护 |
| `position_x` | DECIMAL(6,2) | 是 | 平面图热点横向坐标，建议 0–100 百分比 | 后台维护 |
| `position_y` | DECIMAL(6,2) | 是 | 平面图热点纵向坐标，建议 0–100 百分比 | 后台维护 |
| `source_url` | VARCHAR(500) | 是 | 官网院落/旧址资料页 | 官网采集 |
| `status` | TINYINT | 否 | 1 正常，0 隐藏/待审核 | 后台维护 |
| `created_at` | DATETIME | 否 | 创建时间 | 系统生成 |
| `updated_at` | DATETIME | 否 | 最近更新时间 | 系统生成 |

### D11.8 院落扩展字段

| 字段 | 类型 | 可为空 | 说明 | 来源 |
| --- | --- | --- | --- | --- |
| `candidate_id` | VARCHAR(100) | 是 | 审核候选的稳定身份 | 候选资料 |
| `aliases` | VARCHAR(500) | 是 | 院落别名，以内部分隔形式保存 | 官网采集/后台维护 |
| `historical_use` / `current_use` | TEXT | 是 | 已核验历史用途与当前用途 | 官网采集/后台维护 |
| `source_name` / `evidence` | VARCHAR(200) / TEXT | 是 | 来源机构与可复查证据摘要 | 官网采集/人工审核 |
| `review_status` | VARCHAR(20) | 否 | `pending`、`verified`、`conflict`、`rejected`；与上线状态独立 | 人工审核 |
| `sort_order` | INT | 否 | 热点和院落展示顺序 | 后台维护 |

## D11.8 `digital_museum` — 七贤庄整体导览

保存七贤庄整体介绍、来源与审核/展示状态；不保存具体院落热点。导览底图以 `media_asset.entity_type=digital_museum`、`usage_type=map` 关联，未审核底图不会对游客公开。

## 10. `visit_schedule` — 预约时间段

| 字段 | 类型 | 可为空 | 说明 | 来源 |
| --- | --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | 否 | 主键 | 系统生成 |
| `visit_date` | DATE | 否 | 参观日期 | 后台维护 |
| `period` | ENUM('morning','afternoon') | 否 | 上午或下午时段 | 后台维护 |
| `capacity` | INT UNSIGNED | 否 | 时段总容量 | 后台维护 |
| `reserved_count` | INT UNSIGNED | 否 | 当前已占用名额 | 预约服务事务更新 |
| `status` | TINYINT | 否 | 1 可预约，0 停止预约 | 后台维护 |
| `created_at` | DATETIME | 否 | 创建时间 | 系统生成 |
| `updated_at` | DATETIME | 否 | 最近更新时间 | 系统生成 |

## 11. `reservation` — 预约记录

| 字段 | 类型 | 可为空 | 说明 | 来源 |
| --- | --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | 否 | 主键 | 系统生成 |
| `reservation_no` | VARCHAR(32) | 否 | 唯一预约编号，如 `XA202609100001` | 预约服务生成 |
| `name` | VARCHAR(50) | 否 | 预约人姓名 | 游客提交 |
| `phone` | VARCHAR(20) | 否 | 联系电话，用于查询和重复检测 | 游客提交 |
| `active_phone` | VARCHAR(20) 生成列 | 是 | 待确认/成功时为手机号；其他状态为 `NULL`，用于只限制有效预约 | 系统按状态计算 |
| `id_card` | CHAR(18) | 否 | 身份证号；生产阶段应加密和脱敏 | 游客提交 |
| `visit_date` | DATE | 否 | 预约参观日期；由服务端根据时段读取，不能信任客户端日期 | 预约时段 |
| `schedule_id` | BIGINT UNSIGNED | 否 | 关联 `visit_schedule.id` | 游客选择/服务校验 |
| `people_count` | INT UNSIGNED | 否 | 预约人数，必须大于 0 | 游客选择 |
| `status` | TINYINT | 否 | 0 待确认、1 成功、2 取消、3 核销、4 过期 | 预约服务/后台维护 |
| `remark` | VARCHAR(500) | 是 | 管理员备注 | 后台维护 |
| `created_at` | DATETIME | 否 | 创建时间 | 系统生成 |
| `updated_at` | DATETIME | 否 | 最近更新时间 | 系统生成 |

## 12. `feedback` — 游客留言

| 字段 | 类型 | 可为空 | 说明 | 来源 |
| --- | --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | 否 | 主键 | 系统生成 |
| `name` | VARCHAR(50) | 是 | 留言人姓名或称呼 | 游客提交 |
| `phone` | VARCHAR(20) | 是 | 联系方式；可不填写 | 游客提交 |
| `content` | TEXT | 否 | 留言内容 | 游客提交 |
| `status` | TINYINT | 否 | 0 未处理，1 已处理 | 后台维护 |
| `reply` | TEXT | 是 | 管理员回复 | 后台维护 |
| `created_at` | DATETIME | 否 | 创建时间 | 系统生成 |
| `updated_at` | DATETIME | 否 | 最近更新时间 | 系统生成 |

## 13. `visit_log` — 匿名访问日志

| 字段 | 类型 | 可为空 | 说明 | 来源 |
| --- | --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | 否 | 主键 | 系统生成 |
| `visitor_id` | VARCHAR(64) | 否 | 前端生成的匿名访客标识 | 前端生成 |
| `page_path` | VARCHAR(255) | 否 | 访问路径 | 前端路由 |
| `page_title` | VARCHAR(255) | 是 | 页面标题 | 前端路由 |
| `device_type` | VARCHAR(30) | 是 | desktop、tablet、mobile 等 | 前端/后端解析 |
| `browser` | VARCHAR(100) | 是 | 浏览器类别 | 前端/后端解析 |
| `referrer` | VARCHAR(500) | 是 | 来源页面 | 浏览器请求头 |
| `created_at` | DATETIME | 否 | 访问发生时间 | 系统生成 |

本表不保存真实 IP、手机号、身份证号。

## 14. `admin` — 后台管理员

| 字段 | 类型 | 可为空 | 说明 | 来源 |
| --- | --- | --- | --- | --- |
| `id` | BIGINT UNSIGNED | 否 | 主键 | 系统生成 |
| `username` | VARCHAR(100) | 否 | 唯一登录名 | 后台维护 |
| `display_name` | VARCHAR(100) | 是 | 管理员显示名称 | 后台维护 |
| `password_hash` | VARCHAR(255) | 否 | bcrypt/Argon2 密码哈希，禁止明文 | 管理员创建流程 |
| `role` | ENUM('admin','editor') | 否 | 管理员或内容编辑 | 后台维护 |
| `status` | TINYINT | 否 | 1 启用，0 停用 | 后台维护 |
| `created_at` | DATETIME | 否 | 创建时间 | 系统生成 |
| `updated_at` | DATETIME | 否 | 最近更新时间 | 系统生成 |

# 未来 Express 后端目录规划

本文件仅定义 D4 及之后的后端目录边界，不创建 `backend/` 目录，也不包含可运行代码。

```text
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── museum.controller.js
│   │   ├── relic.controller.js
│   │   ├── article.controller.js
│   │   ├── reservation.controller.js
│   │   └── statistics.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── museum.routes.js
│   │   ├── relic.routes.js
│   │   ├── article.routes.js
│   │   ├── reservation.routes.js
│   │   └── statistics.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── museum.service.js
│   │   ├── relic.service.js
│   │   ├── article.service.js
│   │   ├── reservation.service.js
│   │   └── statistics.service.js
│   ├── models/
│   │   ├── museum.model.js
│   │   ├── relic.model.js
│   │   ├── article.model.js
│   │   ├── reservation.model.js
│   │   └── visit-log.model.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── utils/
│   │   ├── db.js
│   │   ├── response.js
│   │   └── reservation-no.js
│   └── app.js
└── package.json
```

## 模块职责

| 模块 | 主要表 | 未来职责 |
| --- | --- | --- |
| `auth` | `admin` | 管理员认证、密码哈希校验与角色控制。 |
| `museum` | `museum`、`exhibition`、`person`、`history_event`、`courtyard` | 提供馆情、展览、历史文化与导览内容。 |
| `relic` | `relic`、`relic_category` | 提供文物列表、检索、分类和详情。 |
| `article` | `article`、`article_category` | 提供新闻列表、分类、详情和发布时间排序。 |
| `reservation` | `visit_schedule`、`reservation`、`feedback` | 在事务中完成可预约时段查询、人数校验、提交、取消与留言。 |
| `statistics` | `visit_log` | 统计按时间范围的 PV、UV 和热门页面。 |

## 分层约束

- `routes` 只定义 HTTP 路径与中间件组合。
- `controllers` 解析请求、调用服务并返回统一响应，不直接拼接 SQL。
- `services` 承载预约事务、重复预约检查、内容业务规则。
- `models` 只封装表查询和写入。
- `middleware` 承担认证、参数校验和统一错误处理。
- `utils/db.js` 在未来集中管理 MySQL 连接池；D3 不创建该文件。

前台 Vue 页面后续仅将 `src/data/` 的模拟入口换为 Axios 请求；接口层负责将数据库下划线字段转换为前端需要的驼峰字段，避免重写现有页面。

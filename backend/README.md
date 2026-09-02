# 八路军西安办事处纪念馆后端

本目录是课程设计 D4 的 Express 与 MySQL 连接基础；暂未实现业务 API。

## 1. 安装依赖

```bash
cd backend
npm install
```

## 2. 创建环境文件

复制 `.env.example` 为 `.env`，再填写本机 MySQL 的连接信息。

```powershell
Copy-Item .env.example .env
```

`DB_NAME` 必须为 `xian_memorial`，与 [../docs/init.sql](../docs/init.sql) 保持一致。

## 3. 初始化数据库

在 MySQL Workbench 或 IDEA 的数据库工具窗口中执行：

```sql
SOURCE ../docs/init.sql;
```

也可以直接打开并执行项目根目录的 `docs/init.sql`。它会创建 `xian_memorial` 数据库及 14 张表。

## 4. 导入审核资料

数据库初始化并正确配置 `.env` 后，导入 `crawler/node/output/reviewed/` 中的馆情、文物与展览资料：

```bash
npm run seed:official
```

脚本可重复执行：文物优先按 `source_api_id` 更新；馆情按来源 URL 更新；展览按来源 URL 与正文内容更新。它不会导入人物、历史事件、院落或预约占位数据。

## 5. 启动

```bash
npm run dev
```

生产式本地启动可使用：

```bash
npm start
```

## 6. 测试接口

- `GET http://localhost:3000/api/health`：只验证 Express 服务。
- `GET http://localhost:3000/api/test-db`：执行 `SELECT 1 AS ok`，验证 MySQL 连接。
- `GET http://localhost:3000/api/museum`：馆情资料。
- `GET http://localhost:3000/api/relics?page=1&pageSize=9&keyword=`：文物分页与名称搜索。
- `GET http://localhost:3000/api/relics/:id`：文物详情。
- `GET http://localhost:3000/api/exhibitions?page=1&pageSize=9`：展览分页。
- `GET http://localhost:3000/api/exhibitions/:id`：展览详情。

数据库未初始化、MySQL 未启动或 `.env` 配置错误时，`/api/test-db` 会返回通用 500 响应，具体错误只写入后端终端。

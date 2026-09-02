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

## 4. 启动

```bash
npm run dev
```

生产式本地启动可使用：

```bash
npm start
```

## 5. 测试接口

- `GET http://localhost:3000/api/health`：只验证 Express 服务。
- `GET http://localhost:3000/api/test-db`：执行 `SELECT 1 AS ok`，验证 MySQL 连接。

数据库未初始化、MySQL 未启动或 `.env` 配置错误时，`/api/test-db` 会返回通用 500 响应，具体错误只写入后端终端。

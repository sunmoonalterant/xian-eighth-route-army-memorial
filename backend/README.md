# 八路军西安办事处纪念馆后端

本目录提供课程设计的 Express + MySQL 内容接口与预约后端核心接口。

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

## 6. 初始化课程设计预约时段

首次进入 D7 时，先执行预约约束迁移，再生成未来 21 天的课程设计演示时段。每个非周一日期生成上午、下午两个时段，容量均为 **100 人（模拟值，不代表纪念馆官方限额）**。

```bash
node scripts/migrateReservationConstraints.js
npm run seed:visit-schedules
```

两个脚本均可安全重复执行。迁移会将原本“手机号 + 日期”的宽泛唯一约束替换为只约束待确认/成功预约的生成列索引，因此已取消预约可再次预约。

## 7. 测试接口

- `GET http://localhost:3000/api/health`：只验证 Express 服务。
- `GET http://localhost:3000/api/test-db`：执行 `SELECT 1 AS ok`，验证 MySQL 连接。
- `GET http://localhost:3000/api/museum`：馆情资料。
- `GET http://localhost:3000/api/relics?page=1&pageSize=9&keyword=`：文物分页与名称搜索。
- `GET http://localhost:3000/api/relics/:id`：文物详情。
- `GET http://localhost:3000/api/exhibitions?page=1&pageSize=9`：展览分页。
- `GET http://localhost:3000/api/exhibitions/:id`：展览详情。
- `GET http://localhost:3000/api/visit-schedules?date=YYYY-MM-DD`：当天可预约时段与后端计算的剩余名额。
- `POST http://localhost:3000/api/reservations`：创建预约，使用事务锁定时段并扣减名额。
- `GET http://localhost:3000/api/reservations/query?reservationNo=...&phone=...`：按预约编号与手机号查询，返回脱敏联系方式。
- `POST http://localhost:3000/api/reservations/:reservationNo/cancel`：传入 `phone` 取消预约并在事务内释放名额。

数据库未初始化、MySQL 未启动或 `.env` 配置错误时，`/api/test-db` 会返回通用 500 响应，具体错误只写入后端终端。

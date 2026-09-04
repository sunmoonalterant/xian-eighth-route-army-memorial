# D11.5C 人物资料正式化报告

## 人工授权与 Reviewed

- 授权人数：25（`PEOPLE-001` 至 `PEOPLE-007`、`PEOPLE-009` 至 `PEOPLE-026`）。
- 正式数据：[reviewed people](../crawler/node/output/reviewed/people.json)，实际 25 条。
- 每条均为 `verified: true`、`reviewStatus: "verified"`，并保留原始身份、关系、关键细节与来源。

## MySQL

- 第一次导入：新增 25 条。
- 幂等复验：dry-run 为新增 0、更新 25；重复正式执行为新增 0、更新 25。
- 当前 `person` 总数：25；公开人物：25；`image IS NULL`：25。

## 游客端

- `GET /api/people`、`GET /api/people/:id` 已接入。
- `/people`、`/person/:id`、首页人物入口及搜索人物已恢复。
- `/history` 与 `/digital-museum` 未修改，仍保持资料整理状态。

## 图片

- 本轮下载：0。
- 所有人物正式图片：`null`；页面使用中性剪影。
- 图片继续采用独立审核与本地化流程。

## 未批准人物

- PENDING：周子健、冼星海、王浩礼、高万英。
- REJECT：叶季壮、李华。

## 验收记录

- 前端构建：通过。
- 具体自动测试与 Git 状态以本轮最终命令输出为准。

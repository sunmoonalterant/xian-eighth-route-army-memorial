# 图片本地化报告

- 执行时间：2026-09-03T02:48:53.654Z
- 发现远程封面：17
- 成功本地化：17
- 下载或更新失败：0
- 保留原地址：0

本次只处理 museum、relic、article、exhibition 四张表中已使用的远程封面。成功记录的数据库 `cover_image` 已更新为 `/images/...`，`source_url` 保持官网资料页面地址不变。文件位于 `frontend/public/images/`，游客端与本地 fallback 使用同一公开路径。失败记录未修改数据库中的原始封面地址。

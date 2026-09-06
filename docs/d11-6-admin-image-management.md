# D11.6 统一后台内容图片管理

## 数据库与存储

- 执行迁移：`cd backend && npm run migrate:media-assets`。现有 `media_asset` 的 `entity_type` 与 `usage_type` 为 `VARCHAR`，可直接用业务白名单扩展，不需要 ALTER TABLE。
- 一张资源通过 `entity_type + entity_id` 关联 `person`、`relic`、`article` 或 `exhibition`。实体存在性由参数化查询校验，不创建重复图片表。
- 图片二进制只写入 `backend/uploads/people/`、`backend/uploads/relics/`、`backend/uploads/news/`、`backend/uploads/exhibitions/`，由 Express `/uploads/...` 静态提供；MySQL 仅保存路径与审核元数据。
- 旧 `person.image`、`relic.cover_image`、`article.cover_image`、`exhibition.cover_image` 和前端 `/images/...` 静态资源不会迁移或物理删除；没有新公开资源时继续回退。

## 管理员图片 API

以下端点均要求 `requireAdminAuth`，上传字段名为 `image`：

- `GET|POST /api/admin/people/:id/images`、`PUT|DELETE /api/admin/people/:id/images/:imageId`
- `GET|POST /api/admin/relics/:id/images`、`PUT|DELETE /api/admin/relics/:id/images/:imageId`
- `GET|POST /api/admin/articles/:id/images`、`PUT|DELETE /api/admin/articles/:id/images/:imageId`
- `GET|POST /api/admin/exhibitions/:id/images`、`PUT|DELETE /api/admin/exhibitions/:id/images/:imageId`

用途受服务端白名单控制：人物为 `portrait`、`historical`；文物与展览为 `cover`、`gallery`；新闻为 `cover`、`content`。`cover` 为展示中时，同一文物、新闻或展览此前展示中的上传封面自动隐藏，保证只有一个当前公开封面。

元数据包括 `publisher`、`source_image_url`、`source_page_url`、`caption`、`sort_order`、`review_status`、`status`。人物还保留身份依据与图中位置。来源没有外部 URL 时应明确填写“课程设计本地资料”，不得伪造官方来源。

## 安全与删除规则

- 只允许 jpg/jpeg/png/webp，最大 8MB；校验原扩展名、请求 MIME 和二进制签名。
- 最终文件名由服务端随机生成，绝不采用用户文件名作为磁盘路径。
- 删除时先校验图片归属实体及 ID；只有 `/uploads/...` 下、未被其他记录引用的文件才会物理删除。
- 路径校验限定四个上传子目录并拒绝路径穿越。`frontend/public/images/` 的旧图片只会失去引用，绝不由后台删除。

## 游客端契约

- 游客端只接收 `review_status='verified' AND status=1` 的 `media_asset`。
- `GET /api/relics` 与 `GET /api/relics/:id` 返回优先 `coverImage` 与 `galleryImages: [{ url, caption }]`。
- `GET /api/articles` 与 `GET /api/articles/:id` 返回优先 `coverImage`；详情额外返回 `contentImages: [{ url, caption }]`。
- `GET /api/exhibitions` 与详情继续返回优先封面和 `galleryImages`；人物规则不变。
- 前端 `toDisplayImageUrl()` 保留 `/images/...` 和外部 URL，且将 `/uploads/...` 指向 API 服务来源。没有图库/正文图时，详情页不显示图片区块。

## 验收记录

- 真实 MySQL 临时验收：对既有文物和新闻分别上传 1 张封面、2 张关联图片；先以 `pending` 验证游客 API 不返回，再改为 `verified + status=1` 验证封面和按 `sort_order` 排列的两张图片返回。
- 验收后已删除 6 条临时 `media_asset` 记录及其上传文件；按 `entity_type` 的剩余记录统计为空，不保留临时资料。
- 后端与前端自动化测试、前端生产构建结果以本轮终验报告为准。

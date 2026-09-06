# D11.8 数字纪念馆、院落审核与后台管理

## 数据边界

- `digital_museum` 是七贤庄整体介绍的独立单例，不作为具体院落或热点。
- `courtyard` 只保存可审核的具体院落；游客查询始终限定 `review_status=verified AND status=1`。
- `position_x`、`position_y` 是 0–100 的前端百分比布局值，不是 GPS、测绘或历史地理坐标。
- 本轮人工批准 4 条 A 级官网候选：一号、三号、四号、七号院；二、六、八号院没有被补造或发布。

## 后台与媒体

- `/admin/digital-museum` 分别维护七贤庄整体、导览底图、院落和热点。
- 底图使用 `media_asset(digital_museum)` 的 `map` 用途；无已审核底图时，游客端明确标示“课程设计导览示意图，非测绘地图”。
- 院落图片复用 `media_asset(courtyard)`：`cover`、`historical`、`building`、`gallery`；只有已核验且展示中的图片可公开。
- 上传目录为 `backend/uploads/courtyards/` 与 `backend/uploads/digital-museum/`，继续使用既有 MIME、扩展名、二进制签名和 8MB 限制。

## 数据导入与 API

- `backend/scripts/approveCourtyardCandidates.js` 生成 `crawler/node/output/reviewed/courtyards.json`。
- `backend/scripts/seedReviewedCourtyards.js` 只读取 reviewed 文件，并通过 `candidate_id` 幂等导入。
- 公共 API：`GET /api/digital-museum`、`GET /api/courtyards`、`GET /api/courtyards/:id`。
- 后台 API：`/api/admin/digital-museum`、`/api/admin/courtyards` 及两者的统一图片资源接口。

## 审核流程

候选资料 → 后台/seed 录入 pending → 人工审核 verified → 设置 `status=1` 与百分比热点 → 游客端可见。逻辑删除只会设为 `status=0`，不会物理删除史料记录。

# D11.7 历史事件审核与发布

- `history_event` 通过最小迁移增加候选稳定标识、`time_text`、月/日、`time_precision`、来源机构、证据摘要、审核状态、首页精选与排序字段。
- 时间只按来源精度保存：年月日仅在来源明确到日时写入 `event_date`；年、月、季节和范围不补全日期。
- 游客 API `/api/history-events` 仅返回 `review_status=verified AND status=1`。`featured=true` 额外限制首页精选。
- 首批正式资料来自 `candidates/history-events.json` 中经人工确认的 12 条 A 级官网候选。旧 `review-work/history-events-review.json` 的 23 条早期工作库候选与本批候选 ID 独立，仍保持 `pending/conflict`，不入库、不公开。
- 后台 `/admin/history` 可维护审核、展示、首页开关、来源、证据与图片；图片使用 `media_asset(history_event)` 和 `uploads/history/`。

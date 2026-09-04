# D11.5B 历史人物图片审核

本清单只审核人物图片候选，不改变 `people-review.json` 中的人物文字审核建议。所有候选均未获下载授权；未下载图片、未修改 Excel、MySQL、游客端或正式 `reviewed/` 数据。

## 审核原则

- 只有可靠来源页同时明确图片主体与人物身份，才可标记 `confirmed` 并建议作为头像。
- 建筑、旧址、手迹、题字与人物相关文物不是人物头像。合影若未明确人物身份或位置，最多保留为不推荐的内容插图线索。
- 搜索引擎仅可用于发现原页面，不能作为图片来源；本批记录未登记搜索引擎缩略图。

## 人物图片审核清单

| ID | 人物 | 文字审核建议 | 人物照片状态 | 来源机构 | 身份明确 | 建议用途 |
| --- | --- | --- | --- | --- | --- | --- |
| PEOPLE-001 | 周恩来| confirmed    | APPROVE |
| 党史频道/人民网 + 官网展馆介绍 | 否 | notRecommended |
| PEOPLE-002 | 朱德 | APPROVE | confirmed | 共产党员网 / 中共一大会址纪念馆藏（Excel 图片线索，未核验对应图片页） | 否 | notRecommended |
| PEOPLE-003 | 刘少奇 | APPROVE | missing | - | 否 | notRecommended |
| PEOPLE-004 | 叶剑英 | APPROVE | missing | 官网文物页 + 秦风网 | 否 | relatedArtifact |
| PEOPLE-005 | 林伯渠 | APPROVE | missing | 官网文物页 + 秦风网 | 否 | relatedArtifact |
| PEOPLE-006 | 董必武 | APPROVE | missing | - | 否 | notRecommended |
| PEOPLE-007 | 伍云甫 | APPROVE | missing | 党史频道/人民网 + 国际在线 | 否 | relatedArtifact |
| PEOPLE-008 | 周子健 | PENDING | missing | - | 否 | notRecommended |
| PEOPLE-009 | 宣侠父 | APPROVE | confirmed | 八路军西安办事处纪念馆官网（Excel 图片线索，未核验身份说明） | 否 | contentImage |
| PEOPLE-010 | 李克农 | APPROVE | missing | - | 否 | notRecommended |
| PEOPLE-011 | 刘鼎 | APPROVE | missing | - | 否 | notRecommended |
| PEOPLE-012 | 冯海伯（赫伯特·温施） | APPROVE | missing | - | 否 | notRecommended |
| PEOPLE-013 | 涂作潮 | APPROVE | missing | - | 否 | notRecommended |
| PEOPLE-014 | 白求恩 | APPROVE | confirmed | 人民网党史频道（Excel 图片线索，未核验合影身份位置） | 否 | contentImage |
| PEOPLE-015 | 柯棣华 | APPROVE | confirmed | 人民网党史频道（Excel 图片线索，未核验合影身份位置） | 否 | contentImage |
| PEOPLE-016 | 埃德加·斯诺 | APPROVE | confirmed | 新华书店总店 / 新华出版社（Excel 图片线索，未核验对应人像页） | 否 | notRecommended |
| PEOPLE-017 | 海伦·福斯特·斯诺 | APPROVE | confirmed | 八路军西安办事处纪念馆官网（Excel 图片线索，未核验合影身份位置） | 否 | contentImage |
| PEOPLE-018 | 史沫特莱 | APPROVE | confirmed | 人民网党史频道（Excel 图片线索，未核验对应肖像页） | 否 | notRecommended |
| PEOPLE-019 | 陈嘉庚 | APPROVE | missing | - | 否 | notRecommended |
| PEOPLE-020 | 邓颖超 | APPROVE | missing | - | 否 | notRecommended |
| PEOPLE-021 | 康克清 | APPROVE | missing | - | 否 | notRecommended |
| PEOPLE-022 | 博古（秦邦宪） | APPROVE | missing | - | 否 | notRecommended |
| PEOPLE-023 | 彭德怀 | APPROVE | missing | - | 否 | notRecommended |
| PEOPLE-024 | 邓小平 | APPROVE | missing | - | 否 | notRecommended |
| PEOPLE-025 | 陈赓 | APPROVE | missing | - | 否 | notRecommended |
| PEOPLE-026 | 陈云 | APPROVE | missing | - | 否 | notRecommended |
| PEOPLE-027 | 冼星海 | PENDING | missing | - | 否 | notRecommended |
| PEOPLE-028 | 王浩礼 | PENDING | missing | - | 否 | notRecommended |
| PEOPLE-029 | 高万英 | PENDING | missing | - | 否 | notRecommended |
| PEOPLE-030 | 叶季壮 | REJECT | missing | - | 否 | notRecommended |
| PEOPLE-031 | 李华 | REJECT | missing | - | 否 | notRecommended |

## 统计

- confirmed：0
- confirmed：7
- missing：24
- rejected：0

- 已确认人物：无
- 待确认人物：朱德、宣侠父、白求恩、柯棣华、埃德加·斯诺、海伦·福斯特·斯诺、史沫特莱
- 缺失人物：周恩来、刘少奇、叶剑英、林伯渠、董必武、伍云甫、周子健、李克农、刘鼎、冯海伯（赫伯特·温施）、涂作潮、陈嘉庚、邓颖超、康克清、博古（秦邦宪）、彭德怀、邓小平、陈赓、陈云、冼星海、王浩礼、高万英、叶季壮、李华
- 排除人物：无

## 后续边界

本轮 `people-image-localization-candidates.json` 仅能接收 `confirmed` 且 `recommendedForUse: true` 的候选。即使进入清单，`approvedForDownload` 仍必须为 `false`，等待人工逐条批准后才可进入 D11.5C 本地化。

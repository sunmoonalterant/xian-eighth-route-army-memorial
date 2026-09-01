# 公开资料采集与结构化整理工具设计

## 目标与边界

为《八路军西安办事处纪念馆数字宣传、预约与运营管理系统》新增一个独立的 `crawler/` 子项目。它仅辅助采集无需登录即可访问、且允许自动访问的公开资料，并把内容整理为待人工审核的 JSON 数据。

工具不修改 `frontend/`，不接入正式数据库，不发布资料，不绕过访问限制，不采集个人敏感信息，也不删除原始来源记录。所有输出默认 `verified: false`、`reviewStatus: "pending"`。

本阶段只建立通用、低频、配置驱动的框架；不内置真实网站 URL，不猜测站点 CSS 选择器，也不使用 Playwright。

## 架构与目录职责

`crawler/config` 保存运行设置和来源样例；实际来源配置由使用者基于样例创建，避免 URL 硬编码。

`crawler/utils` 统一处理低频 HTTP 请求、请求重试、robots.txt 检查、日志、去重和安全文件读写。HTTP 层使用合理 User-Agent、超时、最多三次重试及每次一至三秒的随机等待；403、429、登录页、验证码页或 robots 禁止页均会被记录并跳过，不作规避。

`crawler/parsers` 提供页面正文提取、文本清洗和日期解析。正文提取会删除脚本、样式、导航和页脚等噪声，同时保留标题、段落与图片说明；无法明确识别的字段留空，不进行事实推断。

`crawler/models` 定义统一的基础数据模型，以及 history、person、relic、news、exhibition、visit 的扩展字段。模型还包含 `sourceLevel`、`conflict` 和 `conflictNotes`，但不会自动裁决来源冲突或将低等级来源认定为事实。

`crawler/spiders` 包含可复用的 `BaseSpider` 与八种按内容类型划分的 Spider：museum、history、relic、person、exhibition、news、courtyard、visit。Spider 共用请求和保存逻辑；没有针对站点的解析规则时，以保守的通用 HTML 提取结果作为待审核草稿。

`crawler/main.py` 提供 `crawl`、按 `--type` 过滤采集、`stats` 和 `review-status` 命令。无可用来源时给出可操作的提示，而非抛出复杂异常。

## 数据流

1. 读取已启用的来源配置，按可选内容类型筛选。
2. 每个 URL 先检查 robots 许可，再经统一 HTTP 客户端低频获取。
3. Spider 提取列表链接或直接解析详情页，并经清洗器生成内容与图片元数据。
4. 模型补齐来源名称、URL、域名、采集时间、默认审核状态和类型扩展字段。
5. 去重器先以 `sourceUrl` 去重；URL 不同时再以 `title + publishedAt` 的哈希辅助去重。不同来源的冲突记录会保留，而非自动覆盖。
6. 结果追加到 `output/raw/` 的按类型 JSON 和汇总 `all.json`；图片元数据单独保存到 `images/metadata/`。`output/reviewed/` 只供人工处理后的文件存放，采集过程绝不覆盖它。

## 输出与人工审核

原始文件使用 UTF-8 和 `ensure_ascii=False`，按类型生成 museum、history、relics、people、exhibitions、news、courtyards、visit 文件，并生成统一汇总文件。`stats` 汇总各类型采集数量；`review-status` 同时读取 raw 和 reviewed 数据，报告 pending、verified、rejected 数量。

图片仅保存 URL、页面 URL、来源名称、alt、caption 及 `downloaded: false`。设置中保留 `download_images = false`，本阶段不实现自动批量下载。

## 错误处理与日志

所有请求 URL、采集时间、状态码、解析结果、跳过原因和异常写入 `output/logs/`，不写入无关个人信息。单页失败不会中断其他来源；网络错误仅在有限重试后跳过。来源列表、robots 或页面访问失败时会给出可读日志信息。

## 验收与测试

实现完成后，使用无真实站点 URL 的样例配置验证无来源提示，并使用一个使用者许可的简单公开测试页面或后续提供的真实来源验证：JSON 生成、来源字段、默认审核状态、日志记录、URL 去重和命令行统计。依赖限定为 `requests`、`beautifulsoup4` 和 `lxml`；Playwright 保持未使用状态。

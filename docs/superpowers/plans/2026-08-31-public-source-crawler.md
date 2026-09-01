# 公开资料采集与结构化整理工具 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建独立、合规的 Python 爬虫框架，将公开资料保存为待人工审核的结构化 JSON。

**Architecture:** 配置驱动的入口筛选来源和内容类型；各 Spider 共享 BaseSpider、低频 HTTP、robots 检查、通用解析、去重与保存能力。输出仅为 JSON，采集器绝不写入或覆盖 reviewed 数据。

**Tech Stack:** Python 3 标准库、requests、Beautiful Soup 4、lxml、unittest。

**Spec:** `docs/superpowers/specs/2026-08-31-crawler-design.md`

## Global Constraints

- 只创建或修改 `crawler/` 与它的测试，绝不编辑 `frontend/`、`backend/` 或 `database/`。
- 运行时第三方依赖只能是 `requests`、`beautifulsoup4`、`lxml`；本阶段不使用 Playwright。
- 网站 URL 只写在 JSON 配置，不硬编码在 Python 中；示例来源必须禁用。
- 不规避登录、验证码、付费墙、robots、403、429 或其他访问限制；User-Agent 合理、超时有限、最多三次尝试且每次请求随机等待 1–3 秒。
- 所有条目默认 `verified: false`、`reviewStatus: "pending"`，保留来源 URL、名称、域名与采集时间；无明确资料的历史字段留空。
- 图片仅保存 URL 和元数据；`download_images` 默认为 `false`，不实现批量下载。
- JSON 使用 UTF-8 与 `ensure_ascii=False`；采集器只写 `output/raw/`，绝不写 `output/reviewed/`。

## File structure and interfaces

- `crawler/config/settings.py`: 路径、八种内容类型、原始文件名、HTTP 默认值和 `DOWNLOAD_IMAGES = False`。
- `crawler/config/sources.example.json`: 已禁用的来源结构样例。
- `crawler/models/schemas.py`: `build_record(content_type, source, page_url, extracted) -> dict`，补齐基础字段和类型扩展字段。
- `crawler/parsers/{text_cleaner,date_parser,common}.py`: `clean_text`、`clean_html`、`parse_date` 与 `extract_page`，清理噪声并保守解析公开 HTML。
- `crawler/utils/{logger,http,deduplicate,file_utils}.py`: 日志、限速/robots HTTP、去重和 JSON 文件操作。
- `crawler/spiders/base_spider.py`: `BaseSpider` 的 `fetch`、`parse_list`、`parse_detail`、`normalize_url`、`save_result`、`sleep_between_requests`、`handle_error` 和 `run`。
- `crawler/spiders/*_spider.py`: museum、history、relic、person、exhibition、news、courtyard、visit 的薄子类。
- `crawler/main.py`: `crawl [--type]`、`stats`、`review-status` 的 argparse 入口。
- `crawler/tests/`: 基于 unittest、临时目录和 mock/fixture HTML 的离线测试。

### Task 1: Create configuration, schemas, and generic parsers

**Files:**
- Create: `crawler/requirements.txt`, `crawler/config/settings.py`, `crawler/config/sources.example.json`
- Create: `crawler/models/__init__.py`, `crawler/models/schemas.py`
- Create: `crawler/parsers/__init__.py`, `crawler/parsers/text_cleaner.py`, `crawler/parsers/date_parser.py`, `crawler/parsers/common.py`
- Create: `crawler/tests/__init__.py`, `crawler/tests/test_schemas_and_parsers.py`

**Interfaces:**
- Produces: `build_record(content_type: str, source: dict, page_url: str, extracted: dict) -> dict`.
- Produces: `clean_text(value: str) -> str`, `clean_html(soup) -> str`, `parse_date(value: str) -> str`, `extract_page(html: str, page_url: str) -> dict`.

- [ ] **Step 1: Write failing tests for safe defaults and HTML cleanup**

```python
def test_history_record_has_safe_defaults(self):
    item = build_record("history", {"name": "公开来源"}, "https://example.test/a", {"title": "事件", "content": "正文"})
    self.assertFalse(item["verified"])
    self.assertEqual("pending", item["reviewStatus"])
    self.assertEqual("", item["year"])
    self.assertEqual("example.test", item["sourceDomain"])

def test_extract_page_discards_navigation_and_keeps_caption(self):
    data = extract_page(FIXTURE_HTML, "https://example.test/a")
    self.assertNotIn("站点导航", data["content"])
    self.assertIn("正文第一段", data["content"])
    self.assertEqual("图片说明", data["images"][0]["caption"])
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m unittest crawler.tests.test_schemas_and_parsers -v`

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement the smallest model and parser set**

Create all eight type schemas. Base schema includes every required source/review field, UUID, UTC ISO retrieval time, source domain, `sourceLevel`, `conflict: false` and `conflictNotes: ""`. Add extensions only for history, person, relic, news, exhibition and visit. Remove `script`, `style`, `nav`, `footer`, `header`, `aside` and forms; preserve visible title, paragraphs, image `src`/`alt`/caption. Parse dates only when explicit; never infer facts.

- [ ] **Step 4: Run the test to verify it passes**

Run: `python -m unittest crawler.tests.test_schemas_and_parsers -v`

Expected: PASS.

- [ ] **Step 5: Commit the parser foundation**

```bash
git add crawler/config crawler/models crawler/parsers crawler/tests/test_schemas_and_parsers.py crawler/requirements.txt
git commit -m "feat: add crawler schemas and parsers"
```

### Task 2: Implement compliant utilities

**Files:**
- Create: `crawler/utils/__init__.py`, `crawler/utils/file_utils.py`, `crawler/utils/deduplicate.py`, `crawler/utils/logger.py`, `crawler/utils/http.py`
- Create: `crawler/tests/test_utils.py`

**Interfaces:**
- Produces: `append_unique_json(path, item) -> bool`, `write_image_metadata(items) -> None`, `record_key(record) -> str`, `is_duplicate(record, known_keys) -> bool`.
- Produces: `SafeHttpClient.fetch(url: str) -> str | None`.

- [ ] **Step 1: Write failing de-duplication and blocked-request tests**

```python
def test_same_source_url_is_not_written_twice(self):
    self.assertTrue(append_unique_json(self.raw_file, {"sourceUrl": "https://a.test/1", "title": "A", "publishedAt": ""}))
    self.assertFalse(append_unique_json(self.raw_file, {"sourceUrl": "https://a.test/1", "title": "B", "publishedAt": ""}))

def test_403_is_skipped_without_retry_or_bypass(self):
    client = SafeHttpClient(session=self.forbidden_session, sleep=lambda _: None)
    self.assertIsNone(client.fetch("https://example.test/blocked"))
    self.assertEqual(1, self.forbidden_session.get.call_count)
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m unittest crawler.tests.test_utils -v`

Expected: FAIL because utility modules do not exist.

- [ ] **Step 3: Implement fail-closed utilities**

Use `urllib.robotparser` against each site’s `/robots.txt`; a failed or disallowed robots check skips and logs the page. Before allowed requests, sleep randomly 1–3 seconds. Retry only timeout/connection/5xx failures at most three times; return `None` for 403, 429, login or CAPTCHA patterns. Use source URL key first, then SHA-256 of `title + "|" + publishedAt`. Read/write JSON atomically in UTF-8, create raw/log/metadata directories, and make every write target reject `reviewed` paths.

- [ ] **Step 4: Run the test to verify it passes**

Run: `python -m unittest crawler.tests.test_utils -v`

Expected: PASS.

- [ ] **Step 5: Commit the utility layer**

```bash
git add crawler/utils crawler/tests/test_utils.py
git commit -m "feat: add safe crawler utilities"
```

### Task 3: Implement BaseSpider and typed spiders

**Files:**
- Create: `crawler/spiders/__init__.py`, `crawler/spiders/base_spider.py`
- Create: `crawler/spiders/museum_spider.py`, `crawler/spiders/news_spider.py`, `crawler/spiders/history_spider.py`, `crawler/spiders/person_spider.py`, `crawler/spiders/relic_spider.py`, `crawler/spiders/exhibition_spider.py`, `crawler/spiders/courtyard_spider.py`, `crawler/spiders/visit_spider.py`
- Create: `crawler/tests/test_spiders.py`

**Interfaces:**
- Consumes: `SafeHttpClient`, `extract_page`, `build_record`, `append_unique_json`.
- Produces: `BaseSpider.run() -> int` and required public methods named in the specification.

- [ ] **Step 1: Write failing typed-spider tests**

```python
def test_news_spider_writes_one_unverified_record(self):
    spider = NewsSpider(SOURCE, FakeClient({SOURCE["listUrls"][0]: DETAIL_HTML}), self.output_root)
    self.assertEqual(1, spider.run())
    item = json.loads((self.output_root / "raw" / "news.json").read_text(encoding="utf-8"))[0]
    self.assertFalse(item["verified"])
    self.assertEqual("pending", item["reviewStatus"])

def test_normalize_url_accepts_only_http_urls(self):
    self.assertIsNone(self.spider.normalize_url("javascript:void(0)", "https://example.test/list"))
    self.assertEqual("https://example.test/a", self.spider.normalize_url("/a", "https://example.test/list"))
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m unittest crawler.tests.test_spiders -v`

Expected: FAIL because spider modules do not exist.

- [ ] **Step 3: Implement reusable flow with conservative coverage**

`run` fetches configured `listUrls`, treats each one as a single detail page unless a future explicit parser overrides `parse_list`, extracts it, builds a record, de-duplicates and saves it. Never discover/crawl arbitrary links. Create eight thin subclasses that set only `content_type`. Save type files and `all.json`; store image metadata with `downloaded: false`. Errors are logged and the next configured page continues.

- [ ] **Step 4: Run the test to verify it passes**

Run: `python -m unittest crawler.tests.test_spiders -v`

Expected: PASS.

- [ ] **Step 5: Commit the spider layer**

```bash
git add crawler/spiders crawler/tests/test_spiders.py
git commit -m "feat: add typed crawler spiders"
```

### Task 4: Implement CLI, reporting, documentation and full fixture verification

**Files:**
- Create: `crawler/main.py`, `crawler/README.md`, `crawler/tests/test_main.py`, `crawler/tests/test_end_to_end.py`
- Modify: `crawler/config/sources.example.json` only if its documented schema needs correction.

**Interfaces:**
- Consumes: `python crawler/main.py crawl [--type TYPE]`, `stats`, and `review-status`.
- Produces: a friendly zero-exit message for missing/no enabled configuration and count reports for raw/reviewed files.

- [ ] **Step 1: Write failing command and end-to-end tests**

```python
def test_crawl_without_enabled_sources_is_friendly(self):
    result = run_main(["crawl"], config_path=self.config_path, output_root=self.root)
    self.assertEqual(0, result.exit_code)
    self.assertIn("没有可采集的已启用来源", result.message)

def test_fixture_run_creates_json_log_and_image_metadata(self):
    result = run_main(["crawl", "--type", "news"], config_path=self.enabled_config, output_root=self.root, client=FixtureClient())
    self.assertEqual(0, result.exit_code)
    self.assertTrue((self.root / "raw" / "news.json").exists())
    self.assertTrue((self.root / "raw" / "all.json").exists())
    self.assertTrue(any((self.root / "logs").iterdir()))
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m unittest crawler.tests.test_main crawler.tests.test_end_to_end -v`

Expected: FAIL because command functions do not exist.

- [ ] **Step 3: Implement argparse, reports and README**

Validate `--type` against exactly eight supported values; read `config/sources.json` if created by the user, otherwise explain how to copy the disabled example. `stats` counts raw entries by type. `review-status` counts `pending`, `verified`, and `rejected` across raw/reviewed files without changing them. README documents purpose, `pip install -r requirements.txt`, configuration, every command, output directories, human review, image policy, compliance, new Spider steps, absence of Playwright, and that results are not verified historical facts.

- [ ] **Step 4: Run all offline tests and smoke commands**

Run: `python -m unittest discover -s crawler/tests -v; python crawler/main.py --help; python crawler/main.py crawl`

Expected: all tests PASS with no real-network request; help lists commands; crawl prints a friendly configuration message.

- [ ] **Step 5: Inspect generated JSON and commit**

Run: `python -m json.tool crawler/output/raw/all.json; git status --short`

Expected: `all.json` parses and no reviewed file is changed.

```bash
git add crawler
git commit -m "feat: add compliant public-source crawler framework"
```

## Plan self-review

- **Spec coverage:** Tasks 1–4 implement isolation, eight types, required schemas, source configuration, compliant low-rate access, robots checks, text/image handling, source preservation, raw/reviewed separation, de-duplication, logs, CLI, reports, README and offline verification. They deliberately exclude real site rules and Playwright.
- **Placeholder scan:** No unresolved placeholders, deferred error handling or unspecified test steps remain.
- **Type consistency:** All task consumers use `build_record`, `extract_page`, `SafeHttpClient.fetch`, `BaseSpider.run`, and `run_main` under the same stated names and signatures.

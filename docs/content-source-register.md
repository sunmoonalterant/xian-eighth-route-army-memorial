# D11.5 内容来源登记表

登记日期：2026-09-04。下表记录当前已使用或本轮候选所依赖的公开来源。A/B/C 级表示来源质量；不代表页面内容已经完成史料人工核验。

| sourceId | sourceName | sourceLevel | sourceUrl | publisher | pageTitle | retrievedAt | applicableDomain | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| xabb-museum-profile | 八路军西安办事处纪念馆官网展馆介绍 | A | http://www.xabb.org.cn/exhibitionHall/2.html | 八路军西安办事处纪念馆 | 八路军西安办事处纪念馆-展馆介绍 | 2026-09-04T09:51:52+08:00 | museum, people, history, courtyard | reviewed 采集记录保存了馆情、人物留驻、机构沿革及院落开放文字；本轮直接 HTML 可访问（200），但未静态呈现该批文字，候选须人工复查。 |
| xabb-relic-collection | 八路军西安办事处纪念馆官网馆藏文物栏目 | A | http://www.xabb.org.cn/relics/6.html | 八路军西安办事处纪念馆 | 八路军西安办事处纪念馆-展馆介绍 | 2026-09-04T09:51:52+08:00 | relic | reviewed 数据中 sourceApiId 50—58 均指向该栏目；页面可访问（200），栏目标题含“馆藏文物”，详情映射需人工复查。 |
| xabb-display | 八路军西安办事处纪念馆官网陈列展览栏目 | A | http://www.xabb.org.cn/display/4.html | 八路军西安办事处纪念馆 | 八路军西安办事处纪念馆-展馆介绍 | 2026-09-04T09:51:52+08:00 | exhibition, courtyard | reviewed 数据 sourceApiId 8、13、14 指向该栏目；页面可访问（200），当前静态 HTML 未显式呈现院落文字。 |
| xabb-visit-service | 八路军西安办事处纪念馆官网参观服务栏目 | A | http://www.xabb.org.cn/visitService/9.html | 八路军西安办事处纪念馆 | 八路军西安办事处纪念馆-展馆介绍 | 2026-09-04T09:51:52+08:00 | visit | reviewed 记录保存开放、闭馆、交通及预约说明；页面可访问（200），当前静态 HTML 未复现该文字，故所有易变信息待人工确认。 |
| xabb-culture-info | 八路军西安办事处纪念馆官网文化资讯栏目 | A | http://www.xabb.org.cn/cultureInfo/3.html | 八路军西安办事处纪念馆 | 八路军西安办事处纪念馆-展馆介绍 | 2026-09-04T09:51:52+08:00 | news | `officialNews.js` 的 5 条资料由此栏目和稳定文章参数整理；栏目页面可访问（200），当期静态 HTML未显示这 5 条旧记录。 |
| xabb-site-protection | 八路军西安办事处纪念馆官网旧址保护资料 | A | http://www.xabb.org.cn/siteProtection/8.html | 八路军西安办事处纪念馆 | 采集记录标题：八路军西安办事处纪念馆旧址维修保护工作 | 2026-09-01T10:42:00+08:00 | courtyard, museum | 仅支持泛旧址维修保护事实；不支持把图像或文字归属至一号、三号、四号或七号院。 |

## 使用规则

- 来源级别 A 可作为候选的主要证据；本表当前没有用于正式候选事实的 B/C 级页面。
- 本轮不把搜索结果摘要纳入登记表，也没有以 C 级页面独立创建候选。
- 已登记页面有的内容通过动态接口提供，直接 HTML 与保存的 reviewed 采集文本不完全一致；这种情况保留为 `pending`，不自动判为错误或已核实。

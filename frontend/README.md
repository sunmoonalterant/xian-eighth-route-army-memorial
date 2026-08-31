# 八路军西安办事处纪念馆前台

课程设计游客前台第一阶段：Vue 3 页面、模拟数据与前端交互演示。

## 启动

```bash
npm install
npm run dev
```

开发服务器启动后访问终端显示的本地地址（通常为 `http://localhost:5173`）。

## 校验

```bash
npm test
npm run build
```

## 当前路由

- `/`、`/museum`、`/history`、`/relics`、`/relic/:id`
- `/people`、`/person/:id`、`/exhibitions`
- `/news`、`/news/:id`、`/digital-museum`、`/visit`
- `/reservation`、`/reservation/result`、`/reservation/query`、`/search`

未知地址会返回首页。详情页可使用 `r-01`、`p-01`、`n-01` 等模拟记录标识访问。预约页面仅进行浏览器内格式验证，不发送请求、不保存个人信息。

## 数据与临时素材

页面模拟数据位于 `src/data/`：文物、人物、新闻、展览、历史事件、院落和预约时段均可在此替换为 Axios 数据入口。图片位于 `src/assets/images/` 与 `src/assets/reference/`，其临时来源和替换状态记录在 `src/data/assetSources.js`；人物档案使用中性剪影占位图，不对应真实人物肖像。

本项目中所有历史文案、人物、展品和图片均为课程设计演示占位，不可作为纪念馆官方信息或已核实史实使用。

import { images } from './imageAssets.js'

export const newsCategories = ['全部', '馆内动态', '公告通知', '教育活动', '专题活动']
export const news = [
  { id: 'n-01', category: '馆内动态', title: '数字宣传项目页面上线（演示）', date: '2026-09-01', author: '课程设计项目组', summary: '这是课程设计的临时新闻内容，正式资讯待后续维护。', content: '本条内容仅用于呈现新闻详情页的排版、分类和关联阅读结构。', image: images.newsActivity, views: 88 },
  { id: 'n-02', category: '教育活动', title: '主题教育活动预告（演示）', date: '2026-08-28', author: '课程设计项目组', summary: '用于展示新闻列表和分类筛选的临时信息。', content: '正式活动安排请以纪念馆官方公开渠道为准。', image: images.exhibitionHall, views: 52 },
  { id: 'n-03', category: '公告通知', title: '参观服务信息提示（演示）', date: '2026-08-20', author: '课程设计项目组', summary: '用于展示公告类内容和后续预约入口。', content: '开放时间与预约政策将在第二周接入真实数据后调整。', image: images.courtyard, views: 41 },
]

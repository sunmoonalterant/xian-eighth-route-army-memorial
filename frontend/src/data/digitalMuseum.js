import { images } from './imageAssets.js'
import { officialCourtyards } from './officialCourtyards.js'

export const digitalGuide = {
  title: '七贤庄数字导览',
  description: '七贤庄平面导览资料正在整理中；待具备可核实资料后再开放院落热点与相关内容。',
  image: images.digitalGuide,
  officialProtection: officialCourtyards[0],
  // 平面图保留为界面示意；没有可靠院落资料时不渲染可点击热点。
  courtyards: [],
}

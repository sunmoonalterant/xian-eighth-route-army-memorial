import { images } from './imageAssets.js'

export const digitalGuide = {
  title: '七贤庄数字导览',
  description: '以平面导览、院落热点和故事卡片为基础的特色功能预览。内容待史料核实。',
  image: images.digitalGuide,
  courtyards: [
    { id: 'courtyard-1', number: '①', name: '一号院', x: 55, y: 48, width: 164, height: 92, description: '院落简介为课程设计占位，内容待史料核实。', related: '相关内容待史料核实。', image: images.courtyard },
    { id: 'courtyard-3', number: '③', name: '三号院', x: 294, y: 48, width: 150, height: 92, description: '院落简介为课程设计占位，内容待史料核实。', related: '相关内容待史料核实。', image: images.historyPaper },
    { id: 'courtyard-4', number: '④', name: '四号院', x: 110, y: 204, width: 166, height: 102, description: '院落简介为课程设计占位，内容待史料核实。', related: '相关内容待史料核实。', image: images.exhibitionHall },
    { id: 'courtyard-7', number: '⑦', name: '七号院', x: 347, y: 204, width: 154, height: 102, description: '院落简介为课程设计占位，内容待史料核实。', related: '相关内容待史料核实。', image: images.digitalGuide },
  ],
}

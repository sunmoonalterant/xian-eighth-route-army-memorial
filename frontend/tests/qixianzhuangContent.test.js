import assert from 'node:assert/strict'
import test from 'node:test'

import { qixianzhuangMedia, qixianzhuangTimeline } from '../src/data/qixianzhuang.js'

test('七贤庄时间轴保留从建成到纪念馆设立的可核验节点', () => {
  assert.deepEqual(
    qixianzhuangTimeline.map((item) => item.year),
    ['1934—1936', '1936', '1936年末', '1937年', '1937—1946', '1946年9月10日', '1959年'],
  )
  assert.match(qixianzhuangTimeline[1].label, /秘密交通站/)
  assert.match(qixianzhuangTimeline[5].label, /撤回延安/)
})

test('七贤庄图片使用可追溯的百度百科 HTTPS 原图链接', () => {
  assert.equal(qixianzhuangMedia.length, 4)
  assert.ok(qixianzhuangMedia.every((item) => item.image.startsWith('https://bkimg.cdn.bcebos.com/pic/')))
  assert.ok(qixianzhuangMedia.every((item) => item.sourceLabel === '百度百科·七贤庄' && item.sourceUrl.includes('baike.baidu.com')))
  assert.ok(qixianzhuangMedia.some((item) => item.title === '七贤庄一号院'))
})

<script setup>
import footerBackground from '../assets/reference/xabb/footer-background.jpg'
import { visitGuide } from '../data/museum'
</script>

<template>
  <footer class="site-footer" :style="{ backgroundImage: `url(${footerBackground})` }">
    <div class="shell site-footer__grid">
      <div><p class="eyebrow">MEMORIAL · XI'AN</p><h2>八路军西安办事处纪念馆</h2><p>数字宣传、预约与运营管理系统 · 课程设计前台演示</p></div>
      <div><h3>参观联系</h3><p>地址：{{ visitGuide.address }}</p><p>开放时间：{{ visitGuide.openHours }}</p></div>
      <div><h3>资料说明</h3><p>历史文案及图片均为演示占位，正式资料须以权威来源核实为准。</p></div>
    </div>
    <div class="shell site-footer__bottom">© 2026 课程设计项目 · 不代表纪念馆官方信息</div>
  </footer>
</template>

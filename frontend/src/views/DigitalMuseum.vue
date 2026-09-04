<script setup>
import PageHero from '../components/PageHero.vue'
import { digitalGuide } from '../data/digitalMuseum'
</script>

<template>
  <PageHero title="数字纪念馆" description="七贤庄平面导览资料正在整理中。" :image="digitalGuide.image" />
  <section class="section">
    <div class="shell">
      <div class="notice">当前未收录可与具体院落可靠对应的资料，因此不展示可点击院落热点。官网已采集到“{{ digitalGuide.officialProtection.title }}”资料，作为旧址保护说明，仍待人工审核。平面图仅用于页面交互布局示意，不代表真实地理测绘坐标。<a :href="digitalGuide.officialProtection.sourceUrl" target="_blank" rel="noreferrer">查看官网来源</a></div>
      <div class="guide-layout">
        <div class="guide-map" aria-label="七贤庄平面数字导览示意图">
          <div class="map-heading"><span>七贤庄平面数字导览</span><small>COURTYARD PLAN · DEMO</small></div>
          <svg viewBox="0 0 560 370" role="img" aria-label="当前无可核实院落热点的平面示意图">
            <path class="map-boundary" d="M28 28H532V342H28Z" />
            <path class="map-path" d="M28 171H532M280 28V342" />
            <text class="map-entry" x="280" y="185" text-anchor="middle">院落资料整理中</text>
            <text class="map-entry" x="280" y="354" text-anchor="middle">入口示意</text>
          </svg>
        </div>
        <article class="guide-card">
          <p class="eyebrow">COURTYARD GUIDE</p>
          <h2>院落资料正在整理中</h2>
          <p>尚无可公开展示、且能与具体院落准确对应的名称、用途、图片或坐标资料。后续仅在资料来源明确后增加热点。</p>
          <div class="guide-related"><span>资料来源</span><p>八路军西安办事处纪念馆官网公开资料整理，待人工审核。</p></div>
          <RouterLink class="button button--ghost" to="/museum">了解旧址保护资料 <span>→</span></RouterLink>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.guide-layout{display:grid;grid-template-columns:1.15fr .85fr;gap:28px;margin-top:32px}.guide-map{padding:24px;background:#e7e0d4;border:1px solid var(--line);min-width:0}.map-heading{display:flex;justify-content:space-between;gap:16px;align-items:baseline;margin-bottom:16px;color:var(--ink);font-size:1.05rem}.map-heading small{font:0.64rem Arial,sans-serif;letter-spacing:.12em;color:var(--muted)}.guide-map svg{display:block;width:100%;height:auto;background:#f6f1e8}.map-boundary,.map-path{fill:none;stroke:#777069;stroke-width:2}.map-path{stroke-dasharray:8 7;stroke-width:1.5}.map-zone{cursor:pointer;outline:none}.map-zone rect{fill:#c8c0b4;stroke:#776f67;stroke-width:2;transition:fill .2s,stroke .2s}.map-zone text{fill:var(--primary);font:600 32px serif;pointer-events:none}.map-zone .map-zone__name{fill:#4c4742;font:13px serif}.map-zone:hover rect,.map-zone.is-selected rect,.map-zone:focus rect{fill:#8b1e1e;stroke:#5e1515}.map-zone:hover text,.map-zone.is-selected text,.map-zone:focus text{fill:#fff}.map-entry{fill:#756f68;font:12px serif}.guide-card{border:1px solid var(--line);padding:20px;background:var(--cream)}.guide-card img{width:100%;aspect-ratio:16/9;margin-bottom:20px}.guide-card h2{margin:0 0 12px}.guide-card p{line-height:1.8;color:var(--muted)}.guide-related{margin:18px 0;padding:14px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.guide-related span{font:0.72rem Arial,sans-serif;letter-spacing:.1em;color:var(--primary)}.guide-related p{margin:6px 0 0;font-size:.9rem}.guide-card .button{min-width:132px}@media(max-width:768px){.guide-layout{grid-template-columns:1fr}.guide-map{padding:16px}.map-heading{display:block}.map-heading small{display:block;margin-top:7px}}
</style>

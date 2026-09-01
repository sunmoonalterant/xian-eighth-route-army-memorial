<script setup>
import { ref } from 'vue'
import PageHero from '../components/PageHero.vue'
import { digitalGuide } from '../data/digitalMuseum'

const selected = ref(digitalGuide.courtyards[0])
</script>

<template>
  <PageHero title="数字纪念馆" description="七贤庄平面数字导览功能预览。" :image="digitalGuide.image" />
  <section class="section">
    <div class="shell">
      <div class="notice">本阶段为七贤庄平面数字导览演示，不包含 360°VR；院落信息与相关内容均待史料核实。官网已采集到“{{ digitalGuide.officialProtection.title }}”资料，作为旧址保护说明，仍待审核。</div>
      <div class="guide-layout">
        <div class="guide-map" aria-label="七贤庄平面数字导览示意图">
          <div class="map-heading"><span>七贤庄平面数字导览</span><small>COURTYARD PLAN · DEMO</small></div>
          <svg viewBox="0 0 560 370" role="img" aria-label="可选择一号院、三号院、四号院和七号院的平面示意图">
            <path class="map-boundary" d="M28 28H532V342H28Z" />
            <path class="map-path" d="M28 171H532M280 28V342" />
            <g v-for="courtyard in digitalGuide.courtyards" :key="courtyard.id" class="map-zone" :class="{ 'is-selected': selected.id === courtyard.id }" tabindex="0" role="button" @click="selected = courtyard" @keydown.enter="selected = courtyard" @keydown.space.prevent="selected = courtyard">
              <rect :x="courtyard.x" :y="courtyard.y" :width="courtyard.width" :height="courtyard.height" rx="2" />
              <text :x="courtyard.x + courtyard.width / 2" :y="courtyard.y + 42" text-anchor="middle">{{ courtyard.number }}</text>
              <text class="map-zone__name" :x="courtyard.x + courtyard.width / 2" :y="courtyard.y + 70" text-anchor="middle">{{ courtyard.name }}</text>
            </g>
            <text class="map-entry" x="280" y="354" text-anchor="middle">入口示意</text>
          </svg>
        </div>
        <article class="guide-card">
          <img :src="selected.image" :alt="`${selected.name}课程设计展示图片`" />
          <p class="eyebrow">{{ selected.number }} COURTYARD GUIDE</p>
          <h2>{{ selected.name }}</h2>
          <p>{{ selected.description }}</p>
          <div class="guide-related"><span>相关内容</span><p>{{ selected.related }}</p></div>
          <RouterLink class="button button--ghost" to="/museum">查看详情 <span>→</span></RouterLink>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.guide-layout{display:grid;grid-template-columns:1.15fr .85fr;gap:28px;margin-top:32px}.guide-map{padding:24px;background:#e7e0d4;border:1px solid var(--line);min-width:0}.map-heading{display:flex;justify-content:space-between;gap:16px;align-items:baseline;margin-bottom:16px;color:var(--ink);font-size:1.05rem}.map-heading small{font:0.64rem Arial,sans-serif;letter-spacing:.12em;color:var(--muted)}.guide-map svg{display:block;width:100%;height:auto;background:#f6f1e8}.map-boundary,.map-path{fill:none;stroke:#777069;stroke-width:2}.map-path{stroke-dasharray:8 7;stroke-width:1.5}.map-zone{cursor:pointer;outline:none}.map-zone rect{fill:#c8c0b4;stroke:#776f67;stroke-width:2;transition:fill .2s,stroke .2s}.map-zone text{fill:var(--primary);font:600 32px serif;pointer-events:none}.map-zone .map-zone__name{fill:#4c4742;font:13px serif}.map-zone:hover rect,.map-zone.is-selected rect,.map-zone:focus rect{fill:#8b1e1e;stroke:#5e1515}.map-zone:hover text,.map-zone.is-selected text,.map-zone:focus text{fill:#fff}.map-entry{fill:#756f68;font:12px serif}.guide-card{border:1px solid var(--line);padding:20px;background:var(--cream)}.guide-card img{width:100%;aspect-ratio:16/9;margin-bottom:20px}.guide-card h2{margin:0 0 12px}.guide-card p{line-height:1.8;color:var(--muted)}.guide-related{margin:18px 0;padding:14px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.guide-related span{font:0.72rem Arial,sans-serif;letter-spacing:.1em;color:var(--primary)}.guide-related p{margin:6px 0 0;font-size:.9rem}.guide-card .button{min-width:132px}@media(max-width:768px){.guide-layout{grid-template-columns:1fr}.guide-map{padding:16px}.map-heading{display:block}.map-heading small{display:block;margin-top:7px}}
</style>

<script setup>
import { computed, onMounted, ref } from 'vue'
import PageHero from '../components/PageHero.vue'
import { getDigitalMuseum } from '../api/digitalMuseum.js'
import { digitalGuide } from '../data/digitalMuseum.js'
import { toDisplayImageUrl } from '../utils/imageUrl.js'

const loading = ref(true); const failed = ref(false); const guide = ref({ site: null, courtyards: [] }); const selected = ref(null)
const hasCourtyards = computed(() => guide.value.courtyards.length > 0)
const mapImage = computed(() => guide.value.site?.mapImage ? toDisplayImageUrl(guide.value.site.mapImage) : null)
async function load() { loading.value = true; failed.value = false; try { guide.value = await getDigitalMuseum(); selected.value = guide.value.courtyards[0] || null } catch { failed.value = true; guide.value = { site:null,courtyards:[] } } finally { loading.value = false } }
onMounted(load)
</script>

<template>
  <PageHero title="数字纪念馆" :description="guide.site?.summary || '七贤庄平面导览资料正在整理中。'" :image="digitalGuide.image" />
  <section class="section"><div class="shell">
    <p v-if="failed" class="notice">数字导览资料暂时无法加载，请稍后重试。</p>
    <template v-else-if="!loading && hasCourtyards">
      <div class="digital-intro"><p class="eyebrow">QIXIANZHUANG GUIDE</p><h2>{{ guide.site?.title || '七贤庄数字导览' }}</h2><p>{{ guide.site?.content || '以下热点仅展示已审核并公开的院落资料。热点坐标用于响应式页面布局，不代表测绘或地理坐标。' }}</p></div>
      <div class="guide-layout"><div class="guide-map" aria-label="七贤庄平面数字导览"><div class="map-heading"><span>七贤庄平面数字导览</span><small>{{ mapImage ? 'VERIFIED GUIDE MAP' : 'COURSE DESIGN DIAGRAM · NOT SURVEY MAP' }}</small></div><div class="map-canvas" :style="mapImage ? { backgroundImage: `url(${mapImage})` } : {}"><svg v-if="!mapImage" viewBox="0 0 100 68" role="img" aria-label="课程设计导览示意图，非测绘地图"><path d="M4 4H96V64H4Z"/><path d="M4 34H96M50 4V64"/></svg><button v-for="item in guide.courtyards" :key="item.id" class="map-hotspot" :class="{ 'is-selected': selected?.id === item.id }" :style="{ left: `${item.positionX}%`, top: `${item.positionY}%` }" type="button" @click="selected=item"><b>{{ item.name.replace('七贤庄','').replace('院','') }}</b><span>{{ item.name }}</span></button></div><p class="map-disclaimer">{{ mapImage ? '导览底图资料已审核；热点位置仅作页面视觉布局使用。' : '课程设计导览示意图，非测绘地图；热点位置仅作页面视觉布局使用。' }}</p></div>
        <article v-if="selected" class="guide-card"><img v-if="selected.coverImage" :src="toDisplayImageUrl(selected.coverImage)" :alt="selected.name"/><p class="eyebrow">COURTYARD ARCHIVE</p><h2>{{ selected.name }}</h2><p>{{ selected.summary }}</p><dl><div v-if="selected.historicalUse"><dt>历史用途</dt><dd>{{ selected.historicalUse }}</dd></div><div v-if="selected.currentUse"><dt>当前用途</dt><dd>{{ selected.currentUse }}</dd></div></dl><div v-if="selected.galleryImages?.length" class="gallery"><img v-for="image in selected.galleryImages" :key="image.url" :src="toDisplayImageUrl(image.url)" :alt="image.caption || selected.name"/></div><p v-if="selected.sourceName" class="source-note">资料来源：<a v-if="selected.sourceUrl" :href="selected.sourceUrl" target="_blank" rel="noreferrer">{{ selected.sourceName }}</a><span v-else>{{ selected.sourceName }}</span></p></article></div>
    </template>
    <div v-else-if="!loading" class="notice">当前尚无经过审核并公开的具体院落资料，数字导览将继续保持整理状态；不会以演示热点补齐地图。</div>
  </div></section>
</template>

<style scoped>
.digital-intro{max-width:760px;margin:0 auto 40px;text-align:center}.digital-intro h2{margin:5px 0 14px}.digital-intro>p:last-child{color:var(--muted);line-height:1.9}.guide-layout{display:grid;grid-template-columns:1.15fr .85fr;gap:28px}.guide-map{padding:24px;background:#e7e0d4;border:1px solid var(--line);min-width:0}.map-heading{display:flex;justify-content:space-between;gap:16px;align-items:baseline;margin-bottom:16px;color:var(--ink);font-size:1.05rem}.map-heading small{font:.64rem Arial,sans-serif;letter-spacing:.12em;color:var(--muted)}.map-canvas{position:relative;aspect-ratio:1.47;background:#f6f1e8;border:1px solid #a89f93;background-size:cover;background-position:center}.map-canvas svg{width:100%;height:100%}.map-canvas path{fill:none;stroke:#81776c;stroke-width:.35}.map-hotspot{position:absolute;transform:translate(-50%,-50%);display:grid;place-items:center;width:34px;height:34px;padding:0;border:2px solid var(--cream);border-radius:50%;background:var(--primary);color:#fff;box-shadow:0 2px 8px rgba(40,30,22,.28);cursor:pointer}.map-hotspot b{font-size:.86rem;line-height:1}.map-hotspot span{position:absolute;top:40px;white-space:nowrap;padding:4px 7px;background:rgba(35,30,25,.86);font-size:.72rem;opacity:0;pointer-events:none}.map-hotspot:hover span,.map-hotspot:focus span,.map-hotspot.is-selected span{opacity:1}.map-hotspot.is-selected{background:#5e1515;outline:3px solid rgba(139,30,30,.22)}.map-disclaimer{margin:12px 0 0;color:var(--muted);font-size:.78rem;line-height:1.6}.guide-card{border:1px solid var(--line);padding:22px;background:var(--cream)}.guide-card>img{width:100%;aspect-ratio:16/9;object-fit:cover;margin-bottom:18px}.guide-card h2{margin:0 0 12px}.guide-card>p{color:var(--muted);line-height:1.85}.guide-card dl{margin:18px 0;border-block:1px solid var(--line)}.guide-card dl div{padding:10px 0}.guide-card dt{font-size:.75rem;color:var(--primary);letter-spacing:.08em}.guide-card dd{margin:5px 0 0;line-height:1.7}.gallery{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.gallery img{width:100%;aspect-ratio:4/3;object-fit:cover}.source-note{font-size:.84rem}.source-note a{color:var(--primary)}@media(max-width:768px){.guide-layout{grid-template-columns:1fr}.guide-map{padding:16px}.map-heading{display:block}.map-heading small{display:block;margin-top:7px}}
</style>

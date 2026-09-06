<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getRelicById } from '../api/relics'
import PageHero from '../components/PageHero.vue'
import { findRecord } from '../data/contentLookup'
import { relics } from '../data/relics'
import { images } from '../data/imageAssets'
import { toRelicView } from '../utils/apiAdapters'
import { toDisplayImageUrl } from '../utils/imageUrl.js'

const route = useRoute()
const relic = ref(findRecord(relics, route.params.id))
const usingFallback = ref(false)
const fallback = event => { event.target.src = images.relicObject }

async function loadRelic(id) {
  try {
    relic.value = toRelicView(await getRelicById(id), images.relicObject)
    usingFallback.value = false
  } catch (error) {
    console.warn('文物 API 不可用，已使用本地资料。', error)
    relic.value = findRecord(relics, id)
    usingFallback.value = Boolean(relic.value)
  }
}

watch(() => route.params.id, loadRelic, { immediate: true })
</script>
<template><PageHero :title="relic ? relic.name : '文物内容不存在'" description="馆藏文物详情" :image="toDisplayImageUrl(relic?.image)" /><section class="section"><div class="shell"><p v-if="usingFallback" class="source-note">当前展示本地资料。</p><div v-if="relic" class="detail-layout"><article class="detail-main"><img :src="toDisplayImageUrl(relic.image)" :alt="relic.name" @error="fallback" /><p v-if="relic.category || relic.era" class="eyebrow">{{ [relic.category, relic.era].filter(Boolean).join(' · ') }}</p><h2>{{ relic.name }}</h2><p>{{ relic.summary }}</p><p class="official-content">{{ relic.contentText || relic.content || relic.summary }}</p><section v-if="relic.galleryImages?.length" class="related-media"><h3>文物图库</h3><div class="media-gallery"><figure v-for="(image, index) in relic.galleryImages" :key="`${image.url}-${index}`"><img :src="toDisplayImageUrl(image.url)" :alt="image.caption || `${relic.name}图片`" /><figcaption v-if="image.caption">{{ image.caption }}</figcaption></figure></div></section><p class="source-note">资料来源：八路军西安办事处纪念馆官方网站 · 采集时间：{{ relic.retrievedAt?.slice(0, 10) }}</p></article><aside class="detail-aside"><h3>信息卡</h3><p v-if="relic.era">年代：{{ relic.era }}</p><p v-if="relic.category">类别：{{ relic.category }}</p><p>浏览次数：{{ relic.views }}（演示）</p></aside></div><div v-else class="empty-state"><h2>内容不存在</h2><RouterLink class="button" to="/relics">返回文物列表</RouterLink></div></div></section></template>
<style scoped>.related-media{margin-top:34px;padding-top:24px;border-top:1px solid var(--line)}.related-media h3{margin:0 0 16px}.media-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.media-gallery figure{margin:0}.media-gallery img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}.media-gallery figcaption{margin-top:8px;color:var(--muted);font-size:.9rem;line-height:1.6}@media(max-width:640px){.media-gallery{grid-template-columns:1fr}}</style>

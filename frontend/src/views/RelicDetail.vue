<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getRelicById } from '../api/relics'
import PageHero from '../components/PageHero.vue'
import { findRecord } from '../data/contentLookup'
import { relics } from '../data/relics'
import { images } from '../data/imageAssets'
import { toRelicView } from '../utils/apiAdapters'

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
<template><PageHero :title="relic ? relic.name : '文物内容不存在'" description="馆藏文物详情" :image="relic?.image" /><section class="section"><div class="shell"><p v-if="usingFallback" class="source-note">当前展示本地资料。</p><div v-if="relic" class="detail-layout"><article class="detail-main"><img :src="relic.image" :alt="relic.name" @error="fallback" /><p v-if="relic.category || relic.era" class="eyebrow">{{ [relic.category, relic.era].filter(Boolean).join(' · ') }}</p><h2>{{ relic.name }}</h2><p>{{ relic.summary }}</p><p class="official-content">{{ relic.contentText || relic.content || relic.summary }}</p><p class="source-note">资料来源：八路军西安办事处纪念馆官方网站 · 采集时间：{{ relic.retrievedAt?.slice(0, 10) }}</p></article><aside class="detail-aside"><h3>信息卡</h3><p v-if="relic.era">年代：{{ relic.era }}</p><p v-if="relic.category">类别：{{ relic.category }}</p><p>浏览次数：{{ relic.views }}（演示）</p></aside></div><div v-else class="empty-state"><h2>内容不存在</h2><RouterLink class="button" to="/relics">返回文物列表</RouterLink></div></div></section></template>

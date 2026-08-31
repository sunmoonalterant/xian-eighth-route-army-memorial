<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PageHero from '../components/PageHero.vue'
import { findRecord } from '../data/contentLookup'
import { relics } from '../data/relics'
import { images } from '../data/imageAssets'
const relic = computed(() => findRecord(relics, useRoute().params.id))
const fallback = event => { event.target.src = images.relicObject }
</script>
<template><PageHero :title="relic ? relic.name : '文物内容不存在'" description="馆藏文物详情" :image="relic?.image" /><section class="section"><div class="shell"><div v-if="relic" class="detail-layout"><article class="detail-main"><img :src="relic.image" :alt="relic.name" @error="fallback" /><p v-if="relic.category || relic.era" class="eyebrow">{{ [relic.category, relic.era].filter(Boolean).join(' · ') }}</p><h2>{{ relic.name }}</h2><p>{{ relic.summary }}</p><div class="official-content" v-html="relic.contentHtml"></div><p class="source-note">资料来源：八路军西安办事处纪念馆官方网站 · 采集时间：{{ relic.retrievedAt?.slice(0, 10) }}</p></article><aside class="detail-aside"><h3>信息卡</h3><p v-if="relic.era">年代：{{ relic.era }}</p><p v-if="relic.category">类别：{{ relic.category }}</p><p>浏览次数：{{ relic.views }}（演示）</p></aside></div><div v-else class="empty-state"><h2>内容不存在</h2><RouterLink class="button" to="/relics">返回文物列表</RouterLink></div></div></section></template>

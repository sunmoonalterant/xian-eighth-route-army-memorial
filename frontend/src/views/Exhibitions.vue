<script setup>
import { onMounted, ref } from 'vue'
import { getExhibitions } from '../api/exhibitions'
import PageHero from '../components/PageHero.vue'
import { exhibitions } from '../data/exhibitions'
import { images } from '../data/imageAssets'
import { toExhibitionCard } from '../utils/apiAdapters'

const displayExhibitions = ref(exhibitions)
const loading = ref(true)
const usingFallback = ref(false)

onMounted(async () => {
  try {
    const result = await getExhibitions({ page: 1, pageSize: 9 })
    displayExhibitions.value = result.list.map((item) => toExhibitionCard(item, images.exhibitionHall))
  } catch (error) {
    console.warn('展览 API 不可用，已使用本地资料。', error)
    usingFallback.value = true
  } finally {
    loading.value = false
  }
})
</script>
<template><PageHero title="陈列展览" description="展示基本陈列、专题展览和临时展览的内容结构。" :image="images.exhibitionHall" /><section class="section"><div class="shell"><p v-if="loading" class="source-note">资料加载中…</p><p v-else-if="usingFallback" class="source-note">当前展示本地资料。</p><div v-if="displayExhibitions.length" class="card-grid"><RouterLink v-for="item in displayExhibitions" :key="item.id" class="content-card exhibition-card" :to="item.to"><img :src="item.image" :alt="item.title" /><div class="content-card__body"><span class="tag">{{ item.type }}</span><h3>{{ item.title }}</h3><p v-if="item.time" class="card-meta">{{ item.time }}</p><p>{{ item.summary }}</p><span class="exhibition-card__action">查看详情 <span aria-hidden="true">→</span></span></div></RouterLink></div><div v-else class="empty-state">暂无展览资料。</div></div></section></template>

<style scoped>.exhibition-card{display:block;height:100%;cursor:pointer}.exhibition-card h3,.exhibition-card__action{transition:color .2s}.exhibition-card:hover h3,.exhibition-card:hover .exhibition-card__action{color:var(--primary)}.exhibition-card__action{font:500 .82rem Arial,sans-serif;color:var(--primary)}</style>

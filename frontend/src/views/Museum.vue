<script setup>
import { computed, onMounted, ref } from 'vue'
import PageHero from '../components/PageHero.vue'
import { getMuseum } from '../api/museum'
import { museum } from '../data/museum'
import { images } from '../data/imageAssets'
import { toMuseumView } from '../utils/apiAdapters'

const activeMuseum = ref(museum)
const loading = ref(true)
const usingFallback = ref(false)
const displayMuseum = computed(() => activeMuseum.value)

onMounted(async () => {
  try {
    activeMuseum.value = toMuseumView(await getMuseum(), museum)
  } catch (error) {
    console.warn('馆情 API 不可用，已使用本地资料。', error)
    usingFallback.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <PageHero title="走进纪念馆" description="从旧址空间与文化记忆进入参观叙事。" :image="displayMuseum.image" />
  <section class="section">
    <div class="shell museum-sections">
      <p v-if="loading" class="source-note">资料加载中…</p>
      <p v-else-if="usingFallback" class="source-note">当前展示本地资料。</p>
      <article v-for="(section, index) in displayMuseum.sections" :key="section.title" :class="{ reverse: index % 2 }">
        <img :src="section.image" :alt="section.title" @error="$event.target.src = images.courtyard" />
        <div>
          <p class="eyebrow">0{{ index + 1 }}</p>
          <h2>{{ section.title }}</h2>
          <p class="official-content">{{ section.text }}</p>
          <p class="source-note">资料来源：{{ displayMuseum.sourceName }}官方网站 · 采集时间：{{ displayMuseum.retrievedAt?.slice(0, 10) }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
<style scoped>.museum-sections{display:grid;gap:60px}.museum-sections article{display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:center;border-bottom:1px solid var(--line);padding-bottom:50px}.museum-sections article.reverse div{order:-1}.museum-sections img{width:100%;aspect-ratio:4/3;background:#e3ddd1}.museum-sections h2{margin:0 0 16px}.museum-sections p{line-height:1.9;color:var(--muted)}.official-content{white-space:pre-wrap}@media(max-width:768px){.museum-sections article{grid-template-columns:1fr;gap:20px}.museum-sections article.reverse div{order:0}}</style>

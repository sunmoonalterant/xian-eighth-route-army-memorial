<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getRelics } from '../api/relics'
import PageHero from '../components/PageHero.vue'
import RelicCard from '../components/RelicCard.vue'
import { relicCategories, relics } from '../data/relics'
import { images } from '../data/imageAssets'
import { paginate, sortByViews } from '../data/listing'
import { toRelicView } from '../utils/apiAdapters'

const activeCategory = ref('全部')
const keyword = ref('')
const sort = ref('default')
const currentPage = ref(1)
const pageSize = 3
const remoteRelics = ref([])
const remoteTotal = ref(0)
const loading = ref(true)
const usingFallback = ref(true)
const filtered = computed(() => relics.filter((item) => (
  (activeCategory.value === '全部' || item.category === activeCategory.value)
  && item.name.includes(keyword.value.trim())
)))
const ordered = computed(() => (sort.value === 'views' ? sortByViews(filtered.value) : filtered.value))
const fallbackPageData = computed(() => paginate(ordered.value, currentPage.value, pageSize))
const pageData = computed(() => {
  if (usingFallback.value) return fallbackPageData.value
  const items = sort.value === 'views' ? sortByViews(remoteRelics.value) : remoteRelics.value
  return { items, total: remoteTotal.value, totalPages: Math.ceil(remoteTotal.value / pageSize) }
})

async function loadRelics() {
  loading.value = true
  try {
    const result = await getRelics({ page: currentPage.value, pageSize, keyword: keyword.value.trim() || undefined })
    remoteRelics.value = result.list.map((item) => toRelicView(item, images.relicObject))
    remoteTotal.value = result.total
    usingFallback.value = false
  } catch (error) {
    console.warn('文物 API 不可用，已使用本地资料。', error)
    usingFallback.value = true
  } finally {
    loading.value = false
  }
}

watch([activeCategory, keyword, sort], () => {
  currentPage.value = 1
  loadRelics()
})
watch(currentPage, loadRelics)
onMounted(loadRelics)
</script>

<template>
  <PageHero title="馆藏文物" description="馆藏资料的分类、检索与详情入口。" :image="images.relicDocument" />
  <section class="section"><div class="shell">
    <div class="filter-bar">
      <button v-for="category in relicCategories" :key="category" type="button" :class="{ 'is-active': activeCategory === category }" @click="activeCategory = category">{{ category }}</button>
    </div>
    <div class="listing-tools">
      <div class="search-box"><input v-model="keyword" placeholder="输入文物名称搜索" aria-label="搜索文物名称" /><button type="button">搜索</button></div>
      <label class="sort-control">排序<select v-model="sort"><option value="default">默认排序</option><option value="views">浏览量</option></select></label>
    </div>
    <p v-if="loading" class="source-note">资料加载中…</p>
    <p v-else-if="usingFallback" class="source-note">当前展示本地资料。</p>
    <p class="result-count">共找到 <strong>{{ pageData.total }}</strong> 件文物</p>
    <div v-if="pageData.items.length" class="card-grid"><RelicCard v-for="relic in pageData.items" :key="relic.id" :relic="relic" /></div>
    <div v-else class="empty-state">未找到对应的文物资料。</div>
    <nav v-if="pageData.totalPages > 1" class="pagination" aria-label="文物分页"><button type="button" :disabled="currentPage === 1" @click="currentPage--">上一页</button><button v-for="page in pageData.totalPages" :key="page" type="button" :class="{ 'is-active': currentPage === page }" @click="currentPage = page">{{ page }}</button><button type="button" :disabled="currentPage === pageData.totalPages" @click="currentPage++">下一页</button></nav>
  </div></section>
</template>

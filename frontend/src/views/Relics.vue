<script setup>
import { computed, ref, watch } from 'vue'
import PageHero from '../components/PageHero.vue'
import RelicCard from '../components/RelicCard.vue'
import { relicCategories, relics } from '../data/relics'
import { images } from '../data/imageAssets'
import { paginate, sortByViews } from '../data/listing'

const activeCategory = ref('全部')
const keyword = ref('')
const sort = ref('default')
const currentPage = ref(1)
const pageSize = 3
const filtered = computed(() => relics.filter((item) => (
  (activeCategory.value === '全部' || item.category === activeCategory.value)
  && item.name.includes(keyword.value.trim())
)))
const ordered = computed(() => (sort.value === 'views' ? sortByViews(filtered.value) : filtered.value))
const pageData = computed(() => paginate(ordered.value, currentPage.value, pageSize))
watch([activeCategory, keyword, sort], () => { currentPage.value = 1 })
</script>

<template>
  <PageHero title="馆藏文物" description="课程设计演示的分类、检索与详情入口。" :image="images.relicDocument" />
  <section class="section"><div class="shell">
    <div class="filter-bar">
      <button v-for="category in relicCategories" :key="category" type="button" :class="{ 'is-active': activeCategory === category }" @click="activeCategory = category">{{ category }}</button>
    </div>
    <div class="listing-tools">
      <div class="search-box"><input v-model="keyword" placeholder="输入文物名称搜索" aria-label="搜索文物名称" /><button type="button">搜索</button></div>
      <label class="sort-control">排序<select v-model="sort"><option value="default">默认排序</option><option value="views">浏览量</option></select></label>
    </div>
    <p class="result-count">共找到 <strong>{{ pageData.total }}</strong> 件演示文物</p>
    <div v-if="pageData.items.length" class="card-grid"><RelicCard v-for="relic in pageData.items" :key="relic.id" :relic="relic" /></div>
    <div v-else class="empty-state">未找到对应的演示文物。</div>
    <nav v-if="pageData.totalPages > 1" class="pagination" aria-label="文物分页"><button type="button" :disabled="currentPage === 1" @click="currentPage--">上一页</button><button v-for="page in pageData.totalPages" :key="page" type="button" :class="{ 'is-active': currentPage === page }" @click="currentPage = page">{{ page }}</button><button type="button" :disabled="currentPage === pageData.totalPages" @click="currentPage++">下一页</button></nav>
  </div></section>
</template>

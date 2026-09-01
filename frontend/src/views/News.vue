<script setup>
import { computed, ref, watch } from 'vue'
import PageHero from '../components/PageHero.vue'
import NewsCard from '../components/NewsCard.vue'
import { news, newsCategories } from '../data/news'
import { images } from '../data/imageAssets'
import { paginate } from '../data/listing'

const category = ref('全部')
const keyword = ref('')
const currentPage = ref(1)
const filtered = computed(() => news.filter((item) => (
  (category.value === '全部' || item.category === category.value)
  && item.title.includes(keyword.value.trim())
)))
const pageData = computed(() => paginate(filtered.value, currentPage.value, 2))
watch([category, keyword], () => { currentPage.value = 1 })
</script>

<template><PageHero title="新闻活动" description="官网公开资讯整理展示，全部内容仍待人工审核。" :image="images.newsActivity" /><section class="section"><div class="shell"><div class="filter-bar"><button v-for="item in newsCategories" :key="item" type="button" :class="{ 'is-active': category === item }" @click="category = item">{{ item }}</button></div><div class="search-box"><input v-model="keyword" placeholder="搜索新闻标题" aria-label="搜索新闻标题" /><button type="button">搜索</button></div><p class="result-count">共找到 <strong>{{ pageData.total }}</strong> 条官网公开资料（待审核）</p><div v-if="pageData.items.length" class="news-list"><NewsCard v-for="item in pageData.items" :key="item.id" :item="item" /></div><div v-else class="empty-state">未找到对应的官网公开资料。</div><nav v-if="pageData.totalPages > 1" class="pagination" aria-label="新闻分页"><button type="button" :disabled="currentPage === 1" @click="currentPage--">上一页</button><button v-for="page in pageData.totalPages" :key="page" type="button" :class="{ 'is-active': currentPage === page }" @click="currentPage = page">{{ page }}</button><button type="button" :disabled="currentPage === pageData.totalPages" @click="currentPage++">下一页</button></nav></div></section></template>

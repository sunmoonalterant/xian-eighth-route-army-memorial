<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import PageHero from '../components/PageHero.vue'
import NewsCard from '../components/NewsCard.vue'
import { officialNews } from '../data/officialNews.js'
import { newsCategories } from '../data/news.js'
import { images } from '../data/imageAssets'
import { paginate } from '../data/listing'
import { getArticles } from '../api/news.js'

const category = ref('全部'); const keyword = ref(''); const currentPage = ref(1); const records = ref([]); const localFallback = ref(false); const loading = ref(true)
const toCard = (item) => ({ id: String(item.id), category: item.category || '未分类', date: item.publishTime ? String(item.publishTime).slice(0, 10) : '待官方信息核实', author: '八路军西安办事处纪念馆（官网公开资料）', title: item.title, summary: item.summary || '', content: item.content || '', image: item.coverImage || images.newsActivity, views: item.views || 0, sourceUrl: item.sourceUrl || '' })
async function loadNews() { loading.value = true; try { const result = await getArticles({ page: 1, pageSize: 100 }); records.value = (result.list || []).map(toCard); localFallback.value = false } catch { records.value = officialNews; localFallback.value = true } finally { loading.value = false } }
const filtered = computed(() => records.value.filter((item) => (category.value === '全部' || item.category === category.value) && item.title.includes(keyword.value.trim())))
const pageData = computed(() => paginate(filtered.value, currentPage.value, 2))
watch([category, keyword], () => { currentPage.value = 1 })
onMounted(loadNews)
</script>

<template><PageHero title="新闻活动" description="官网公开资讯整理展示，全部内容仍待人工审核。" :image="images.newsActivity" /><section class="section"><div class="shell"><p v-if="localFallback" class="data-notice">当前展示本地资料</p><div class="filter-bar"><button v-for="item in newsCategories" :key="item" type="button" :class="{ 'is-active': category === item }" @click="category = item">{{ item }}</button></div><div class="search-box"><input v-model="keyword" placeholder="搜索新闻标题" aria-label="搜索新闻标题" /><button type="button" @click="currentPage = 1">搜索</button></div><p class="result-count">共找到 <strong>{{ pageData.total }}</strong> 条官网公开资料（待审核）</p><div v-if="loading" class="empty-state">正在加载新闻资料…</div><div v-else-if="pageData.items.length" class="news-list"><NewsCard v-for="item in pageData.items" :key="item.id" :item="item" /></div><div v-else class="empty-state">未找到对应的官网公开资料。</div><nav v-if="pageData.totalPages > 1" class="pagination" aria-label="新闻分页"><button type="button" :disabled="currentPage === 1" @click="currentPage--">上一页</button><button v-for="page in pageData.totalPages" :key="page" type="button" :class="{ 'is-active': currentPage === page }" @click="currentPage = page">{{ page }}</button><button type="button" :disabled="currentPage === pageData.totalPages" @click="currentPage++">下一页</button></nav></div></section></template>

<style scoped>.data-notice{margin:0 0 18px;padding:10px 14px;border-left:3px solid var(--primary);background:#f3e8d6;color:var(--muted);font-size:.9rem}</style>

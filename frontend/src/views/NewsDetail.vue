<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageHero from '../components/PageHero.vue'
import NewsCard from '../components/NewsCard.vue'
import { officialNews } from '../data/officialNews.js'
import { images } from '../data/imageAssets'
import { getArticleById } from '../api/news.js'
const route = useRoute(); const item = ref(null); const localFallback = ref(false); const loading = ref(true)
const toCard = (record) => ({ id: String(record.id), category: record.category || '未分类', date: record.publishTime ? String(record.publishTime).slice(0, 10) : '待官方信息核实', author: '八路军西安办事处纪念馆（官网公开资料）', title: record.title, summary: record.summary || '', content: record.content || '', image: record.coverImage || images.newsActivity, views: record.views || 0, sourceUrl: record.sourceUrl || '' })
async function loadDetail() { loading.value = true; item.value = null; try { item.value = toCard(await getArticleById(route.params.id)); localFallback.value = false } catch { item.value = officialNews.find((record) => String(record.id) === String(route.params.id)) || null; localFallback.value = Boolean(item.value) } finally { loading.value = false } }
const related = computed(() => officialNews.filter((record) => !item.value || String(record.id) !== String(item.value.id)).slice(0, 2))
watch(() => route.params.id, loadDetail, { immediate: true })
</script>
<template><PageHero :title="item ? item.title : '新闻内容不存在'" description="新闻活动详情" :image="item?.image" /><section class="section"><div class="shell"><p v-if="localFallback" class="data-notice">当前展示本地资料</p><div v-if="loading" class="empty-state">正在加载新闻资料…</div><div v-else-if="item"><article class="detail-main"><p class="card-meta">{{ item.category }} · {{ item.date }} · {{ item.author }}</p><h2>{{ item.title }}</h2><img :src="item.image" :alt="item.title" /><p>{{ item.content }}</p><p>浏览次数：{{ item.views }}</p></article><div class="section-heading" style="margin-top:48px"><h2>相关新闻</h2></div><div class="news-list"><NewsCard v-for="record in related" :key="record.id" :item="record" /></div></div><div v-else class="empty-state"><h2>内容不存在</h2><RouterLink class="button" to="/news">返回新闻列表</RouterLink></div></div></section></template>
<style scoped>.data-notice{margin:0 0 18px;padding:10px 14px;border-left:3px solid var(--primary);background:#f3e8d6;color:var(--muted);font-size:.9rem}</style>

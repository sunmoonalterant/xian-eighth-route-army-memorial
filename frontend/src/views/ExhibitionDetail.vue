<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getExhibitionById } from '../api/exhibitions.js'
import PageHero from '../components/PageHero.vue'
import { exhibitions } from '../data/exhibitions.js'
import { images } from '../data/imageAssets.js'
import { findExhibitionFallback, getExhibitionErrorMessage, toExhibitionDetail } from '../utils/exhibitionFlow.js'

const route = useRoute()
const displayExhibition = ref(null)
const errorMessage = ref('')
const loading = ref(true)
const usingFallback = ref(false)

async function loadExhibition(id) {
  displayExhibition.value = null
  errorMessage.value = ''
  usingFallback.value = false
  loading.value = true
  try {
    displayExhibition.value = toExhibitionDetail(await getExhibitionById(id), images.exhibitionHall)
  } catch (error) {
    const fallback = findExhibitionFallback(exhibitions, id)
    if (fallback) {
      displayExhibition.value = toExhibitionDetail(fallback, images.exhibitionHall)
      usingFallback.value = true
    } else {
      errorMessage.value = getExhibitionErrorMessage(error, id)
    }
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, loadExhibition, { immediate: true })
</script>

<template>
  <PageHero :title="displayExhibition?.title || '展览详情'" :description="displayExhibition?.summary || '查阅八路军西安办事处纪念馆展览资料。'" :image="displayExhibition?.image || images.exhibitionHall" />
  <section class="section"><div class="shell exhibition-detail">
    <p v-if="loading" class="source-note">资料加载中…</p>
    <template v-else-if="displayExhibition">
      <p v-if="usingFallback" class="source-note">当前展示本地资料。</p>
      <img class="exhibition-detail__image" :src="displayExhibition.image" :alt="displayExhibition.title" @error="$event.target.src = images.exhibitionHall" />
      <div class="exhibition-detail__header"><div><p v-if="displayExhibition.category" class="eyebrow">{{ displayExhibition.category }}</p><h1>{{ displayExhibition.title }}</h1></div><p v-if="displayExhibition.dateText" class="exhibition-detail__dates">{{ displayExhibition.dateText }}</p></div>
      <p v-if="displayExhibition.summary" class="exhibition-detail__summary">{{ displayExhibition.summary }}</p>
      <p class="exhibition-detail__content">{{ displayExhibition.content }}</p>
      <p v-if="displayExhibition.sourceUrl" class="source-note">资料来源：{{ displayExhibition.sourceUrl }}</p>
    </template>
    <div v-else class="empty-state"><p>{{ errorMessage || '展览资料暂时无法加载' }}</p></div>
    <RouterLink class="button button--ghost exhibition-detail__back" to="/exhibitions">返回陈列展览</RouterLink>
  </div></section>
</template>

<style scoped>.exhibition-detail{max-width:880px}.exhibition-detail__image{width:100%;max-height:500px;aspect-ratio:16/9;background:var(--paper-dark);margin-bottom:34px}.exhibition-detail__header{display:flex;align-items:end;justify-content:space-between;gap:24px;border-bottom:1px solid var(--line);padding-bottom:22px}.exhibition-detail h1{font-size:clamp(2rem,4vw,3.4rem);line-height:1.2;margin:0}.exhibition-detail__dates{margin:0;color:var(--primary);white-space:nowrap}.exhibition-detail__summary{margin:28px 0 0;font-size:1.08rem;line-height:1.9;color:var(--ink)}.exhibition-detail__content{white-space:pre-wrap;margin:24px 0;line-height:2;color:var(--muted)}.exhibition-detail__back{margin-top:24px}@media(max-width:640px){.exhibition-detail__header{display:block}.exhibition-detail__dates{margin-top:14px}.exhibition-detail__image{margin-bottom:24px}}</style>

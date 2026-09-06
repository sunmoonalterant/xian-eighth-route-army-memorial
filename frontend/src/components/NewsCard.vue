<script setup>
import { toDisplayImageUrl } from '../utils/imageUrl.js'
defineProps({ item: { type: Object, required: true } })
</script>
<template>
  <article class="news-card"><img :src="toDisplayImageUrl(item.image)" :alt="item.title" /><div><p class="card-meta">{{ item.category }} · {{ item.date }}</p><h3>{{ item.title }}</h3><p>{{ item.summary }}</p><RouterLink :to="`/news/${item.id}`">阅读全文 →</RouterLink></div></article>
</template>

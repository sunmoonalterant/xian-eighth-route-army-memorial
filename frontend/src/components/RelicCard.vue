<script setup>
import { images } from '../data/imageAssets'
defineProps({ relic: { type: Object, required: true } })
const fallback = event => { event.target.src = images.relicObject }
</script>
<template>
  <article class="content-card relic-card"><img :src="relic.image" :alt="relic.name" @error="fallback" /><div class="content-card__body"><p v-if="relic.category || relic.era" class="card-meta">{{ [relic.category, relic.era].filter(Boolean).join(' · ') }}</p><h3>{{ relic.name }}</h3><p>{{ relic.summary }}</p><RouterLink :to="`/relic/${relic.id}`">查看详情 <span>→</span></RouterLink></div></article>
</template>

<script setup>
import { images } from '../data/imageAssets'
defineProps({ person: { type: Object, required: true } })
</script>
<template>
  <article class="person-card"><img :src="person.image || images.personPlaceholder" :alt="`${person.name}人物资料`" /><div><p class="eyebrow">历史人物</p><h3>{{ person.name }}</h3><p>{{ person.role || person.relation }}</p><p>{{ person.summary }}</p><RouterLink :to="`/person/${person.id}`">了解人物 →</RouterLink></div></article>
</template>

<script setup>
defineProps({ person: { type: Object, required: true } })
</script>
<template>
  <article class="person-card"><img :src="person.image" alt="资料整理中的人物档案占位图" /><div><p class="eyebrow">人物档案 · 演示</p><span class="tag">{{ person.status || '资料待核实' }}</span><h3>{{ person.name }}</h3><p>{{ person.summary }}</p><RouterLink :to="`/person/${person.id}`">了解人物 →</RouterLink></div></article>
</template>

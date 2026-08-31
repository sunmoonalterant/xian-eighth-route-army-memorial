<script setup>
defineProps({
  eyebrow: { type: String, default: '八路军西安办事处纪念馆' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
})
</script>

<template>
  <section class="page-hero" :style="image ? { backgroundImage: `url(${image})` } : {}">
    <div class="page-hero__shade" />
    <div class="shell page-hero__content">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
    </div>
  </section>
</template>

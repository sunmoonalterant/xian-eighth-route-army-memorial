<script setup>
defineProps({ events: { type: Array, required: true }, compact: { type: Boolean, default: false } })
</script>
<template>
  <div class="timeline" :class="{ 'timeline--compact': compact }">
    <article v-for="(event, index) in events" :key="event.id" class="timeline__item" :class="{ 'timeline__item--right': index % 2 }">
      <div class="timeline__year">{{ event.year }}</div><div class="timeline__dot" />
      <div class="timeline__content"><img v-if="!compact" :src="event.image" alt="历史资料演示图片" /><p class="card-meta">{{ event.date }}</p><h3>{{ event.title }}</h3><p>{{ event.description }}</p></div>
    </article>
  </div>
</template>

<script setup>
import { ElSkeleton, ElSkeletonItem } from 'element-plus'

defineProps({
  label: { type: String, required: true },
  value: { type: String, default: '0' },
  hint: { type: String, default: '' },
  loading: { type: Boolean, default: false },
})
</script>

<template>
  <article class="stat-card">
    <p class="stat-card__label">{{ label }}</p>
    <ElSkeleton v-if="loading" animated><template #template><ElSkeletonItem variant="h1" style="width:62%" /></template></ElSkeleton>
    <p v-else class="stat-card__value">{{ value }}</p>
    <p v-if="hint" class="stat-card__hint">{{ hint }}</p>
  </article>
</template>

<style scoped>
.stat-card{min-height:132px;padding:20px;background:var(--cream);border:1px solid var(--line);border-top:3px solid var(--primary)}.stat-card__label,.stat-card__hint{margin:0;color:var(--muted);font-size:.82rem}.stat-card__value{margin:14px 0 8px;color:var(--ink);font:700 2rem/1 Arial,sans-serif}.stat-card__hint{line-height:1.45}
</style>

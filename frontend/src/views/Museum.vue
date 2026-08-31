<script setup>
import PageHero from '../components/PageHero.vue'
import { museum } from '../data/museum'
import { images } from '../data/imageAssets'
</script>

<template>
  <PageHero title="走进纪念馆" description="从旧址空间与文化记忆进入参观叙事。" :image="museum.image" />
  <section class="section">
    <div class="shell museum-sections">
      <article v-for="(section, index) in museum.sections" :key="section.title" :class="{ reverse: index % 2 }">
        <img :src="section.image" :alt="section.title" @error="$event.target.src = images.courtyard" />
        <div>
          <p class="eyebrow">0{{ index + 1 }}</p>
          <h2>{{ section.title }}</h2>
          <div class="official-content" v-html="section.html"></div>
          <p class="source-note">资料来源：{{ museum.sourceName }}官方网站 · 采集时间：{{ museum.retrievedAt?.slice(0, 10) }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
<style scoped>.museum-sections{display:grid;gap:60px}.museum-sections article{display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:center;border-bottom:1px solid var(--line);padding-bottom:50px}.museum-sections article.reverse div{order:-1}.museum-sections img{width:100%;aspect-ratio:4/3;background:#e3ddd1}.museum-sections h2{margin:0 0 16px}.museum-sections p{line-height:1.9;color:var(--muted)}@media(max-width:768px){.museum-sections article{grid-template-columns:1fr;gap:20px}.museum-sections article.reverse div{order:0}}</style>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import siteLogo from '../assets/reference/xabb/site-logo.png'

const menuOpen = ref(false)
const scrolled = ref(false)
const navItems = [
  { label: '首页', to: '/' }, { label: '走进纪念馆', to: '/museum' },
  { label: '峥嵘岁月', to: '/history' }, { label: '馆藏文物', to: '/relics' },
  { label: '历史人物', to: '/people' }, { label: '陈列展览', to: '/exhibitions' },
  { label: '数字纪念馆', to: '/digital-museum' }, { label: '新闻活动', to: '/news' },
  { label: '参观服务', to: '/visit' },
]
const reservationItem = { label: '在线预约', to: '/reservation' }
const updateHeader = () => { scrolled.value = window.scrollY > 12 }
const closeMenu = () => { menuOpen.value = false }

onMounted(() => window.addEventListener('scroll', updateHeader, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', updateHeader))
</script>

<template>
  <header class="site-header" :class="{ 'site-header--scrolled': scrolled }">
    <div class="shell site-header__inner">
      <RouterLink class="brand" to="/" @click="closeMenu">
        <img :src="siteLogo" alt="八路军西安办事处纪念馆" />
      </RouterLink>
      <button class="menu-button" type="button" :aria-expanded="menuOpen" aria-label="打开导航菜单" @click="menuOpen = !menuOpen"><span /><span /><span /></button>
      <nav class="desktop-nav" aria-label="主导航">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to">{{ item.label }}</RouterLink>
        <RouterLink class="reservation-link" :to="reservationItem.to">{{ reservationItem.label }}</RouterLink>
        <RouterLink class="search-link" to="/search" aria-label="搜索">⌕</RouterLink>
      </nav>
    </div>
    <nav v-if="menuOpen" class="mobile-nav" aria-label="移动端主导航">
      <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" @click="closeMenu">{{ item.label }}</RouterLink>
      <RouterLink :to="reservationItem.to" @click="closeMenu">{{ reservationItem.label }}</RouterLink>
      <RouterLink to="/search" @click="closeMenu">搜索</RouterLink>
    </nav>
  </header>
</template>

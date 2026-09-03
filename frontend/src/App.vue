<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
const isAdminPage = computed(() => route.path.startsWith('/admin'))
</script>
<template><Header v-if="!isAdminPage" /><main :class="{ 'admin-app-main': isAdminPage }"><RouterView /></main><Footer v-if="!isAdminPage" /></template>

<style scoped>.admin-app-main{min-height:100vh}</style>

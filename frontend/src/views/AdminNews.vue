<script setup>import AdminContentManager from '../components/AdminContentManager.vue'; import * as api from '../api/adminNews.js'</script>
<template><AdminContentManager title="新闻管理" eyebrow="ARTICLE MANAGEMENT" :api="api" type="article" categories published media /></template>

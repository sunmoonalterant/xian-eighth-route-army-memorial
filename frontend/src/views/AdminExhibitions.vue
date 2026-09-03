<script setup>import AdminContentManager from '../components/AdminContentManager.vue'; import * as api from '../api/adminExhibitions.js'</script>
<template><AdminContentManager title="展览管理" eyebrow="EXHIBITION MANAGEMENT" :api="api" type="exhibition" dates /></template>

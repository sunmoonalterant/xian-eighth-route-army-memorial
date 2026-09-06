<script setup>import AdminContentManager from '../components/AdminContentManager.vue'; import * as api from '../api/adminRelics.js'</script>
<template><AdminContentManager title="文物管理" eyebrow="RELIC MANAGEMENT" :api="api" type="relic" categories era media /></template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElButton, ElMenu, ElMenuItem } from 'element-plus'
import 'element-plus/dist/index.css'
import { adminSession, clearAdminSession } from '../stores/adminSession.js'

const router = useRouter()
const route = useRoute()
const displayName = computed(() => adminSession.admin?.displayName || adminSession.admin?.username || '管理员')

function logout() {
  clearAdminSession()
  router.replace('/admin/login')
}
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <RouterLink class="admin-brand" to="/admin/dashboard">
        <span>八路军西安办事处纪念馆</span>
        <small>运营管理后台</small>
      </RouterLink>
      <ElMenu class="admin-menu" router :default-active="route.path">
        <ElMenuItem index="/admin/dashboard">数据总览</ElMenuItem>
        <ElMenuItem index="/admin/reservations">预约管理</ElMenuItem>
        <ElMenuItem index="/admin/relics">文物管理</ElMenuItem>
        <ElMenuItem index="/admin/news">新闻管理</ElMenuItem>
        <ElMenuItem index="/admin/exhibitions">展览管理</ElMenuItem>
        <ElMenuItem index="/admin/people">人物管理</ElMenuItem>
        <ElMenuItem index="/admin/history">历史管理</ElMenuItem>
        <ElMenuItem index="/admin/digital-museum">数字纪念馆</ElMenuItem>
      </ElMenu>
    </aside>
    <section class="admin-main">
      <header class="admin-topbar">
        <p>{{ route.path === '/admin/dashboard' ? '数据总览' : '预约运营管理' }}</p>
        <div><span>{{ displayName }}</span><ElButton text @click="logout">退出登录</ElButton></div>
      </header>
      <div class="admin-content"><RouterView /></div>
    </section>
  </div>
</template>

<style scoped>
.admin-layout{min-height:calc(100vh - var(--header-height,72px));display:grid;grid-template-columns:240px minmax(0,1fr);background:#eee8dc}.admin-sidebar{padding:26px 16px;background:var(--primary-dark);color:#fff}.admin-brand{display:block;padding:0 12px 26px;border-bottom:1px solid rgba(255,255,255,.22);font-size:1rem;font-weight:700;line-height:1.45}.admin-brand small{display:block;margin-top:6px;font:normal .68rem Arial,sans-serif;letter-spacing:.12em;color:#eacb94}.admin-menu{margin-top:20px;border-right:0;background:transparent}.admin-menu :deep(.el-menu-item){color:#f8ecdc;border-left:3px solid transparent}.admin-menu :deep(.el-menu-item:hover),.admin-menu :deep(.el-menu-item.is-active){background:rgba(255,255,255,.12);color:#fff;border-left-color:#d9ad69}.admin-main{min-width:0}.admin-topbar{height:72px;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:0 34px;background:var(--cream);border-bottom:1px solid var(--line)}.admin-topbar p{margin:0;font-size:1.12rem;font-weight:700}.admin-topbar>div{display:flex;align-items:center;gap:12px;color:var(--muted);font-size:.86rem}.admin-topbar :deep(.el-button){color:var(--primary)}.admin-content{padding:32px}@media(max-width:760px){.admin-layout{grid-template-columns:minmax(0,1fr)}.admin-sidebar{min-width:0;padding:15px 16px}.admin-brand{padding:0 0 12px}.admin-menu{margin-top:10px;display:flex;overflow-x:auto}.admin-menu :deep(.el-menu-item){height:42px;line-height:42px;flex:0 0 auto}.admin-topbar{height:60px;padding:0 18px}.admin-content{padding:20px 16px}}
</style>

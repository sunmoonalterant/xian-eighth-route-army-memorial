<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../api/adminAuth.js'
import { setAdminSession } from '../stores/adminSession.js'

const router = useRouter()
const route = useRoute()
const form = reactive({ username: '', password: '' })
const errorMessage = ref('')
const isSubmitting = ref(false)

async function submitLogin() {
  errorMessage.value = ''
  if (!form.username.trim() || !form.password) {
    errorMessage.value = '请输入用户名和密码。'
    return
  }

  isSubmitting.value = true
  try {
    const result = await login({ username: form.username.trim(), password: form.password })
    setAdminSession({ token: result.token, admin: result.admin })
    const destination = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/admin')
      ? route.query.redirect
      : '/admin/reservations'
    router.replace(destination)
  } catch (error) {
    errorMessage.value = error.status === 401 ? '用户名或密码不正确。' : '登录服务暂时不可用，请稍后重试。'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="admin-login">
    <section class="admin-login__card" aria-labelledby="admin-login-title">
      <p class="eyebrow">MEMORIAL ADMINISTRATION</p>
      <h1 id="admin-login-title">运营管理后台</h1>
      <p class="admin-login__intro">仅限授权管理员登录，用于查看和处理参观预约。</p>
      <form class="admin-login__form" @submit.prevent="submitLogin">
        <label>用户名<input v-model.trim="form.username" autocomplete="username" placeholder="请输入用户名" /></label>
        <label>密码<input v-model="form.password" type="password" autocomplete="current-password" placeholder="请输入密码" /></label>
        <p v-if="errorMessage" class="admin-error" role="alert">{{ errorMessage }}</p>
        <button class="button" type="submit" :disabled="isSubmitting">{{ isSubmitting ? '正在登录…' : '登录后台' }}</button>
      </form>
      <RouterLink class="admin-login__back" to="/">← 返回游客前台</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.admin-login{min-height:calc(100vh - var(--header-height,72px));display:grid;place-items:center;padding:48px 20px;background:linear-gradient(135deg,#eee6d9,#f8f5ee)}.admin-login__card{width:min(100%,440px);padding:42px;background:var(--cream);border-top:4px solid var(--primary);box-shadow:0 16px 36px rgba(45,41,38,.12)}.admin-login h1{margin:0;color:var(--ink);font-size:2rem}.admin-login__intro{margin:15px 0 28px;color:var(--muted);line-height:1.75}.admin-login__form label{display:block;margin-bottom:17px;color:var(--ink);font-size:.9rem}.admin-login__form input{width:100%;margin-top:8px;padding:12px;border:1px solid var(--brick);background:#fffdf9;font:inherit}.admin-login__form .button{width:100%;margin-top:8px}.admin-error{margin:0 0 15px;color:#9b2020;font-size:.86rem}.admin-login__back{display:inline-block;margin-top:24px;color:var(--primary);font-size:.88rem}@media(max-width:480px){.admin-login{padding:28px 16px}.admin-login__card{padding:32px 24px}}
</style>

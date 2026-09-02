<script setup>
import { computed, ref } from 'vue'
import PageHero from '../components/PageHero.vue'
import { cancelReservation, queryReservation } from '../api/reservations.js'
import { images } from '../data/imageAssets'
import {
  canCancelReservation,
  getReservationErrorMessage,
  getReservationStatusLabel,
} from '../utils/reservationFlow'

const query = ref({ reservationNo: '', phone: '' })
const result = ref(null)
const errorMessage = ref('')
const isLoading = ref(false)
const isCancelling = ref(false)
const showCancelConfirm = ref(false)
const canCancel = computed(() => result.value && canCancelReservation(result.value.status))

async function searchReservation() {
  const reservationNo = query.value.reservationNo.trim()
  const phone = query.value.phone.trim()
  errorMessage.value = ''
  result.value = null
  showCancelConfirm.value = false
  if (!reservationNo || !phone) {
    errorMessage.value = '请输入预约编号和手机号。'
    return
  }

  isLoading.value = true
  try {
    result.value = await queryReservation({ reservationNo, phone })
  } catch (error) {
    errorMessage.value = getReservationErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

async function confirmCancel() {
  if (!result.value || isCancelling.value) return
  isCancelling.value = true
  errorMessage.value = ''
  try {
    await cancelReservation(result.value.reservationNo, query.value.phone.trim())
    showCancelConfirm.value = false
    await searchReservation()
  } catch (error) {
    errorMessage.value = getReservationErrorMessage(error)
  } finally {
    isCancelling.value = false
  }
}
</script>

<template>
  <PageHero title="预约查询" description="根据预约编号与手机号查询参观预约。" :image="images.courtyard" />
  <section class="section">
    <div class="shell query-shell">
      <form class="form-card query-form" @submit.prevent="searchReservation">
        <label>预约编号<input v-model.trim="query.reservationNo" placeholder="请输入预约编号" autocomplete="off" /></label>
        <label>手机号<input v-model.trim="query.phone" inputmode="numeric" placeholder="请输入11位手机号" autocomplete="tel" /></label>
        <button class="button" :disabled="isLoading">{{ isLoading ? '正在查询…' : '查询预约' }}</button>
      </form>

      <p v-if="errorMessage" class="field-error query-error">{{ errorMessage }}</p>
      <article v-if="result" class="form-card query-result">
        <p class="eyebrow">RESERVATION DETAIL</p>
        <h2>预约信息</h2>
        <dl class="result-list">
          <div><dt>预约编号</dt><dd>{{ result.reservationNo }}</dd></div>
          <div><dt>预约人</dt><dd>{{ result.name }}</dd></div>
          <div><dt>手机号</dt><dd>{{ result.phone }}</dd></div>
          <div><dt>参观日期</dt><dd>{{ result.visitDate }}</dd></div>
          <div><dt>参观时段</dt><dd>{{ result.periodLabel || result.period || '时段待确认' }}</dd></div>
          <div><dt>预约人数</dt><dd>{{ result.peopleCount }} 人</dd></div>
          <div><dt>预约状态</dt><dd>{{ getReservationStatusLabel(result.status) }}</dd></div>
          <div><dt>提交时间</dt><dd>{{ result.createdAt || '待确认' }}</dd></div>
        </dl>
        <p v-if="canCancel" class="form-hint">如行程有变，可取消尚未使用的预约；取消后名额将释放回该时段。</p>
        <div v-if="canCancel && !showCancelConfirm" class="query-actions"><button class="button button--ghost" type="button" @click="showCancelConfirm = true">取消预约</button></div>
        <div v-else-if="showCancelConfirm" class="cancel-confirm">
          <p>确定取消此预约吗？取消后不可恢复。</p>
          <div class="query-actions"><button class="button" type="button" :disabled="isCancelling" @click="confirmCancel">{{ isCancelling ? '正在取消…' : '确认取消' }}</button><button class="button button--ghost" type="button" :disabled="isCancelling" @click="showCancelConfirm = false">暂不取消</button></div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.query-shell{max-width:800px}.query-form{display:grid;grid-template-columns:1fr 1fr auto;gap:16px;align-items:end;max-width:none}.query-form label{margin:0}.query-error{margin:20px 0}.query-result{margin-top:28px}.query-result h2{margin-top:0}.result-list{margin:24px 0;border-top:1px solid var(--line)}.result-list div{display:flex;justify-content:space-between;gap:20px;padding:13px 0;border-bottom:1px solid var(--line)}.result-list dt{color:var(--muted)}.result-list dd{margin:0;font-weight:600}.query-actions{display:flex;gap:12px;margin-top:20px}.cancel-confirm{margin-top:20px;padding:18px;border-left:3px solid var(--primary);background:#f6eee2}.cancel-confirm p{margin:0;color:var(--ink)}.field-error{display:block;color:#9b2020;font-size:.85rem}.form-hint{color:var(--muted);line-height:1.7}@media(max-width:680px){.query-form{grid-template-columns:1fr}.query-form .button{width:100%}.result-list div{display:block}.result-list dd{margin-top:5px}.query-actions{flex-direction:column}.query-actions .button{width:100%}}
</style>

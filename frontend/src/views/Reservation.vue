<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHero from '../components/PageHero.vue'
import { createReservation, getVisitSchedules } from '../api/reservations.js'
import { reservationSteps } from '../data/reservation'
import { images } from '../data/imageAssets'
import { setReservationResult } from '../stores/reservationResult'
import {
  canSelectSchedule,
  buildReservationResult,
  createSubmissionLock,
  getReservationErrorMessage,
  makeReservationPayload,
  validateLiveReservation,
} from '../utils/reservationFlow'

const router = useRouter()
const today = new Date().toISOString().slice(0, 10)
const selectedSlotId = ref('')
const agreed = ref(false)
const errors = ref({})
const stage = ref(1)
const schedules = ref([])
const isLoadingSchedules = ref(false)
const scheduleError = ref('')
const submitError = ref('')
const isSubmitting = ref(false)
const submissionLock = createSubmissionLock()
const form = ref({ date: '', peopleCount: 1, name: '', phone: '', idCard: '' })

const selectedSlot = computed(() => schedules.value.find((slot) => String(slot.id) === selectedSlotId.value))
const remaining = computed(() => Number(selectedSlot.value?.remaining || 0))
const slotLabel = (slot) => slot.periodLabel || slot.label || slot.period || '时段待确认'

async function loadSchedules(date) {
  schedules.value = []
  selectedSlotId.value = ''
  scheduleError.value = ''
  if (!date) return

  isLoadingSchedules.value = true
  try {
    schedules.value = await getVisitSchedules(date)
  } catch (error) {
    scheduleError.value = getReservationErrorMessage(error)
  } finally {
    isLoadingSchedules.value = false
  }
}

function selectSlot(slot) {
  if (!canSelectSchedule(slot)) return
  selectedSlotId.value = String(slot.id)
  if (form.value.peopleCount > Number(slot.remaining)) form.value.peopleCount = Number(slot.remaining)
  stage.value = 2
  errors.value = { ...errors.value, slot: undefined, peopleCount: undefined }
}

function continueToConfirm() {
  const nextErrors = validateLiveReservation(form.value)
  if (!form.value.date) nextErrors.date = '请选择参观日期'
  if (!selectedSlot.value) nextErrors.slot = '请选择可预约时段'
  if (selectedSlot.value && form.value.peopleCount > remaining.value) {
    nextErrors.peopleCount = '预约人数不能超过当前剩余名额'
  }
  if (!agreed.value) nextErrors.agreed = '请先阅读并确认预约须知'
  errors.value = nextErrors
  if (Object.keys(nextErrors).length === 0) stage.value = 3
}

async function submitReservation() {
  if (!selectedSlot.value || !submissionLock.tryEnter()) return
  submitError.value = ''
  isSubmitting.value = true
  try {
    const result = await createReservation(makeReservationPayload(form.value, selectedSlot.value))
    setReservationResult(buildReservationResult(result, selectedSlot.value))
    stage.value = 4
    router.push('/reservation/result')
  } catch (error) {
    submitError.value = getReservationErrorMessage(error)
  } finally {
    submissionLock.leave()
    isSubmitting.value = false
  }
}

watch(() => form.value.date, (date) => {
  errors.value = { ...errors.value, date: undefined, slot: undefined }
  loadSchedules(date)
})
</script>

<template>
  <PageHero title="在线预约" description="请在可预约日期选择时段并填写信息，预约记录由服务端处理。" :image="images.courtyard" />
  <section class="section">
    <div class="shell reservation-shell">
      <div class="notice">预约信息仅用于本次预约请求，不会保存在浏览器本地；请勿在公共设备上泄露个人信息。</div>
      <ol class="reservation-steps" aria-label="预约流程">
        <li v-for="(step, index) in reservationSteps" :key="step" :class="{ 'is-active': stage === index + 1, 'is-complete': stage > index + 1 }"><span>{{ index + 1 }}</span>{{ step }}</li>
      </ol>

      <form v-if="stage < 3" class="form-card reservation-form" @submit.prevent="continueToConfirm">
        <fieldset>
          <legend><span>01</span> 选择参观时间</legend>
          <label>参观日期<input v-model="form.date" type="date" :min="today" required /><small v-if="errors.date" class="field-error">{{ errors.date }}</small></label>
          <div v-if="form.date" class="slot-area">
            <p v-if="isLoadingSchedules" class="form-hint">正在查询可预约时段…</p>
            <p v-else-if="scheduleError" class="field-error">{{ scheduleError }}</p>
            <div v-else-if="schedules.length" class="slot-grid" aria-label="可选择的预约时段">
              <button v-for="slot in schedules" :key="slot.id" type="button" class="slot-card" :disabled="!canSelectSchedule(slot)" :class="{ 'is-selected': selectedSlotId === String(slot.id), 'is-disabled': !canSelectSchedule(slot) }" @click="selectSlot(slot)">
                <span>{{ slot.period === 'morning' ? '上午' : slot.period === 'afternoon' ? '下午' : '参观时段' }}</span>
                <strong>{{ slotLabel(slot) }}</strong>
                <small>总名额 {{ slot.capacity }} 人 · 已预约 {{ slot.reservedCount }} 人</small>
                <small :class="{ 'slot-full': !canSelectSchedule(slot) }">{{ canSelectSchedule(slot) ? `剩余 ${slot.remaining} 人` : '当前时段已约满' }}</small>
              </button>
            </div>
            <p v-else class="form-hint">该日期暂无可预约时段，请选择其他日期。</p>
          </div>
          <small v-else class="form-hint">请先选择日期，再选择参观时段。</small>
          <small v-if="errors.slot" class="field-error">{{ errors.slot }}</small>
        </fieldset>

        <fieldset :disabled="!selectedSlot">
          <legend><span>02</span> 填写预约信息</legend>
          <p class="form-hint">姓名、手机号和身份证号仅随本次请求发送，不会写入浏览器存储。</p>
          <label>预约人数<input v-model.number="form.peopleCount" type="number" min="1" :max="Math.min(5, remaining || 1)" /><small v-if="selectedSlot">当前时段剩余 {{ remaining }} 人</small><small v-if="errors.peopleCount" class="field-error">{{ errors.peopleCount }}</small></label>
          <label>预约人姓名<input v-model.trim="form.name" placeholder="请输入姓名" autocomplete="name" /><small v-if="errors.name" class="field-error">{{ errors.name }}</small></label>
          <label>手机号<input v-model.trim="form.phone" inputmode="numeric" placeholder="请输入11位手机号" autocomplete="tel" /><small v-if="errors.phone" class="field-error">{{ errors.phone }}</small></label>
          <label>身份证号<input v-model.trim="form.idCard" placeholder="请输入18位身份证号" autocomplete="off" /><small v-if="errors.idCard" class="field-error">{{ errors.idCard }}</small></label>
          <label class="agreement"><input v-model="agreed" type="checkbox" />我已阅读预约须知并同意提交本次预约</label><small v-if="errors.agreed" class="field-error">{{ errors.agreed }}</small>
        </fieldset>
        <button class="button" type="submit">进入确认预约 <span>→</span></button>
      </form>

      <article v-else class="form-card confirmation-card">
        <p class="eyebrow">RESERVATION CONFIRMATION</p>
        <h2>确认预约信息</h2>
        <p>预约日期：{{ form.date }} · {{ slotLabel(selectedSlot) }} · {{ form.peopleCount }} 人</p>
        <div class="notice">确认后将向预约服务提交本次信息。系统不会在浏览器本地保存姓名、手机号或身份证号。</div>
        <p v-if="submitError" class="field-error submit-error">{{ submitError }}</p>
        <div class="confirmation-actions">
          <button class="button" type="button" :disabled="isSubmitting" @click="submitReservation">{{ isSubmitting ? '正在提交…' : '确认预约' }}</button>
          <button class="button button--ghost" type="button" :disabled="isSubmitting" @click="stage = 2">返回修改</button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.reservation-shell{max-width:900px}.reservation-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:0;margin:30px 0;list-style:none}.reservation-steps li{position:relative;display:flex;align-items:center;gap:9px;color:var(--muted);font-size:.86rem}.reservation-steps li:not(:last-child):after{content:"";position:absolute;top:16px;left:34px;right:-5px;height:1px;background:var(--line);z-index:0}.reservation-steps span{position:relative;z-index:1;width:32px;height:32px;display:grid;place-items:center;border:1px solid var(--line);border-radius:50%;background:var(--paper);color:var(--muted)}.reservation-steps .is-active,.reservation-steps .is-complete{color:var(--primary)}.reservation-steps .is-active span,.reservation-steps .is-complete span{border-color:var(--primary);background:var(--primary);color:#fff}.reservation-form{max-width:none}.reservation-form fieldset{border:0;padding:0;margin:0 0 30px}.reservation-form fieldset:disabled{opacity:.5}.reservation-form legend{font-size:1.25rem;margin-bottom:18px}.reservation-form legend span{font:700 .78rem Arial,sans-serif;color:var(--primary);letter-spacing:.1em}.form-hint{display:block;margin:-4px 0 15px;color:var(--muted);font-size:.82rem;line-height:1.6}.slot-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin:4px 0 18px}.slot-card{text-align:left;padding:18px;border:1px solid var(--line);background:#fffdf9;cursor:pointer;transition:border-color .2s,background .2s}.slot-card span,.slot-card strong,.slot-card small{display:block}.slot-card span{color:var(--primary);font-size:.82rem;margin-bottom:6px}.slot-card strong{color:var(--ink);font-size:1.1rem}.slot-card small{margin-top:7px;color:var(--muted)}.slot-card:hover,.slot-card.is-selected{border-color:var(--primary);background:#f6eee2}.slot-card:disabled{cursor:not-allowed}.slot-card.is-disabled{opacity:.62;background:#f4f0e9}.slot-full{color:#9b2020!important}.agreement{display:flex!important;align-items:center;gap:8px}.agreement input{width:auto!important;margin:0!important}.field-error{display:block;margin:-12px 0 13px;color:#9b2020;font-size:.8rem}.confirmation-card{max-width:680px;margin:auto}.confirmation-card h2{margin-top:0}.confirmation-card>p{color:var(--muted);line-height:1.8}.confirmation-actions{display:flex;gap:12px;margin-top:24px}.submit-error{margin:18px 0 0}@media(max-width:768px){.reservation-steps{grid-template-columns:1fr 1fr;row-gap:18px}.reservation-steps li:not(:last-child):after{display:none}.slot-grid{grid-template-columns:1fr}.confirmation-actions{flex-direction:column}.confirmation-actions .button{width:100%}}@media(max-width:420px){.reservation-steps{font-size:.76rem;gap:9px}.reservation-steps li{gap:6px}.reservation-steps span{width:28px;height:28px}}
</style>

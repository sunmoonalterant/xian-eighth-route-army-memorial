<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHero from '../components/PageHero.vue'
import { getRemaining, reservationDemo, reservationSteps, validateReservation } from '../data/reservation'
import { images } from '../data/imageAssets'

const router = useRouter()
const selectedSlotId = ref('')
const agreed = ref(false)
const errors = ref({})
const stage = ref(1)
const form = ref({ date: '', count: 1, name: '', phone: '', idCard: '' })
const slots = computed(() => [reservationDemo.morning, reservationDemo.afternoon])
const selectedSlot = computed(() => slots.value.find((slot) => slot.id === selectedSlotId.value))
const remaining = computed(() => (selectedSlot.value ? getRemaining(selectedSlot.value) : 0))

function selectSlot(slot) {
  selectedSlotId.value = slot.id
  if (form.value.count > getRemaining(slot)) form.value.count = getRemaining(slot)
  stage.value = 2
  errors.value = { ...errors.value, slot: undefined }
}

function continueToConfirm() {
  const nextErrors = validateReservation({ ...form.value, remaining: remaining.value, agreed: agreed.value })
  if (!form.value.date) nextErrors.date = '请选择参观日期'
  if (!selectedSlot.value) nextErrors.slot = '请选择参观时段'
  errors.value = nextErrors
  if (Object.keys(nextErrors).length === 0) stage.value = 3
}

function completeDemo() {
  stage.value = 4
  router.push('/reservation/result')
}

watch(() => form.value.date, () => { errors.value = { ...errors.value, date: undefined } })
</script>

<template>
  <PageHero title="在线预约" description="预约流程界面演示：本阶段不提交或存储个人信息。" :image="images.courtyard" />
  <section class="section">
    <div class="shell reservation-shell">
      <div class="notice">{{ reservationDemo.notice }}</div>
      <ol class="reservation-steps" aria-label="预约流程">
        <li v-for="(step, index) in reservationSteps" :key="step" :class="{ 'is-active': stage === index + 1, 'is-complete': stage > index + 1 }"><span>{{ index + 1 }}</span>{{ step }}</li>
      </ol>
      <form v-if="stage < 3" class="form-card reservation-form" @submit.prevent="continueToConfirm">
        <fieldset>
          <legend><span>01</span> 选择参观时间</legend>
          <label>参观日期<input v-model="form.date" type="date" required /><small v-if="errors.date" class="field-error">{{ errors.date }}</small></label>
          <div v-if="form.date" class="slot-grid" aria-label="可选择的预约时段">
            <button v-for="slot in slots" :key="slot.id" type="button" class="slot-card" :class="{ 'is-selected': selectedSlotId === slot.id }" @click="selectSlot(slot)"><span>{{ slot.title }}</span><strong>{{ slot.label }}</strong><small>剩余 {{ getRemaining(slot) }} 人（模拟）</small></button>
          </div>
          <small v-else class="form-hint">请先选择日期，再选择参观时段。</small>
          <small v-if="errors.slot" class="field-error">{{ errors.slot }}</small>
        </fieldset>
        <fieldset :disabled="!selectedSlot">
          <legend><span>02</span> 填写预约信息</legend>
          <p class="form-hint">以下字段仅用于验证演示，不会提交或保存。</p>
          <label>预约人数<input v-model.number="form.count" type="number" min="1" :max="remaining || 1" /><small v-if="selectedSlot">当前时段剩余 {{ remaining }} 人（模拟）</small><small v-if="errors.count" class="field-error">{{ errors.count }}</small></label>
          <label>预约人姓名<input v-model.trim="form.name" placeholder="仅作界面演示" autocomplete="off" /><small v-if="errors.name" class="field-error">{{ errors.name }}</small></label>
          <label>手机号<input v-model.trim="form.phone" inputmode="numeric" placeholder="仅作界面演示" autocomplete="off" /><small v-if="errors.phone" class="field-error">{{ errors.phone }}</small></label>
          <label>身份证号（演示字段）<input v-model.trim="form.idCard" placeholder="仅作格式验证，不保存" autocomplete="off" /><small v-if="errors.idCard" class="field-error">{{ errors.idCard }}</small></label>
          <label class="agreement"><input v-model="agreed" type="checkbox" />我已阅读预约须知（演示）</label><small v-if="errors.agreed" class="field-error">{{ errors.agreed }}</small>
        </fieldset>
        <button class="button" type="submit">进入确认预约 <span>→</span></button>
      </form>
      <article v-else class="form-card confirmation-card">
        <p class="eyebrow">RESERVATION DEMO</p>
        <h2>{{ stage === 3 ? '确认预约信息' : '预约完成' }}</h2>
        <p>预约日期：{{ form.date }} · {{ selectedSlot?.title }} {{ selectedSlot?.label }} · {{ form.count }} 人</p>
        <div class="notice">本阶段不会提交或保存姓名、手机号、身份证号等任何个人数据。</div>
        <div class="confirmation-actions"><button v-if="stage === 3" class="button" type="button" @click="completeDemo">确认预约演示</button><button v-if="stage === 3" class="button button--ghost" type="button" @click="stage = 2">返回修改</button></div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.reservation-shell{max-width:900px}.reservation-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:0;margin:30px 0;list-style:none}.reservation-steps li{position:relative;display:flex;align-items:center;gap:9px;color:var(--muted);font-size:.86rem}.reservation-steps li:not(:last-child):after{content:"";position:absolute;top:16px;left:34px;right:-5px;height:1px;background:var(--line);z-index:0}.reservation-steps span{position:relative;z-index:1;width:32px;height:32px;display:grid;place-items:center;border:1px solid var(--line);border-radius:50%;background:var(--paper);color:var(--muted)}.reservation-steps .is-active,.reservation-steps .is-complete{color:var(--primary)}.reservation-steps .is-active span,.reservation-steps .is-complete span{border-color:var(--primary);background:var(--primary);color:#fff}.reservation-form{max-width:none}.reservation-form fieldset{border:0;padding:0;margin:0 0 30px}.reservation-form fieldset:disabled{opacity:.5}.reservation-form legend{font-size:1.25rem;margin-bottom:18px}.reservation-form legend span{font:700 .78rem Arial,sans-serif;color:var(--primary);letter-spacing:.1em}.form-hint{display:block;margin:-4px 0 15px;color:var(--muted);font-size:.82rem;line-height:1.6}.slot-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin:4px 0 18px}.slot-card{text-align:left;padding:18px;border:1px solid var(--line);background:#fffdf9;cursor:pointer;transition:border-color .2s,background .2s}.slot-card span,.slot-card strong,.slot-card small{display:block}.slot-card span{color:var(--primary);font-size:.82rem;margin-bottom:6px}.slot-card strong{color:var(--ink);font-size:1.1rem}.slot-card small{margin-top:7px;color:var(--muted)}.slot-card:hover,.slot-card.is-selected{border-color:var(--primary);background:#f6eee2}.agreement{display:flex!important;align-items:center;gap:8px}.agreement input{width:auto!important;margin:0!important}.field-error{display:block;margin:-12px 0 13px;color:#9b2020;font-size:.8rem}.confirmation-card{max-width:680px;margin:auto}.confirmation-card h2{margin-top:0}.confirmation-card>p{color:var(--muted);line-height:1.8}.confirmation-actions{display:flex;gap:12px;margin-top:24px}@media(max-width:768px){.reservation-steps{grid-template-columns:1fr 1fr;row-gap:18px}.reservation-steps li:not(:last-child):after{display:none}.slot-grid{grid-template-columns:1fr}.confirmation-actions{flex-direction:column}.confirmation-actions .button{width:100%}}@media(max-width:420px){.reservation-steps{font-size:.76rem;gap:9px}.reservation-steps li{gap:6px}.reservation-steps span{width:28px;height:28px}}
</style>

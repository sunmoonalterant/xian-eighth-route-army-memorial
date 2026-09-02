<script setup>
import PageHero from '../components/PageHero.vue'
import { images } from '../data/imageAssets'
import { reservationResult } from '../stores/reservationResult'
import { getReservationStatusLabel } from '../utils/reservationFlow'
</script>

<template>
  <PageHero title="预约结果" description="查看本次提交的预约结果摘要。" :image="images.courtyard" />
  <section class="section">
    <div class="shell">
      <article v-if="reservationResult" class="form-card result-card">
        <p class="eyebrow">RESERVATION SUBMITTED</p>
        <h2>预约已提交</h2>
        <p class="result-intro">请记下预约编号，后续可使用预约编号和手机号查询状态。</p>
        <dl class="result-list">
          <div><dt>预约编号</dt><dd>{{ reservationResult.reservationNo }}</dd></div>
          <div><dt>参观日期</dt><dd>{{ reservationResult.visitDate }}</dd></div>
          <div><dt>参观时段</dt><dd>{{ reservationResult.periodLabel || reservationResult.period || '时段待确认' }}</dd></div>
          <div><dt>预约人数</dt><dd>{{ reservationResult.peopleCount }} 人</dd></div>
          <div><dt>预约状态</dt><dd>{{ getReservationStatusLabel(reservationResult.status) }}</dd></div>
        </dl>
        <div class="notice">本页不展示或保存手机号、身份证号等个人信息。刷新页面后，请使用预约查询功能获取记录。</div>
        <div class="result-actions"><RouterLink class="button" to="/reservation/query">查询预约</RouterLink><RouterLink class="button button--ghost" to="/">返回首页</RouterLink></div>
      </article>
      <article v-else class="form-card result-card">
        <p class="eyebrow">RESERVATION RESULT</p>
        <h2>暂未找到本次预约摘要</h2>
        <p class="result-intro">预约结果摘要已失效，请使用预约编号和手机号在预约查询页面查询。</p>
        <div class="result-actions"><RouterLink class="button" to="/reservation/query">查询预约</RouterLink><RouterLink class="button button--ghost" to="/reservation">返回预约</RouterLink></div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.result-card{max-width:680px;margin:auto;text-align:center}.result-intro{color:var(--muted);line-height:1.8}.result-list{margin:28px 0;text-align:left;border-top:1px solid var(--line)}.result-list div{display:flex;justify-content:space-between;gap:20px;padding:14px 0;border-bottom:1px solid var(--line)}.result-list dt{color:var(--muted)}.result-list dd{margin:0;color:var(--ink);font-weight:600}.result-actions{display:flex;justify-content:center;gap:12px;margin-top:24px}@media(max-width:640px){.result-list div{display:block}.result-list dd{margin-top:5px}.result-actions{flex-direction:column}.result-actions .button{width:100%}}
</style>

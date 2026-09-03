<script setup>
import { onMounted, reactive, ref } from 'vue'
import {
  ElButton,
  ElDatePicker,
  ElDialog,
  ElEmpty,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus'
import { getById, getList, updateStatus } from '../api/adminReservations.js'
import { adminStatusLabels, availableAdminActions, buildAdminReservationParams, getAdminStatusLabel } from '../utils/adminReservationFlow.js'

const filters = reactive({ page: 1, pageSize: 10, keyword: '', status: '', visitDate: '' })
const rows = ref([])
const total = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')
const detail = ref(null)
const detailVisible = ref(false)
const isDetailLoading = ref(false)
const pendingStatus = ref('')
const statusConfirmVisible = ref(false)
const isUpdating = ref(false)

const statusTheme = { PENDING: 'warning', SUCCESS: 'success', CANCELLED: 'info', CHECKED_IN: '', EXPIRED: 'danger' }
const formatStatus = (status) => getAdminStatusLabel(status)
const statusActions = (status) => availableAdminActions(status)

async function loadReservations() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const result = await getList(buildAdminReservationParams(filters))
    rows.value = result.list || []
    total.value = Number(result.total || 0)
  } catch (error) {
    errorMessage.value = '预约列表暂时无法加载，请稍后重试。'
  } finally {
    isLoading.value = false
  }
}

function search() {
  filters.page = 1
  loadReservations()
}

function resetFilters() {
  Object.assign(filters, { page: 1, pageSize: 10, keyword: '', status: '', visitDate: '' })
  loadReservations()
}

function changePage(page) {
  filters.page = page
  loadReservations()
}

async function openDetail(row) {
  detailVisible.value = true
  detail.value = null
  pendingStatus.value = ''
  isDetailLoading.value = true
  try {
    detail.value = await getById(row.id)
  } catch (error) {
    ElMessage.error('预约详情暂时无法加载。')
    detailVisible.value = false
  } finally {
    isDetailLoading.value = false
  }
}

function askStatusChange(status) {
  pendingStatus.value = status
  statusConfirmVisible.value = true
}

async function confirmStatusChange() {
  if (!detail.value || !pendingStatus.value || isUpdating.value) return
  isUpdating.value = true
  try {
    await updateStatus(detail.value.id, pendingStatus.value)
    ElMessage.success(`预约已更新为“${formatStatus(pendingStatus.value)}”。`)
    pendingStatus.value = ''
    statusConfirmVisible.value = false
    detail.value = await getById(detail.value.id)
    await loadReservations()
  } catch (error) {
    ElMessage.error('状态更新未完成，请稍后重试。')
  } finally {
    isUpdating.value = false
  }
}

onMounted(loadReservations)
</script>

<template>
  <section class="admin-reservations" aria-labelledby="reservation-management-title">
    <div class="admin-page-heading">
      <div><p class="eyebrow">RESERVATION MANAGEMENT</p><h1 id="reservation-management-title">预约管理</h1></div>
      <p>查看、确认、核销或取消游客预约。</p>
    </div>

    <form class="admin-filters" @submit.prevent="search">
      <ElInput v-model="filters.keyword" clearable placeholder="预约编号、姓名或手机号" />
      <ElSelect v-model="filters.status" clearable placeholder="全部状态">
        <ElOption v-for="(label, value) in adminStatusLabels" :key="value" :label="label" :value="value" />
      </ElSelect>
      <ElDatePicker v-model="filters.visitDate" type="date" value-format="YYYY-MM-DD" placeholder="参观日期" />
      <ElButton type="primary" native-type="submit">查询</ElButton>
      <ElButton native-type="button" @click="resetFilters">重置</ElButton>
    </form>

    <p v-if="errorMessage" class="admin-page-error">{{ errorMessage }}</p>
    <div class="admin-table-wrap">
      <ElTable v-loading="isLoading" :data="rows" stripe empty-text="暂无预约记录">
        <ElTableColumn prop="reservationNo" label="预约编号" min-width="170" />
        <ElTableColumn prop="name" label="预约人" min-width="105" />
        <ElTableColumn prop="phone" label="手机号" min-width="125" />
        <ElTableColumn prop="visitDate" label="参观日期" min-width="120" />
        <ElTableColumn label="时段" min-width="130"><template #default="{ row }">{{ row.periodLabel || row.period || '待确认' }}</template></ElTableColumn>
        <ElTableColumn prop="peopleCount" label="人数" min-width="75" />
        <ElTableColumn label="状态" min-width="100"><template #default="{ row }"><ElTag :type="statusTheme[row.status]" effect="plain">{{ formatStatus(row.status) }}</ElTag></template></ElTableColumn>
        <ElTableColumn label="操作" fixed="right" min-width="90"><template #default="{ row }"><ElButton link type="primary" @click="openDetail(row)">查看</ElButton></template></ElTableColumn>
      </ElTable>
      <ElEmpty v-if="!isLoading && !rows.length && !errorMessage" description="暂无匹配的预约记录" />
    </div>
    <div class="admin-pagination"><ElPagination v-model:current-page="filters.page" :page-size="filters.pageSize" layout="total, prev, pager, next" :total="total" @current-change="changePage" /></div>

    <ElDialog v-model="detailVisible" width="min(92vw,620px)" title="预约详情" destroy-on-close>
      <div v-if="isDetailLoading" class="admin-dialog-loading">正在加载预约详情…</div>
      <template v-else-if="detail">
        <dl class="admin-detail-list">
          <div><dt>预约编号</dt><dd>{{ detail.reservationNo }}</dd></div>
          <div><dt>预约人</dt><dd>{{ detail.name }}</dd></div>
          <div><dt>手机号</dt><dd>{{ detail.phone }}</dd></div>
          <div><dt>参观日期</dt><dd>{{ detail.visitDate }}</dd></div>
          <div><dt>参观时段</dt><dd>{{ detail.periodLabel || detail.period || '待确认' }}</dd></div>
          <div><dt>预约人数</dt><dd>{{ detail.peopleCount }} 人</dd></div>
          <div><dt>预约状态</dt><dd><ElTag :type="statusTheme[detail.status]" effect="plain">{{ formatStatus(detail.status) }}</ElTag></dd></div>
          <div><dt>创建时间</dt><dd>{{ detail.createdAt || '待确认' }}</dd></div>
        </dl>
        <div v-if="statusActions(detail.status).length" class="admin-detail-actions">
          <ElButton v-for="action in statusActions(detail.status)" :key="action" :type="action === 'CANCELLED' ? 'danger' : 'primary'" plain @click="askStatusChange(action)">{{ action === 'SUCCESS' ? '确认预约' : action === 'CHECKED_IN' ? '核销预约' : '取消预约' }}</ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog v-model="statusConfirmVisible" width="min(92vw,420px)" title="确认状态变更" @closed="pendingStatus = ''">
      <p>确定将该预约更新为“{{ formatStatus(pendingStatus) }}”吗？{{ pendingStatus === 'CANCELLED' ? '取消后将按后端规则释放名额。' : '' }}</p>
      <template #footer><ElButton :disabled="isUpdating" @click="statusConfirmVisible = false">返回</ElButton><ElButton type="primary" :loading="isUpdating" @click="confirmStatusChange">确认操作</ElButton></template>
    </ElDialog>
  </section>
</template>

<style scoped>
.admin-page-heading{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:28px}.admin-page-heading h1{margin:0;color:var(--ink);font-size:clamp(1.7rem,3vw,2.4rem)}.admin-page-heading>p{max-width:300px;margin:0;color:var(--muted);font-size:.9rem;line-height:1.7}.admin-filters{display:grid;grid-template-columns:minmax(180px,1.6fr) minmax(130px,.8fr) minmax(150px,.8fr) auto auto;gap:12px;margin-bottom:20px}.admin-page-error{margin:0 0 16px;color:#9b2020}.admin-table-wrap{overflow:auto;background:var(--cream);border:1px solid var(--line)}.admin-table-wrap :deep(.el-table){--el-table-header-bg-color:#efe6d9;--el-table-row-hover-bg-color:#f7f0e6;--el-table-border-color:rgba(45,41,38,.14);--el-table-text-color:var(--ink);--el-table-header-text-color:var(--ink)}.admin-table-wrap :deep(.el-empty){padding:26px}.admin-pagination{display:flex;justify-content:flex-end;margin-top:20px}.admin-detail-list{margin:0;border-top:1px solid var(--line)}.admin-detail-list div{display:grid;grid-template-columns:110px 1fr;gap:18px;padding:12px 0;border-bottom:1px solid var(--line)}.admin-detail-list dt{color:var(--muted)}.admin-detail-list dd{margin:0;color:var(--ink);word-break:break-word}.admin-detail-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}.admin-dialog-loading{padding:24px 0;color:var(--muted)}@media(max-width:980px){.admin-filters{grid-template-columns:1fr 1fr 1fr}.admin-filters :deep(.el-button){width:auto}}@media(max-width:620px){.admin-page-heading{display:block}.admin-page-heading>p{margin-top:10px}.admin-filters{grid-template-columns:1fr}.admin-filters :deep(.el-button){width:100%;margin-left:0}.admin-pagination{justify-content:center}.admin-detail-list div{grid-template-columns:1fr;gap:4px}}
</style>

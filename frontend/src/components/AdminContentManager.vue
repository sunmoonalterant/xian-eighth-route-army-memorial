<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElButton, ElDatePicker, ElDialog, ElEmpty, ElInput, ElMessage, ElMessageBox, ElOption, ElPagination, ElSelect, ElTable, ElTableColumn, ElTag } from 'element-plus'
import AdminMediaAssetManager from './AdminMediaAssetManager.vue'
import { buildListParams, isSourceBacked, validateCoverImageUrl, validateExhibitionDates, validateHttpUrl, validateRequiredTitle } from '../utils/adminContentForm.js'

const props = defineProps({ title: String, eyebrow: String, api: Object, type: String, categories: Boolean, era: Boolean, published: Boolean, dates: Boolean, media: Boolean })
const filters = reactive({ page: 1, pageSize: 10, keyword: '', categoryId: '' })
const rows = ref([]); const total = ref(0); const categoryRows = ref([]); const loading = ref(false); const errorMessage = ref('')
const detail = ref(null); const detailVisible = ref(false); const formVisible = ref(false); const mode = ref('create'); const saving = ref(false)
const mediaTarget = ref(null); const mediaVisible = ref(false)
const emptyForm = () => ({ id: null, name: '', title: '', categoryId: '', category: '', era: '', summary: '', content: '', coverImage: '', sourceUrl: '', publishTime: '', startDate: '', endDate: '', status: 1 })
const form = reactive(emptyForm())
const fieldTitle = () => props.type === 'relic' ? '名称' : '标题'
const rowTitle = (row) => row.name || row.title

async function loadList() {
  loading.value = true; errorMessage.value = ''
  try { const result = await props.api.getList(buildListParams(filters)); rows.value = result.list || []; total.value = Number(result.total || 0) }
  catch { errorMessage.value = '内容列表暂时无法加载，请稍后重试。' } finally { loading.value = false }
}
async function loadCategories() { if (props.categories) { try { categoryRows.value = await props.api.getCategories() } catch { categoryRows.value = [] } } }
function search() { filters.page = 1; loadList() }
function reset() { Object.assign(filters, { page: 1, pageSize: 10, keyword: '', categoryId: '' }); loadList() }
async function openDetail(row) { try { detail.value = await props.api.getById(row.id); detailVisible.value = true } catch { ElMessage.error('详情暂时无法加载。') } }
async function openEdit(row) { try { Object.assign(form, emptyForm(), await props.api.getById(row.id)); mode.value = 'edit'; formVisible.value = true } catch { ElMessage.error('编辑内容暂时无法加载。') } }
function openCreate() { Object.assign(form, emptyForm()); mode.value = 'create'; formVisible.value = true }
function openMedia(row) { mediaTarget.value = row; mediaVisible.value = true }
function normalizedForm() { const data = { ...form }; if (props.type === 'relic') data.categoryId = data.categoryId || null; if (props.type === 'article') data.categoryId = data.categoryId || null; return data }
function validForm() {
  const title = props.type === 'relic' ? form.name : form.title
  if (!validateRequiredTitle(title)) return ElMessage.error(`${fieldTitle()}不能为空。`), false
  if (!validateCoverImageUrl(form.coverImage) || !validateHttpUrl(form.sourceUrl)) return ElMessage.error('封面图片可使用 http(s) URL 或 /images/ 本地路径；来源 URL 必须为 http(s) 地址。'), false
  if (props.dates && !validateExhibitionDates(form.startDate, form.endDate)) return ElMessage.error('结束日期不能早于开始日期。'), false
  return true
}
async function save() {
  if (!validForm() || saving.value) return
  saving.value = true
  try { if (mode.value === 'create') await props.api.create(normalizedForm()); else await props.api.update(form.id, normalizedForm()); formVisible.value = false; ElMessage.success('内容已保存。'); await loadList() }
  catch (error) { ElMessage.error(error.message || '保存失败，请稍后重试。') } finally { saving.value = false }
}
async function hide(row) {
  const sourceCopy = isSourceBacked(row) ? '该记录来源于官网采集，确认继续下线吗？' : '确认下线该内容吗？'
  try { await ElMessageBox.confirm(sourceCopy, '确认操作', { type: 'warning', confirmButtonText: '确认下线', cancelButtonText: '返回' }); await props.api.remove(row.id); ElMessage.success('内容已下线。'); await loadList() } catch (error) { if (error !== 'cancel' && error !== 'close') ElMessage.error('下线失败，请稍后重试。') }
}
onMounted(async () => { await Promise.all([loadList(), loadCategories()]) })
</script>

<template>
  <section class="admin-content-manager">
    <div class="admin-page-heading"><div><p class="eyebrow">{{ eyebrow }}</p><h1>{{ title }}</h1></div><p>管理展示内容；官网公开资料仍应按来源进行人工核对。</p></div>
    <form class="admin-filters" @submit.prevent="search"><ElInput v-model="filters.keyword" clearable :placeholder="`搜索${fieldTitle()}`" />
      <ElSelect v-if="categories" v-model="filters.categoryId" clearable placeholder="全部分类"><ElOption v-for="item in categoryRows" :key="item.id" :label="item.name" :value="item.id" /></ElSelect>
      <ElButton type="primary" native-type="submit">查询</ElButton><ElButton native-type="button" @click="reset">重置</ElButton><ElButton type="primary" plain native-type="button" @click="openCreate">新增{{ fieldTitle() }}</ElButton>
    </form>
    <p v-if="errorMessage" class="admin-page-error">{{ errorMessage }}</p>
    <div class="admin-table-wrap"><ElTable v-loading="loading" :data="rows" stripe empty-text="暂无内容记录">
      <ElTableColumn :label="fieldTitle()" min-width="190"><template #default="{ row }">{{ rowTitle(row) }}</template></ElTableColumn>
      <ElTableColumn v-if="categories" prop="category" label="分类" min-width="110" />
      <ElTableColumn v-if="era" prop="era" label="年代" min-width="110" />
      <ElTableColumn v-if="published" label="发布时间" min-width="150"><template #default="{ row }">{{ row.publishTime || '—' }}</template></ElTableColumn>
      <ElTableColumn v-if="dates" label="开始日期" min-width="120"><template #default="{ row }">{{ row.startDate || '—' }}</template></ElTableColumn>
      <ElTableColumn v-if="dates" label="结束日期" min-width="120"><template #default="{ row }">{{ row.endDate || '—' }}</template></ElTableColumn>
      <ElTableColumn label="来源" min-width="100"><template #default="{ row }">{{ row.sourceUrl ? '官网/外部' : '—' }}</template></ElTableColumn>
      <ElTableColumn label="状态" min-width="90"><template #default="{ row }"><ElTag :type="row.status === 1 ? 'success' : 'info'" effect="plain">{{ row.status === 1 ? '展示中' : '已下线' }}</ElTag></template></ElTableColumn>
      <ElTableColumn label="更新时间" min-width="160"><template #default="{ row }">{{ row.updatedAt || '—' }}</template></ElTableColumn>
      <ElTableColumn label="操作" fixed="right" min-width="210"><template #default="{ row }"><ElButton link type="primary" @click="openDetail(row)">查看</ElButton><ElButton link type="primary" @click="openEdit(row)">编辑</ElButton><ElButton v-if="media" link type="primary" @click="openMedia(row)">图片管理</ElButton><ElButton link type="danger" :disabled="row.status === 0" @click="hide(row)">下线</ElButton></template></ElTableColumn>
    </ElTable><ElEmpty v-if="!loading && !rows.length && !errorMessage" description="暂无匹配内容" /></div>
    <div class="admin-pagination"><ElPagination v-model:current-page="filters.page" :page-size="filters.pageSize" layout="total, prev, pager, next" :total="total" @current-change="loadList" /></div>
    <ElDialog v-model="detailVisible" width="min(92vw,700px)" title="内容详情"><dl v-if="detail" class="admin-detail-list"><div><dt>{{ fieldTitle() }}</dt><dd>{{ rowTitle(detail) }}</dd></div><div v-if="detail.category"><dt>分类</dt><dd>{{ detail.category }}</dd></div><div v-if="detail.sourceUrl"><dt>来源 URL</dt><dd class="break-all">{{ detail.sourceUrl }}</dd></div><div v-if="detail.sourceApiId"><dt>采集标识</dt><dd>{{ detail.sourceApiId }}</dd></div><div><dt>状态</dt><dd>{{ detail.status === 1 ? '展示中' : '已下线' }}</dd></div><div><dt>摘要</dt><dd>{{ detail.summary || '—' }}</dd></div><div><dt>正文</dt><dd>{{ detail.content || '—' }}</dd></div></dl></ElDialog>
    <ElDialog v-model="formVisible" width="min(94vw,760px)" :title="mode === 'create' ? `新增${fieldTitle()}` : `编辑${fieldTitle()}`" destroy-on-close>
      <form class="content-form" @submit.prevent="save"><label>{{ fieldTitle() }}<ElInput v-model="form[type === 'relic' ? 'name' : 'title']" /></label>
        <label v-if="categories">分类<ElSelect v-model="form.categoryId" clearable placeholder="可不选"><ElOption v-for="item in categoryRows" :key="item.id" :label="item.name" :value="item.id" /></ElSelect></label>
        <label v-if="era">年代<ElInput v-model="form.era" /></label><label v-if="type === 'exhibition'">展览类别<ElInput v-model="form.category" /></label>
        <label v-if="published">发布时间<ElDatePicker v-model="form.publishTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" clearable /></label>
        <label v-if="dates">开始日期<ElDatePicker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" clearable /></label><label v-if="dates">结束日期<ElDatePicker v-model="form.endDate" type="date" value-format="YYYY-MM-DD" clearable /></label>
        <label>封面图片 URL<ElInput v-model="form.coverImage" /></label><label>来源 URL<ElInput v-model="form.sourceUrl" /></label>
        <label class="span-two">摘要<ElInput v-model="form.summary" type="textarea" :rows="3" /></label><label class="span-two">正文<ElInput v-model="form.content" type="textarea" :rows="7" /></label>
        <label>展示状态<ElSelect v-model="form.status"><ElOption label="展示中" :value="1" /><ElOption label="已下线" :value="0" /></ElSelect></label>
      </form><template #footer><ElButton @click="formVisible = false">取消</ElButton><ElButton type="primary" :loading="saving" @click="save">保存并刷新</ElButton></template>
    </ElDialog>
    <ElDialog v-model="mediaVisible" width="min(96vw,980px)" :title="`${rowTitle(mediaTarget || {})} · 图片管理`" destroy-on-close><AdminMediaAssetManager v-if="mediaTarget" :entity-type="type" :entity-id="mediaTarget.id" :api="api" /></ElDialog>
  </section>
</template>

<style scoped>
.admin-page-heading{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:28px}.admin-page-heading h1{margin:0;font-size:clamp(1.7rem,3vw,2.4rem)}.admin-page-heading>p{max-width:350px;margin:0;color:var(--muted);font-size:.9rem;line-height:1.7}.admin-filters{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px}.admin-filters :deep(.el-input),.admin-filters :deep(.el-select){width:min(280px,100%)}.admin-page-error{color:#9b2020}.admin-table-wrap{overflow:auto;background:var(--cream);border:1px solid var(--line)}.admin-table-wrap :deep(.el-table){--el-table-header-bg-color:#efe6d9;--el-table-row-hover-bg-color:#f7f0e6}.admin-pagination{display:flex;justify-content:flex-end;margin-top:20px}.admin-detail-list{margin:0}.admin-detail-list div{display:grid;grid-template-columns:120px 1fr;gap:16px;padding:12px 0;border-bottom:1px solid var(--line)}.admin-detail-list dt{color:var(--muted)}.admin-detail-list dd{margin:0;white-space:pre-wrap;word-break:break-word}.content-form{display:grid;grid-template-columns:1fr 1fr;gap:16px}.content-form label{display:grid;gap:7px;color:var(--ink);font-size:.9rem}.content-form .span-two{grid-column:span 2}.break-all{word-break:break-all}@media(max-width:700px){.admin-page-heading{display:block}.admin-page-heading>p{margin-top:10px}.admin-filters{display:grid;grid-template-columns:1fr}.admin-filters :deep(.el-input),.admin-filters :deep(.el-select),.admin-filters :deep(.el-button){width:100%;margin-left:0}.admin-pagination{justify-content:center}.content-form{grid-template-columns:1fr}.content-form .span-two{grid-column:auto}.admin-detail-list div{grid-template-columns:1fr;gap:4px}}
</style>

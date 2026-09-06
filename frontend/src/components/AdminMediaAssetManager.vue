<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { ElButton, ElEmpty, ElInput, ElMessage, ElMessageBox, ElOption, ElSelect, ElTable, ElTableColumn, ElTag } from 'element-plus'
import { toDisplayImageUrl } from '../utils/imageUrl.js'

const props = defineProps({ entityType: { type: String, required: true }, entityId: { type: [String, Number], required: true }, api: { type: Object, required: true } })
const rows = ref([]); const file = ref(null); const saving = ref(false); const loading = ref(false)
const usageByEntity = {
  person: [{ value: 'portrait', label: '人物照片' }, { value: 'historical', label: '历史活动照' }],
  relic: [{ value: 'cover', label: '文物封面' }, { value: 'gallery', label: '文物图库' }],
  article: [{ value: 'cover', label: '新闻封面' }, { value: 'content', label: '新闻正文图' }],
  exhibition: [{ value: 'cover', label: '展览封面' }, { value: 'gallery', label: '展览图库' }],
  courtyard: [{ value: 'cover', label: '院落封面' }, { value: 'historical', label: '历史图片' }, { value: 'building', label: '建筑图片' }, { value: 'gallery', label: '院落图库' }],
  digital_museum: [{ value: 'map', label: '导览底图' }],
}
const emptyForm = () => ({ usageType: usageByEntity[props.entityType]?.[0]?.value || '', publisher: '', sourceImageUrl: '', sourcePageUrl: '', caption: '', identityEvidence: '', personPosition: '', sortOrder: 0, reviewStatus: 'pending', status: 1 })
const form = reactive(emptyForm())
const usageOptions = () => usageByEntity[props.entityType] || []
async function load() { loading.value = true; try { rows.value = await props.api.getImages(props.entityId) } catch { ElMessage.error('图片列表暂时无法加载。') } finally { loading.value = false } }
function selectFile(event) { file.value = event.target.files?.[0] || null }
async function upload() { if (!file.value || saving.value) return ElMessage.warning('请选择 jpg、jpeg、png 或 webp 图片。'); saving.value = true; try { const data = new FormData(); data.append('image', file.value); Object.entries(form).forEach(([key, value]) => data.append(key, value ?? '')); await props.api.uploadImage(props.entityId, data); Object.assign(form, emptyForm()); file.value = null; const input = document.querySelector('#media-image-file'); if (input) input.value = ''; await load(); ElMessage.success('图片已上传。') } catch (error) { ElMessage.error(error.message || '图片上传失败。') } finally { saving.value = false } }
async function save(row) { try { await props.api.updateImage(props.entityId, row.id, row); await load(); ElMessage.success('图片资料已保存。') } catch (error) { ElMessage.error(error.message || '保存失败。') } }
async function remove(row) { try { await ElMessageBox.confirm('确认删除该图片记录及未被其他记录使用的上传文件吗？', '确认删除', { type: 'warning' }); await props.api.removeImage(props.entityId, row.id); await load(); ElMessage.success('图片已删除。') } catch (error) { if (error !== 'cancel' && error !== 'close') ElMessage.error('删除失败。') } }
watch(() => props.entityId, load)
onMounted(load)
</script>

<template>
  <section class="media-manager">
    <p class="media-manager__note">上传图片须填写来源说明；只有“已核验”且“展示中”的资源会在游客端显示。</p>
    <div class="media-upload-form"><label>选择图片<input id="media-image-file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" type="file" @change="selectFile" /></label><label>用途<ElSelect v-model="form.usageType"><ElOption v-for="item in usageOptions()" :key="item.value" :label="item.label" :value="item.value" /></ElSelect></label><label>来源机构<ElInput v-model="form.publisher" placeholder="如：课程设计本地资料" /></label><label>来源图片 URL<ElInput v-model="form.sourceImageUrl" /></label><label>来源页面 URL<ElInput v-model="form.sourcePageUrl" /></label><label>排序<ElInput v-model.number="form.sortOrder" type="number" min="0" /></label><label class="span-two">图片说明<ElInput v-model="form.caption" type="textarea" :rows="2" /></label><label v-if="entityType === 'person'" class="span-two">人物身份依据<ElInput v-model="form.identityEvidence" type="textarea" :rows="2" /></label><label v-if="entityType === 'person'">人物在图中位置<ElInput v-model="form.personPosition" placeholder="如：左三" /></label><label>审核状态<ElSelect v-model="form.reviewStatus"><ElOption label="待核验" value="pending" /><ElOption label="已核验" value="verified" /><ElOption label="不采用" value="rejected" /></ElSelect></label><label>展示状态<ElSelect v-model="form.status"><ElOption label="展示中" :value="1" /><ElOption label="不展示" :value="0" /></ElSelect></label></div>
    <ElButton type="primary" :loading="saving" @click="upload">上传并保存</ElButton>
    <div class="media-table"><ElTable v-loading="loading" :data="rows" empty-text="暂无上传图片"><ElTableColumn label="预览" width="112"><template #default="{ row }"><img class="media-thumb" :src="toDisplayImageUrl(row.localPath)" :alt="row.caption || '图片预览'" /></template></ElTableColumn><ElTableColumn prop="usageType" label="用途" width="110" /><ElTableColumn label="审核" width="130"><template #default="{ row }"><ElSelect v-model="row.reviewStatus"><ElOption label="待核验" value="pending" /><ElOption label="已核验" value="verified" /><ElOption label="不采用" value="rejected" /></ElSelect></template></ElTableColumn><ElTableColumn label="说明" min-width="180"><template #default="{ row }"><ElInput v-model="row.caption" type="textarea" :rows="2" /></template></ElTableColumn><ElTableColumn label="来源机构" min-width="150"><template #default="{ row }"><ElInput v-model="row.publisher" /></template></ElTableColumn><ElTableColumn label="来源图片" min-width="180"><template #default="{ row }"><ElInput v-model="row.sourceImageUrl" /></template></ElTableColumn><ElTableColumn label="来源页" min-width="180"><template #default="{ row }"><ElInput v-model="row.sourcePageUrl" /></template></ElTableColumn><ElTableColumn label="排序" width="100"><template #default="{ row }"><ElInput v-model.number="row.sortOrder" type="number" min="0" /></template></ElTableColumn><ElTableColumn label="展示" width="110"><template #default="{ row }"><ElSelect v-model="row.status"><ElOption label="展示中" :value="1" /><ElOption label="不展示" :value="0" /></ElSelect></template></ElTableColumn><ElTableColumn label="操作" width="130"><template #default="{ row }"><ElButton link type="primary" @click="save(row)">保存</ElButton><ElButton link type="danger" @click="remove(row)">删除</ElButton></template></ElTableColumn></ElTable><ElEmpty v-if="!loading && !rows.length" description="暂无图片资源" /></div>
  </section>
</template>

<style scoped>.media-manager__note{margin:0 0 18px;color:var(--muted);line-height:1.7}.media-upload-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}.media-upload-form label{display:grid;gap:6px;font-size:.88rem}.span-two{grid-column:span 2}.media-table{margin-top:22px;overflow:auto}.media-thumb{display:block;width:78px;height:58px;object-fit:cover;background:var(--paper-dark)}@media(max-width:640px){.media-upload-form{grid-template-columns:1fr}.span-two{grid-column:auto}}</style>

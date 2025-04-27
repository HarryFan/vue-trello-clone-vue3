<template>
  <el-dialog v-model="visible" width="520px" :show-close="false" @close="onCloseClick">
    <template #header>
      <div class="card-detail__header">
        <el-input v-model="editTitle" class="card-detail__title" @blur="saveTitle" @keyup.enter="saveTitle" @keyup.esc="resetTitle" />
        <el-button class="close-btn" @click="onCloseClick" circle icon="el-icon-close" />
        <div class="card-detail__meta">
          <span class="card-detail__list">{{ listTitle }}</span>
          <span v-if="item.date" class="card-detail__date"><i class="far fa-calendar-alt"></i> {{ item.date }}</span>
        </div>
      </div>
    </template>
    <div class="card-detail__section">
      <label class="card-detail__label">描述</label>
      <el-input
        v-model="editDesc"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 6 }"
        class="card-detail__desc"
        @blur="saveDesc"
        @keyup.enter="saveDesc"
        @keyup.esc="resetDesc"
      />
    </div>
    <!-- 圖片上傳/預覽區塊 -->
    <div class="card-detail__section">
      <label class="card-detail__label">圖片</label>
      <div class="images">
        <div v-for="imgId in editImages" :key="imgId" class="image-preview">
          <img :src="getImageFromStorage(imgId)" alt="Task image" />
          <el-button class="delete is-small" @click="removeImage(imgId)" circle icon="el-icon-delete" />
        </div>
        <div class="image-upload">
          <input type="file" ref="fileInput" accept="image/*" @change="onImageUpload" style="display:none" />
          <el-button type="info" plain @click="triggerFileInput">
            <i class="fas fa-upload"></i>
            <span>上傳圖片</span>
          </el-button>
        </div>
      </div>
    </div>
    <!-- 細項清單區塊 -->
    <div class="card-detail__section">
      <label class="card-detail__label">細項</label>
      <div class="subitems">
        <div v-for="(sub, idx) in editSubItems" :key="sub.id" class="subitem-row">
          <el-checkbox v-model="editSubItems[idx].isCompleted" @change="emitUpdate()">{{ sub.text }}</el-checkbox>
        </div>
        <div class="subitem-add">
          <el-input v-model="newSubItemText" @keyup.enter="addSubItem" placeholder="新增細項..." size="small" />
          <el-button type="primary" size="small" @click="addSubItem" :disabled="!newSubItemText.trim()">新增</el-button>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="onCloseClick">取消</el-button>
      <el-button type="primary" @click="onConfirmClick">確認</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
// 若有圖片存取工具，請自行引入
// import { saveImageToStorage, getImageFromStorage, removeImageFromStorage } from '@/utils/data'

const emit = defineEmits(['close', 'update'])
const props = defineProps({
  item: { type: Object, required: true },
  listTitle: { type: String, default: '' },
  modelValue: { type: Boolean, default: false },
})
const visible = ref(props.modelValue)
watch(() => props.modelValue, v => (visible.value = v))
watch(visible, v => emit('update:modelValue', v))

const editTitle = ref(props.item.title)
const editDesc = ref(props.item.description || '')
const editImages = ref(props.item.images ? [...props.item.images] : [])
const editSubItems = ref(props.item.subItems ? JSON.parse(JSON.stringify(props.item.subItems)) : [])
const newSubItemText = ref('')

watch(() => props.item, (val) => {
  editTitle.value = val.title
  editDesc.value = val.description || ''
  editImages.value = val.images ? [...val.images] : []
  editSubItems.value = val.subItems ? JSON.parse(JSON.stringify(val.subItems)) : []
  newSubItemText.value = ''
}, { immediate: true })

function onCloseClick() {
  emit('close')
  visible.value = false
}
function onConfirmClick() {
  emitUpdate()
  emit('close')
  visible.value = false
}
function saveTitle() {
  if (editTitle.value !== props.item.title) emitUpdate()
}
function resetTitle() {
  editTitle.value = props.item.title
}
function saveDesc() {
  if (editDesc.value !== props.item.description) emitUpdate()
}
function resetDesc() {
  editDesc.value = props.item.description || ''
}
function emitUpdate() {
  emit('update', {
    ...props.item,
    title: editTitle.value,
    description: editDesc.value,
    images: editImages.value,
    subItems: editSubItems.value,
    updatedAt: new Date().toISOString(),
  })
}
function getImageFromStorage(imgId) {
  // TODO: 實際專案請實作圖片讀取
  return ''
}
function removeImage(imgId) {
  // TODO: 實際專案請實作圖片刪除
  editImages.value = editImages.value.filter(id => id !== imgId)
  emitUpdate()
}
function triggerFileInput() {
  // 觸發 input[type=file]
  document.querySelector('input[type=file][ref=fileInput]')?.click()
}
function onImageUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 1024 * 1024) {
    ElMessage.error('圖片大小不能超過 1MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (evt) => {
    const base64 = evt.target.result
    // TODO: 請根據專案需求存儲圖片並獲取 imgId
    // const imgId = saveImageToStorage(base64)
    // if (imgId) {
    //   editImages.value.push(imgId)
    //   emitUpdate()
    // }
  }
  reader.readAsDataURL(file)
}
function addSubItem() {
  const text = newSubItemText.value.trim()
  if (!text) return
  editSubItems.value.push({ id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), text, isCompleted: false })
  newSubItemText.value = ''
  emitUpdate()
}
</script>

<style scoped>
.card-detail__header {
  border-bottom: 1px solid #b6d4ff;
  margin-bottom: 12px;
  position: relative;
  display: flex;
  flex-direction: column;
}
.card-detail__title {
  font-size: 1.2em;
  font-weight: bold;
  border: none;
  width: 100%;
  margin-bottom: 6px;
  background: transparent;
  outline: none;
  color: #1a4894;
}
.card-detail__meta {
  font-size: 0.9em;
  color: #4a90e2;
  display: flex;
  gap: 16px;
}
.card-detail__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}
.card-detail__label {
  font-size: 0.95em;
  color: #4a90e2;
}
.card-detail__desc {
  width: 100%;
  min-height: 60px;
  border: 1px solid #b6d4ff;
  border-radius: 4px;
  padding: 8px;
  font-size: 1em;
  resize: vertical;
  background: white;
  color: #1a4894;
}
.images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.image-preview {
  position: relative;
  width: 80px;
  height: 80px;
}
.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}
.delete {
  position: absolute;
  top: 3px;
  right: 3px;
  z-index: 2;
}
.image-upload {
  display: flex;
  align-items: center;
}
.subitems {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.subitem-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.completed {
  text-decoration: line-through;
  color: #bbb;
}
.subitem-add {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}
</style>

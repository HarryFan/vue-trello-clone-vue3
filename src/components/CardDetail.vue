<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <div class="card-detail__header">
        <input v-model="editTitle" class="card-detail__title" @blur="saveTitle" @keyup.enter="saveTitle" @keyup.esc="resetTitle" />
        <button class="close-btn" @click="onCloseClick">關閉</button>
        <div class="card-detail__meta">
          <span class="card-detail__list">{{ listTitle }}</span>
          <span v-if="item.deadline" class="card-detail__date"><i class="far fa-calendar-alt"></i> {{ item.deadline }}</span>
        </div>
      </div>
      <div class="card-detail__section">
        <label class="card-detail__label">描述</label>
        <textarea
          v-model="editDesc"
          class="card-detail__desc"
          @blur="saveDesc"
          @keyup.enter="saveDesc"
          @keyup.esc="resetDesc"
        />
      </div>
      <!-- 細項清單區塊 -->
      <div class="card-detail__section">
        <label class="card-detail__label">細項</label>
        <div class="subitems">
          <div v-for="(sub, idx) in editSubItems" :key="sub.id" class="subitem-row">
            <input type="checkbox" v-model="editSubItems[idx].isCompleted" @change="emitUpdate()">
            <span :class="{ completed: sub.isCompleted }">{{ sub.text }}</span>
          </div>
          <div class="subitem-add">
            <input v-model="newSubItemText" @keyup.enter="addSubItem" placeholder="新增細項..." class="small-input" />
            <button type="primary" size="small" @click="addSubItem" :disabled="!newSubItemText.trim()">新增</button>
          </div>
        </div>
      </div>
      <button @click="onCloseClick">取消</button>
      <button type="primary" @click="onConfirmClick">確認</button>
    </div>
  </div>
</template>

<script setup>
/**
 * 卡片詳細資訊組件 CardDetail.vue
 * 顯示卡片完整內容、圖片、細項、編輯與更新功能。
 * @module CardDetail
 * @prop {Object} item - 任務資料物件。
 * @prop {String} listTitle - 清單標題。
 * @prop {Boolean} modelValue - 詳細視窗顯示狀態。
 * @event update - 編輯後發出，傳遞更新資料。
 * @event close - 關閉視窗時發出。
 */
import { ref, watch } from 'vue'

const emit = defineEmits(['close', 'update'])
const props = defineProps({
  item: { type: Object, required: true },
  listTitle: { type: String, default: '' },
  modelValue: { type: Boolean, default: false },
})

const visible = ref(props.modelValue)
watch(() => props.modelValue, v => (visible.value = v))

const editTitle = ref(props.item.title)
const editDesc = ref(props.item.description || '')
const editImages = ref([])
const editSubItems = ref(props.item.subItems ? JSON.parse(JSON.stringify(props.item.subItems)) : [])
const newSubItemText = ref('')

watch(() => props.item, (val) => {
  editTitle.value = val.title
  editDesc.value = val.description || ''
  editImages.value = []
  editSubItems.value = val.subItems ? JSON.parse(JSON.stringify(val.subItems)) : []
  newSubItemText.value = ''
}, { immediate: true })

function onCloseClick() {
  visible.value = false
  emit('close')
}
function onConfirmClick() {
  emitUpdate()
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
    subItems: editSubItems.value,
    updatedAt: new Date().toISOString(),
  })
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
.small-input {
  width: 100%;
  height: 30px;
  font-size: 1em;
  padding: 6px;
  border: 1px solid #b6d4ff;
  border-radius: 4px;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.24);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-width: 320px;
  min-height: 120px;
  box-shadow: 0 4px 16px #1976d233;
  position: relative;
}
button.close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 16px;
  cursor: pointer;
}
</style>

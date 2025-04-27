<template>
  <div class="board-view">
    <h2>任務清單</h2>
    <p class="subtitle">請在輸入框新增清單與卡片。若要輸入更多細節，請按 CMD 或 CTRL + Enter。</p>

    <div class="lists-container">
      <div v-for="(list, listIndex) in lists" :key="list.id" class="list-container">
        <div class="list-header">
          <span class="list-title">{{ list.title }}</span>
          <el-button type="danger" size="small" @click="deleteList(list.id)" circle icon="el-icon-delete" style="float:right;" />
        </div>
        <div class="card-list">
          <Card v-for="item in list.items" :key="item.id" :item="item"
            @edit="openEditForm(item, list)"
            @delete="deleteItem(list.id, item.id)"
            @update="updateItem(list.id, $event)"
          />
        </div>
        <div class="item-entry">
          <el-input v-model="newCardText[list.id]" placeholder="新增卡片" size="small" @keyup.enter="openForm(list.id)" />
          <el-button type="primary" size="small" @click="openForm(list.id)">新增</el-button>
        </div>
      </div>
      <div class="new-list">
        <el-input v-model="newListTitle" placeholder="新增清單" size="small" @keyup.enter="addList" />
        <el-button type="primary" size="small" @click="addList">新增清單</el-button>
        <div v-if="errorMsg" style="color:#e53935; font-size:13px; margin-top:4px;">{{ errorMsg }}</div>
      </div>
    </div>

    <!-- 卡片詳情彈窗 -->
    <CardDetail
      v-if="detailDialog.visible"
      v-model="detailDialog.visible"
      :item="detailDialog.item"
      :list-title="detailDialog.listTitle"
      @update="onDetailUpdate"
      @close="closeDetail"
    />
    <!-- 新增/編輯卡片表單彈窗 -->
    <UiItemForm
      v-if="formDialog.visible"
      :model-value="formDialog.data"
      @submit="onFormSubmit"
      @cancel="closeForm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useBoardStore } from '@/stores/board'
import Card from '@/components/Card.vue'
import CardDetail from '@/components/CardDetail.vue'
import UiItemForm from '@/components/UiItemForm.vue'

const board = useBoardStore()
const lists = computed(() => board.lists)
const newListTitle = ref('')
const newCardText = ref({})
const errorMsg = ref('')

// 詳情彈窗狀態
const detailDialog = reactive({
  visible: false,
  item: {},
  listTitle: ''
})
// 表單彈窗狀態
const formDialog = reactive({
  visible: false,
  listId: null,
  data: {},
  edit: false,
  editId: null
})

function addList() {
  errorMsg.value = ''
  if (!newListTitle.value || !newListTitle.value.trim()) {
    errorMsg.value = '清單名稱不能為空！'
    console.warn('新增清單失敗：名稱為空')
    return
  }
  board.addList(newListTitle.value)
  console.log('新增清單', newListTitle.value)
  newListTitle.value = ''
}
function deleteList(listId) {
  board.deleteList(listId)
}
function openForm(listId) {
  formDialog.listId = listId
  formDialog.data = {
    title: newCardText.value[listId] || '',
    description: '',
    date: null,
    images: []
  }
  formDialog.edit = false
  formDialog.editId = null
  formDialog.visible = true
}
function openEditForm(item, list) {
  formDialog.listId = list.id
  formDialog.data = { ...item }
  formDialog.edit = true
  formDialog.editId = item.id
  formDialog.visible = true
}
function onFormSubmit(formData) {
  if (formDialog.edit && formDialog.editId) {
    board.updateItem(formDialog.listId, { ...formData, id: formDialog.editId })
  } else {
    board.addCard(formDialog.listId, formData.title)
    // 可擴充：formData.description, date, images 等欄位
    newCardText.value[formDialog.listId] = ''
  }
  closeForm()
}
function closeForm() {
  formDialog.visible = false
  formDialog.data = {}
  formDialog.edit = false
  formDialog.editId = null
}
function addCard(listId) {
  // 已改為 openForm
}
function deleteItem(listId, itemId) {
  board.deleteItem(listId, itemId)
}
function updateItem(listId, updatedItem) {
  board.updateItem(listId, updatedItem)
}
function openDetail(item, list) {
  detailDialog.item = { ...item }
  detailDialog.listTitle = list.title
  detailDialog.visible = true
}
function closeDetail() {
  detailDialog.visible = false
}
function onDetailUpdate(updatedItem) {
  board.updateItemByTitle(detailDialog.listTitle, updatedItem)
}
</script>

<style scoped>
.board-view {
  padding: 32px;
}
.subtitle {
  color: #1976d2;
  margin-bottom: 16px;
}
.lists-container {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.list-container {
  background: #f2f7fb;
  border-radius: 8px;
  box-shadow: 0 1px 4px #1976d21a;
  padding: 18px 14px 14px 14px;
  min-width: 260px;
  max-width: 320px;
}
.list-header {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 8px;
}
.card-list {
  min-height: 20px;
  margin-bottom: 8px;
}
.item-entry {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}
.new-list {
  display: flex;
  flex-direction: column;
  min-width: 220px;
  max-width: 260px;
  gap: 6px;
}

@media (max-width: 768px) {
  .lists-container {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .list-container,
  .new-list {
    width: 100%;
    min-width: unset;
    max-width: unset;
    box-sizing: border-box;
  }
  .board-view {
    padding: 12px;
  }
}
</style>

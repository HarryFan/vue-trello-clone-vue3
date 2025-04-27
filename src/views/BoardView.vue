<template>
  <div class="board-view">
    <div class="board-header">
      <h2>任務清單</h2>
      <el-button type="warning" size="small" @click="resetLists" style="float:right; margin-left:8px;">
        <font-awesome-icon :icon="['fas','rotate-right']" />重設清單
      </el-button>
    </div>
    <p class="subtitle">請在輸入框新增清單與卡片。</p>

    <div class="lists-container">
      <!-- 使用 vuedraggable@next 實現 Trello 風格拖曳 -->
      <Draggable :list="lists" group="lists" item-key="id" animation="150" ghost-class="drag-ghost" @change="onListChange">
        <template #item="{element: list, index: listIndex}">
          <section class="list-container" :data-id="list.id">
            <div class="list-header">
              <span class="list-drag-handle">☰</span>
              <span class="list-title">{{ list.title }}</span>
              <el-button type="danger" size="small" circle @click="deleteList(list.id)"><font-awesome-icon :icon="['fas','trash']"/></el-button>
            </div>
            <Draggable :list="list.items" group="cards" item-key="id" animation="150" ghost-class="drag-ghost" @change="evt => onCardChange(evt, list)">
              <template #item="{element: item, index: itemIndex}">
                <div class="draggable-item">
                  <Card :item="item" :list-title="list.title" @edit="openEditForm(item,list)" @delete="deleteItem(list.id,item.id)" @update="updateItem(list.id, $event)" />
                </div>
              </template>
            </Draggable>
            <div class="item-entry">
              <el-input v-model="newCardText[list.id]" placeholder="新增卡片" size="small" @keyup.enter="openForm(list.id)" />
              <el-button type="primary" size="small" @click="openForm(list.id)">新增</el-button>
            </div>
          </section>
        </template>
      </Draggable>
      <div class="new-list">
        <el-input v-model="newListTitle" placeholder="新增清單" size="small" @keyup.enter="addList" />
        <el-button type="primary" size="small" @click="addList">新增清單</el-button>
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      </div>
    </div>

    <CardDetail v-if="detailDialog.visible" v-model="detailDialog.visible"
      :item="detailDialog.item" :list-title="detailDialog.listTitle"
      @update="onDetailUpdate" @close="closeDetail" />
    <UiItemForm v-if="formDialog.visible" :model-value="formDialog.data"
      @submit="onFormSubmit" @cancel="closeForm" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useBoardStore } from '@/stores/board'
import Card from '@/components/Card.vue'
import CardDetail from '@/components/CardDetail.vue'
import UiItemForm from '@/components/UiItemForm.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ElMessage } from 'element-plus'
import Draggable from 'vuedraggable'

const board = useBoardStore()
const lists = computed(() => board.lists)
const newListTitle = ref('')
const newCardText = ref({})
const errorMsg = ref('')

// 處理清單拖移 (vuedraggable)
function onListChange(evt) {
  const { moved } = evt
  if (moved) board.moveList(moved.oldIndex, moved.newIndex)
}

// 處理卡片拖移 (vuedraggable)
function onCardChange(evt, list) {
  const { added, removed } = evt
  if (removed && added) {
    board.moveItemAcrossLists(removed.element.listId, list.id, removed.oldIndex, added.newIndex)
  }
}

function addList() {
  errorMsg.value = ''
  if (!newListTitle.value.trim()) {
    errorMsg.value = '清單名稱不能為空'
    return
  }
  board.addList(newListTitle.value)
  newListTitle.value = ''
}

function deleteList(id) { board.deleteList(id) }
function openForm(listId) { formDialog.listId = listId; formDialog.data = { title: '', description: '', date: null, images: [] }; formDialog.edit = false; formDialog.editId = null; formDialog.visible = true }
function openEditForm(item, list) { formDialog.listId = list.id; formDialog.data = { ...item }; formDialog.edit = true; formDialog.editId = item.id; formDialog.visible = true }
function onFormSubmit(data) { formDialog.edit && formDialog.editId ? board.updateItem(formDialog.listId, { ...data, id: formDialog.editId }) : board.addCard(formDialog.listId, data); closeForm() }
function closeForm() { formDialog.visible = false; formDialog.data = {}; formDialog.edit = false; formDialog.editId = null }
function deleteItem(listId, itemId) { board.deleteItem(listId, itemId) }
function updateItem(listId, item) { board.updateItem(listId, item) }
function openDetail(item, list) { detailDialog.item = { ...item }; detailDialog.listTitle = list.title; detailDialog.visible = true }
function closeDetail() { detailDialog.visible = false }
function onDetailUpdate(item) { board.updateItemByTitle(detailDialog.listTitle, item) }
function resetLists() { board.resetDefaultLists(); ElMessage.success('已重設預設清單') }

const detailDialog = reactive({ visible: false, item: {}, listTitle: '' })
const formDialog = reactive({ visible: false, listId: null, data: {}, edit: false, editId: null })
</script>

<style scoped>
.board-view{padding:12px}
.subtitle{color:#1976d2;margin-bottom:12px}
.lists-container{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap}
.list-container{background:#f2f7fb;padding:14px;border-radius:6px;min-width:260px;max-width:320px}
.list-header{font-weight:bold;margin-bottom:8px;display:flex;justify-content:space-between}
.card-list{min-height:20px;margin-bottom:8px}
.draggable-item{margin-bottom:8px}
.item-entry{display:flex;gap:6px;margin-top:8px}
.new-list{display:flex;flex-direction:column;gap:6px;min-width:220px;max-width:260px}
.error-msg{color:#e53935;font-size:13px;margin-top:4px}
</style>

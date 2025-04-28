<template>
  <div class="board-view">
    <div class="board-header">
      <h2>任務清單</h2>
      <button type="button" class="warning" @click="resetLists" style="float:right; margin-left:8px;">
        <font-awesome-icon :icon="['fas','rotate-right']" />重設清單
      </button>
    </div>
    <p class="subtitle">請在輸入框新增清單與卡片。</p>

    <div class="lists-container">
      <div class="lists-wrapper">
        <Draggable :list="lists" group="lists" item-key="id" animation="150" ghost-class="drag-ghost" @change="onListChange">
          <template #item="{element: list, index: listIndex}">
            <section class="list-column" :data-id="list.id">
              <div class="list-header">
                <span class="list-drag-handle">☰</span>
                <span class="list-title">{{ list.title }}</span>
                <button type="button" class="danger" @click="deleteList(list.id)"><font-awesome-icon :icon="['fas','trash']"/></button>
              </div>
              <div class="cards-container">
                <Draggable :list="list.items" group="cards" item-key="id" animation="120" ghost-class="drag-ghost" @change="onCardChange(list, $event)">
                  <template #item="{element: item, index: cardIndex}">
                    <Card :item="item" :list-title="list.title" @edit="openEditForm(item,list)" @delete="deleteItem(list.id,item.id)" @update="updateItem(list.id, $event)" />
                  </template>
                </Draggable>
              </div>
              <div class="item-entry">
                <input v-model="newCardText[list.id]" placeholder="新增卡片" size="small" @keyup.enter="openForm(list.id)" />
                <button type="button" class="primary" @click="openForm(list.id)">新增</button>
              </div>
            </section>
          </template>
        </Draggable>
      </div>
      <div class="new-list">
        <input v-model="newListTitle" placeholder="新增清單" size="small" @keyup.enter="addList" />
        <button type="button" class="primary" @click="addList">新增清單</button>
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
import Draggable from 'vue3-draggable-next'

const board = useBoardStore()
const lists = computed(() => board.lists)
const newListTitle = ref('')
const newCardText = ref({})
const errorMsg = ref('')

// 處理清單拖移 (vue3-draggable-next)
function onListChange(evt) {
  const { moved } = evt
  if (moved) board.moveList(moved.oldIndex, moved.newIndex)
}

// 處理卡片拖移 (vue3-draggable-next)
function onCardChange(list, evt) {
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
function resetLists() { board.resetDefaultLists(); alert('已重設預設清單') }

const detailDialog = reactive({ visible: false, item: {}, listTitle: '' })
const formDialog = reactive({ visible: false, listId: null, data: {}, edit: false, editId: null })
</script>

<style scoped>
.lists-wrapper > div{
  display: flex;
  flex-direction: row;
  gap: 24px;
  align-items: flex-start;
  flex-wrap: nowrap;
  overflow-x: auto;
  width: 70vw;

  box-sizing: border-box;

  justify-content: flex-start;
}
@media (max-width: 800px) {
  .lists-wrapper > div {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
.board-view {
  width: 100vw;
  max-width: 100vw;
  margin: 0;
  padding: 0 0 24px 0;
  background: #f5f8fb;
}
.lists-container {
  display: flex;
  flex-direction: row;
  gap: 24px;
  align-items: flex-start;
  flex-wrap: nowrap;
  overflow-x: auto;
  width: 100vw;
  min-width: 100vw;
  box-sizing: border-box;
  padding: 24px 0 32px 0;
  justify-content: flex-start;
}
.list-column .list-header{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.list-column,
.new-list {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px #1976d21a, 0 1.5px 4px #b6d4ff33;
  width: 320px;
  min-width: 260px;
  margin-bottom: 12px;
  padding: 18px 14px 12px 14px;
  transition: box-shadow 0.2s, transform 0.2s;
  border: 1.5px solid #e3f0fd;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-self: flex-start;
}
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item-entry  {
  display: flex;
  flex-direction: row;
  gap: 8px;
}
.list-column:hover {
  box-shadow: 0 4px 16px #1976d233, 0 2px 8px #b6d4ff44;
  transform: translateY(-2px) scale(1.02);
  border-color: #90caf9;
}
@media (max-width: 800px) {
  .lists-container {
    flex-direction: column;
    align-items: stretch;
    overflow-x: unset;
    gap: 16px;
    width: 100%;
    min-width: 0;
  }
  .list-column,
  .new-list {
    width: 100%;
    min-width: 0;
    margin-bottom: 10px;
    flex-shrink: 1;
  }
  .board-view {
    width: 100%;
    max-width: 100%;
    padding: 0 0 16px 0;
  }
}
input, textarea {
  border: 1.5px solid #e3f0fd;
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 1em;
  outline: none;
  transition: border-color 0.2s;
  background: #f9fbfd;
}
input:focus, textarea:focus {
  border-color: #90caf9;
}
button.warning {
  background-color: #ffc107;
  color: #fff;
  border: none;
  padding: 7px 16px;
  font-size: 15px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 1px 3px #ffd60033;
}
button.danger {
  background-color: #e53935;
  color: #fff;
  border: none;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 1px 3px #e5737333;
}
button.primary {
  background-color: #2196f3;
  color: #fff;
  border: none;
  padding: 7px 18px;
  font-size: 15px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 1px 3px #1976d233;
  transition: background 0.15s, box-shadow 0.15s;
}
button.primary:hover {
  background-color: #1565c0;
}
</style>

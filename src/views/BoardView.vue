<template>
  <div class="board-view">
    <div class="board-header">
      <h2>任務清單</h2>
      <button type="button" class="warning" @click="resetLists">
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
        <!-- 新增清單表單永遠在最右側，明顯區隔 -->
        <section class="new-list-column">
          <div class="new-list-inner">
            <input v-model="newListTitle" placeholder="新增清單" size="small" @keyup.enter="addList" />
            <button type="button" class="primary" @click="addList">新增清單</button>
            <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
          </div>
        </section>
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

<style lang="scss" scoped>
.list-header{
  display: flex;justify-content: space-between;
  ;

}
.board-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 0 32px 0;
  min-height: 100vh;
  box-sizing: border-box;
  background: #f5f8fb;
  position: relative;
}

.board-header {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 8px auto;
  padding: 0 0 0 0;
  box-sizing: border-box;
  background: transparent;
  min-height: 56px;
  h2 {
    margin: 0;
    font-size: 1.6em;
    font-weight: 600;
  }
  button.warning {
    position: absolute;
    right: 0;
    top: 0;
    margin: 0;
    flex-shrink: 0;
  }
}

.lists-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 0 0 32px 0;
  overflow-x: auto;
}

.lists-wrapper {
  white-space: nowrap;
  overflow-x: auto;
  width: 100%;
  box-sizing: border-box;
  padding-bottom: 8px;
}

.list-column, .new-list-column {
  display: inline-block;
  vertical-align: top;
  width: 320px;
  min-width: 220px;
  max-width: 100vw;
  margin: 5px 20px 5px 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px #1976d21a, 0 1.5px 4px #b6d4ff33;
  padding: 18px 14px 12px 14px;
  transition: box-shadow 0.2s, transform 0.2s;
  border: 1.5px solid #e3f0fd;
  align-self: flex-start;
  @media (max-width: 800px) {
    display: block;
    width: 100%;
    min-width: 0;
    margin: 12px 0 18px 0;
    border-radius: 12px;
    box-shadow: 0 1.5px 8px rgba(33,150,243,0.10);
    padding: 10px 6px 16px 6px;
  }
}

.new-list-column {
  background: #f9fbfd;
  border: 2px dashed #90caf9;
  opacity: 0.92;
  box-shadow: 0 1.5px 6px #90caf933;
  .new-list-inner {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    align-items: center;
  }
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-entry {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

@media (max-width: 800px) {
  .lists-wrapper {
    white-space: normal;
    padding-bottom: 0;
  }
  .list-column, .new-list-column {
    display: block;
    width: 100%;
    margin: 12px 0 18px 0;
  }
  .board-header {
    flex-direction: column;
    align-items: flex-start;
    button.warning {
      position: static;
      margin-top: 8px;
    }
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
  &:focus {
    border-color: #90caf9;
  }
}

button {
  &.warning {
    background-color: #ffc107;
    color: #fff;
    border: none;
    padding: 7px 16px;
    font-size: 15px;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 1px 3px #ffd60033;
  }
  &.danger {
    background-color: #e53935;
    color: #fff;
    border: none;
    padding: 6px 12px;
    font-size: 14px;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 1px 3px #e5737333;
  }
  &.primary {
    background-color: #2196f3;
    color: #fff;
    border: none;
    padding: 7px 18px;
    font-size: 15px;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 1px 3px #1976d233;
    transition: background 0.15s, box-shadow 0.15s;
    &:hover {
      background-color: #1565c0;
    }
  }
}
</style>

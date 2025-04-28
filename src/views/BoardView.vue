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
                <button type="button" class="primary" @click="openAddCardDialog(list.id)">新增卡片</button>
              </div>
            </section>
          </template>
        </Draggable>
        <!-- 新增清單表單永遠在最右側，明顯區隔 -->
        <section class="new-list-column">
          <div class="new-list-inner">
            <input v-model="newListTitle" placeholder="新增清單" class="small-input" @keyup.enter="addList" />
            <button type="button" class="primary" @click="addList">新增清單</button>
            <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
          </div>
        </section>
      </div>
    </div>

    <UiModal v-model="formDialog.visible">
      <div class="popup-box-wide">
        <UiItemForm :model-value="formDialog.data" @submit="onFormSubmit" @cancel="closeForm" />
      </div>
    </UiModal>
    <UiModal v-model="addCardDialog.visible">
      <div class="popup-box-wide">
        <h3 style="margin:0 0 8px 0;font-size:1.2em;font-weight:600;">新增卡片</h3>
        <input v-model="addCardDialog.title" placeholder="請輸入卡片標題" style="padding:8px 10px;border-radius:6px;border:1.5px solid #e3f0fd;font-size:1em;outline:none;" @keyup.enter="submitAddCard" />
        <textarea v-model="addCardDialog.description" placeholder="描述 (選填)" style="padding:8px 10px;border-radius:6px;border:1.5px solid #e3f0fd;font-size:1em;min-height:60px;resize:vertical;"></textarea>
        <div style="display:flex;align-items:center;gap:8px;">
          <label style="font-size:0.98em;">日期</label>
          <input v-model="addCardDialog.date" type="date" style="padding:6px 10px;border-radius:6px;border:1.5px solid #e3f0fd;font-size:1em;" />
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <label style="font-size:0.98em;">上傳圖片</label>
          <input type="file" multiple accept="image/*" @change="handleImageUpload" />
          <div v-if="addCardDialog.images.length" style="display:flex;flex-wrap:wrap;gap:8px;">
            <div v-for="(img, idx) in addCardDialog.images" :key="img.url" style="position:relative;display:inline-block;">
              <img :src="img.url" :alt="img.name" style="width:56px;height:56px;object-fit:cover;border-radius:6px;border:1px solid #e3e3e3;" />
              <button @click="removeImage(idx)" style="position:absolute;top:-6px;right:-6px;background:#fff;border:1px solid #e57373;color:#e53935;font-size:1em;border-radius:50%;width:22px;height:22px;line-height:18px;cursor:pointer;">×</button>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:12px;justify-content:flex-end;">
          <button type="button" class="primary" @click="submitAddCard">確定</button>
          <button type="button" class="danger" @click="closeAddCardDialog">取消</button>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useBoardStore } from '@/stores/board'
import Card from '@/components/Card.vue'
import UiItemForm from '@/components/UiItemForm.vue'
import UiModal from '@/components/UiModal.vue'
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

// 新增卡片彈窗狀態
const addCardDialog = reactive({
  visible: false,
  listId: null,
  title: '',
  description: '',
  date: '',
  images: []
})

function openAddCardDialog(listId) {
  addCardDialog.visible = true
  addCardDialog.listId = listId
  addCardDialog.title = ''
  addCardDialog.description = ''
  addCardDialog.date = ''
  addCardDialog.images = []
}
function closeAddCardDialog() {
  addCardDialog.visible = false
  addCardDialog.listId = null
  addCardDialog.title = ''
  addCardDialog.description = ''
  addCardDialog.date = ''
  addCardDialog.images = []
}
async function handleImageUpload(e) {
  const files = Array.from(e.target.files)
  // 轉 base64 預覽
  addCardDialog.images = await Promise.all(files.map(file => {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = ev => resolve({ name: file.name, url: ev.target.result })
      reader.readAsDataURL(file)
    })
  }))
}
function removeImage(idx) {
  addCardDialog.images.splice(idx, 1)
}
function submitAddCard() {
  if (!addCardDialog.title) return
  board.addCard(
    addCardDialog.listId,
    {
      title: addCardDialog.title,
      description: addCardDialog.description,
      date: addCardDialog.date,
      images: addCardDialog.images.map(img => img.url)
    }
  )
  closeAddCardDialog()
}

function addList() {
  errorMsg.value = ''
  if (!newListTitle.value) {
    errorMsg.value = '清單名稱不能為空'
    return
  }
  board.addList(newListTitle.value)
  newListTitle.value = ''
}

function deleteList(id) { board.deleteList(id) }
function openForm(listId) { openAddCardDialog(listId) }
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
.list-header{margin: 0 0 1rem 0;
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
    padding: 0 1rem 0 1rem;
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
    right: 20px;
    top: 0;
    margin: 0;
    flex-shrink: 0;
  }
}
.subtitle{
  padding: 0 1rem 0 1rem;
}

.lists-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 0 1rem 32px 1rem;
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
  width: 345px;
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
    box-sizing: border-box;
    overflow-x: unset;
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
    overflow-x: unset;
    width: 100%;
  }
  .list-column, .new-list-column {
    display: block;
    width: 100%;
    min-width: 0;
    margin: 12px 0 18px 0;
    border-radius: 12px;
    box-shadow: 0 1.5px 8px rgba(33,150,243,0.10);
    padding: 10px 6px 16px 6px;
    box-sizing: border-box;
    overflow-x: unset;
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
  &.small-input {
    width: 100%;
    max-width: 200px;
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

.popup-box-wide {
  min-width: 320px;
  max-width: 520px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
@media (max-width: 600px) {
  .popup-box-wide {
    min-width: 0;
    max-width: 98vw;
    padding: 0 4vw;
  }
}
</style>

<template>
  <div class="board">
    <header class="board-header">
      <div class="header-left">
        <h1>{{ userName }}的任務清單</h1>
      </div>
      <div class="header-right">
        <button class="logout-btn" @click="handleLogout">登出</button>
        <button type="button" class="warning" @click="resetLists">
          <font-awesome-icon :icon="['fas','rotate-right']" />重設清單
        </button>
      </div>
    </header>
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
        <div v-if="addCardDialog.errors.title" class="input-error-text">{{ addCardDialog.errors.title }}</div>
        <textarea v-model="addCardDialog.description" placeholder="描述 (選填)" style="padding:8px 10px;border-radius:6px;border:1.5px solid #e3f0fd;font-size:1em;min-height:60px;resize:vertical;"></textarea>
        <div style="display:flex;align-items:center;gap:8px;">
          <label style="font-size:0.98em;">任務截止日期</label>
          <input v-model="addCardDialog.date" type="datetime-local" style="padding:6px 10px;border-radius:6px;border:1.5px solid #e3f0fd;font-size:1em;" />
          <div class="hint" style="font-size:12px;color:#666;margin-left:4px;">選擇精確到分鐘的截止時間</div>
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
// ===== 主要邏輯區 =====
// 1. 狀態與元件註冊
// 2. 拖曳、表單、彈窗等互動行為
// 3. 清單/卡片 CRUD 操作
import Card from '@/components/Card.vue'
import UiItemForm from '@/components/UiItemForm.vue'
import UiModal from '@/components/UiModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useBoardStore } from '@/stores/board'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Draggable from 'vue3-draggable-next'

// 預設看板 ID
const boardId = 1

const boardStore = useBoardStore()
const authStore = useAuthStore()
const router = useRouter()

// 用戶名稱
const userName = computed(() => authStore.user?.name || '使用者')

// 取得所有清單（reactive，拖曳時自動更新）
const lists = computed(() => boardStore.lists)
// 新增清單的輸入框
const newListTitle = ref('')
// 錯誤訊息顯示
const errorMsg = ref('')

// 初始化時自動 fetch lists from API
onMounted(() => {
  boardStore.fetchLists(boardId)
})

/**
 * 新增清單（需傳入 boardId）
 */
async function addList() {
  if (!newListTitle.value.trim()) {
    errorMsg.value = '請輸入清單名稱'
    return
  }
  errorMsg.value = ''
  await boardStore.addList(boardId, newListTitle.value.trim())
  newListTitle.value = ''
}

/**
 * 刪除清單
 */
async function deleteList(listId) {
  await boardStore.deleteList(listId)
}

// 處理清單拖移（拖曳清單排序）
function onListChange(evt) {
  const { moved } = evt
  if (moved) boardStore.moveList(moved.oldIndex, moved.newIndex)
}

// 處理卡片拖移（卡片在清單間移動）
function onCardChange(list, evt) {
  const { added, removed } = evt
  if (removed && added) {
    boardStore.moveItemAcrossLists(removed.element.listId, list.id, removed.oldIndex, added.newIndex)
  }
}

// 新增卡片彈窗的狀態管理
const addCardDialog = reactive({
  visible: false, // 是否顯示
  listId: null, // 目標清單 id
  title: '', // 卡片標題
  description: '', // 卡片描述
  date: '', // 卡片日期
  errors: {} // 表單驗證錯誤
})

// 驗證新增卡片表單（標題必填、長度限制）
function validateAddCard() {
  const errors = {}
  if (!addCardDialog.title) {
    errors.title = '卡片標題不能為空'
  } else if (addCardDialog.title.length > 40) {
    errors.title = '標題長度不能超過 40 字'
  }
  addCardDialog.errors = errors
  return Object.keys(errors).length === 0
}

// 新增卡片：通過驗證才送出
function submitAddCard() {
  if (!validateAddCard()) return
  boardStore.addCard(
    addCardDialog.listId,
    {
      title: addCardDialog.title,
      description: addCardDialog.description,
      date: addCardDialog.date
    }
  )
  closeAddCardDialog()
}

// 開啟新增卡片彈窗，初始化內容
function openAddCardDialog(listId) {
  addCardDialog.visible = true
  addCardDialog.listId = listId
  addCardDialog.title = ''
  addCardDialog.description = ''
  addCardDialog.date = ''
  addCardDialog.errors = {}
}
// 關閉新增卡片彈窗
function closeAddCardDialog() {
  addCardDialog.visible = false
  addCardDialog.listId = null
  addCardDialog.title = ''
  addCardDialog.description = ''
  addCardDialog.date = ''
  addCardDialog.errors = {}
}

// 編輯卡片表單
function openEditForm(item, list) { formDialog.listId = list.id; formDialog.data = { ...item }; formDialog.edit = true; formDialog.editId = item.id; formDialog.visible = true }
// 表單送出（新增或編輯卡片）
function onFormSubmit(data) { formDialog.edit && formDialog.editId ? boardStore.updateItem(formDialog.listId, { ...data, id: formDialog.editId }) : boardStore.addCard(formDialog.listId, data); closeForm() }
// 關閉表單
function closeForm() { formDialog.visible = false; formDialog.data = {}; formDialog.edit = false; formDialog.editId = null }
// 刪除卡片
function deleteItem(listId, itemId) { boardStore.deleteItem(listId, itemId) }
// 更新卡片內容
function updateItem(listId, item) { boardStore.updateItem(listId, item) }
// 開啟卡片詳情
function openDetail(item, list) { detailDialog.item = { ...item }; detailDialog.listTitle = list.title; detailDialog.visible = true }
// 關閉卡片詳情
function closeDetail() { detailDialog.visible = false }
// 詳情頁直接更新卡片
function onDetailUpdate(item) { boardStore.updateItemByTitle(detailDialog.listTitle, item) }
// 重設預設清單
async function resetLists() {
  try {
    await boardStore.resetDefaultLists(boardId)
  } catch (err) {
    console.error('重設清單失敗', err)
  }
}

// 卡片詳情彈窗狀態
const detailDialog = reactive({ visible: false, item: {}, listTitle: '' })
// 編輯/新增卡片表單彈窗狀態
const formDialog = reactive({ visible: false, listId: null, data: {}, edit: false, editId: null })

// 登出功能
function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.board {
  padding: 1rem;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  .header-left {
    h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #2c3e50;
    }
  }

  .header-right {
    display: flex;
    gap: 1rem;
    align-items: center;

    .logout-btn {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.2s;

      &:hover {
        background-color: #c82333;
      }
    }

    .warning {
      background-color: #ffc107;
      color: #000;

      &:hover {
        background-color: #e0a800;
      }
    }

    button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.2s;
    }
  }
}

.subtitle {
  margin: 0 0 1rem 0;
  color: #6c757d;
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
    color: #000;
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

.input-error-text {
  color: #e53935;
  font-size: 0.92em;
  margin-top: 2px;
  margin-bottom: 6px;
  padding-left: 2px;
}

.list-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 4px;

  .list-drag-handle {
    cursor: move;
    padding: 0 0.5rem;
    color: #6c757d;
    font-size: 1.2rem;
  }

  .list-title {
    flex: 1;
    margin: 0;
    padding: 0 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: #2c3e50;
    text-align: center;
  }

  button.danger {
    padding: 0.3rem 0.5rem;
    font-size: 0.9rem;
    background: transparent;
    color: #dc3545;
    box-shadow: none;

    &:hover {
      background-color: #dc354520;
    }
  }
}
</style>

import { defineStore } from 'pinia'

const STORAGE_KEY = 'trello_lists_v3'

// 預設三清單結構
export const defaultLists = [
  { id: 1, title: '待辦', items: [ { id: 11, title: '範例任務1', description: '說明...', subItems: [], images: [], createdAt: '2024-03-16T03:24:00.000Z' } ] },
  { id: 2, title: '進行中', items: [ { id: 21, title: '範例任務2', description: '', subItems: [], images: [], createdAt: '2024-03-16T03:24:00.000Z' } ] },
  { id: 3, title: '完成', items: [] }
]

function loadLists() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    return null
  }
}
function saveLists(lists) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists))
  } catch (e) {}
}

export const useBoardStore = defineStore('board', {
  state: () => ({
    lists: loadLists() || JSON.parse(JSON.stringify(defaultLists))
  }),
  actions: {
    // 移動整個清單
    moveList(oldIndex, newIndex) {
      const list = this.lists.splice(oldIndex, 1)[0]
      this.lists.splice(newIndex, 0, list)
      this.persist()
    },
    // 跨清單移動卡片
    moveItemAcrossLists(fromListId, toListId, fromIdx, toIdx) {
      const fromList = this.lists.find(l => l.id === fromListId)
      const toList = this.lists.find(l => l.id === toListId)
      if (!fromList || !toList) return
      const item = fromList.items.splice(fromIdx, 1)[0]
      toList.items.splice(toIdx, 0, item)
      this.persist()
    },
    persist() {
      saveLists(this.lists)
    },
    resetDefaultLists() {
      this.lists = JSON.parse(JSON.stringify(defaultLists))
      this.persist()
      console.log('[Pinia] 已重設為預設三清單')
    },
    addList(title) {
      console.log('[Pinia] addList called, title:', title)
      if (!title) {
        console.warn('[Pinia] 新增清單失敗：名稱為空')
        return
      }
      this.lists.push({ id: Date.now(), title, items: [] })
      this.persist()
      console.log('[Pinia] 新增清單成功，lists:', this.lists)
    },
    deleteList(listId) {
      this.lists = this.lists.filter(l => l.id !== listId)
      this.persist()
    },
    addCard(listId, cardData) {
      console.log('[Pinia] addCard called, listId:', listId, 'cardData:', cardData)
      let card
      if (typeof cardData === 'string') {
        if (!cardData) {
          console.warn('[Pinia] 新增卡片失敗：名稱為空')
          return
        }
        card = {
          id: Date.now(),
          title: cardData,
          description: '',
          subItems: [],
          images: [],
          createdAt: new Date().toISOString(),
        }
      } else if (typeof cardData === 'object' && cardData) {
        // 嚴格檢查 cardData.title 型別，完全不呼叫 .trim()
        if (typeof cardData.title !== 'string' || !cardData.title) {
          console.warn('[Pinia] 新增卡片失敗：名稱為空或型別錯誤')
          return
        }
        card = {
          id: Date.now(),
          ...cardData,
          title: cardData.title,
          createdAt: new Date().toISOString(),
          subItems: Array.isArray(cardData.subItems) ? cardData.subItems : [],
          images: Array.isArray(cardData.images) ? cardData.images : [],
        }
      } else {
        console.warn('[Pinia] 新增卡片失敗：資料型別錯誤')
        return
      }
      const list = this.lists.find(l => l.id === listId)
      if (list) {
        list.items.push(card)
        this.persist()
        console.log('[Pinia] 新增卡片成功，list:', list)
      } else {
        console.warn('[Pinia] 新增卡片失敗：找不到清單', listId)
      }
    },
    deleteItem(listId, itemId) {
      const list = this.lists.find(l => l.id === listId)
      if (list) {
        list.items = list.items.filter(i => i.id !== itemId)
        this.persist()
      }
    },
    updateItem(listId, updatedItem) {
      const list = this.lists.find(l => l.id === listId)
      if (list) {
        const idx = list.items.findIndex(i => i.id === updatedItem.id)
        if (idx !== -1) {
          list.items[idx] = { ...updatedItem }
          this.persist()
        }
      }
    },
    updateItemByTitle(listTitle, updatedItem) {
      const list = this.lists.find(l => l.title === listTitle)
      if (list) {
        const idx = list.items.findIndex(i => i.id === updatedItem.id)
        if (idx !== -1) {
          list.items[idx] = { ...updatedItem }
          this.persist()
        }
      }
    }
  }
})

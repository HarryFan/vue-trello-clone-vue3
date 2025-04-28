/**
 * Trello-like看板的核心資料儲存與操作邏輯
 * 使用Pinia管理看板的清單和卡片資料
 */
import { defineStore } from 'pinia'

/** 本地儲存的鍵名，用於保存看板資料 */
const STORAGE_KEY = 'trello_lists_v3'

/**
 * 預設看板結構，包含三個清單：待辦、進行中、完成
 * 每個清單包含範例卡片，展示資料結構
 */
export const defaultLists = [
  { id: 1, title: '待辦', items: [{ id: 11, title: '範例任務1', description: '說明...', subItems: [], images: [], createdAt: '2024-03-16T03:24:00.000Z' }] },
  { id: 2, title: '進行中', items: [{ id: 21, title: '範例任務2', description: '', subItems: [], images: [], createdAt: '2024-03-16T03:24:00.000Z' }] },
  { id: 3, title: '完成', items: [] }
]

/**
 * 從localStorage讀取保存的看板資料
 * @returns {Array|null} 成功返回看板資料陣列，失敗返回null
 */
function loadLists() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    return null
  }
}

/**
 * 將看板資料保存到localStorage
 * @param {Array} lists - 要保存的看板資料
 */
function saveLists(lists) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists))
  } catch (e) { }
}

/**
 * 看板資料管理的Pinia Store
 */
export const useBoardStore = defineStore('board', {
  /**
   * 初始化Store狀態
   * 嘗試從localStorage載入資料，若無則使用預設值
   */
  state: () => ({
    lists: loadLists() || JSON.parse(JSON.stringify(defaultLists))
  }),
  actions: {
    /**
     * 移動整個清單位置
     * @param {number} oldIndex - 清單原始位置
     * @param {number} newIndex - 清單目標位置
     */
    moveList(oldIndex, newIndex) {
      const list = this.lists.splice(oldIndex, 1)[0]
      this.lists.splice(newIndex, 0, list)
      this.persist()
    },

    /**
     * 跨清單移動卡片
     * @param {number} fromListId - 來源清單ID
     * @param {number} toListId - 目標清單ID
     * @param {number} fromIdx - 卡片在來源清單中的索引
     * @param {number} toIdx - 卡片在目標清單中的目標索引
     */
    moveItemAcrossLists(fromListId, toListId, fromIdx, toIdx) {
      const fromList = this.lists.find(l => l.id === fromListId)
      const toList = this.lists.find(l => l.id === toListId)
      if (!fromList || !toList) return
      const item = fromList.items.splice(fromIdx, 1)[0]
      toList.items.splice(toIdx, 0, item)
      this.persist()
    },

    /**
     * 保存當前狀態到localStorage
     */
    persist() {
      saveLists(this.lists)
    },

    /**
     * 重設看板為預設三清單結構
     */
    resetDefaultLists() {
      this.lists = JSON.parse(JSON.stringify(defaultLists))
      this.persist()
      console.log('[Pinia] 已重設為預設三清單')
    },

    /**
     * 新增清單
     * @param {string} title - 清單標題
     */
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

    /**
     * 刪除指定ID的清單
     * @param {number} listId - 要刪除的清單ID
     */
    deleteList(listId) {
      this.lists = this.lists.filter(l => l.id !== listId)
      this.persist()
    },

    /**
     * 新增卡片到指定清單
     * @param {number} listId - 目標清單ID
     * @param {string|object} cardData - 卡片資料，可以是標題字串或完整卡片物件
     */
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

    /**
     * 從指定清單中刪除卡片
     * @param {number} listId - 清單ID
     * @param {number} itemId - 要刪除的卡片ID
     */
    deleteItem(listId, itemId) {
      const list = this.lists.find(l => l.id === listId)
      if (list) {
        list.items = list.items.filter(i => i.id !== itemId)
        this.persist()
      }
    },

    /**
     * 更新指定清單中的卡片資料
     * @param {number} listId - 清單ID
     * @param {object} updatedItem - 包含更新資料的卡片物件，必須包含id
     */
    updateItem(listId, updatedItem) {
      const list = this.lists.find(l => l.id === listId)
      if (list) {
        const idx = list.items.findIndex(i => i.id === updatedItem.id)
        if (idx !== -1) {
          // 若有 updatedItem.date，則同步更新卡片的 date
          list.items[idx] = {
            ...list.items[idx],
            ...updatedItem,
            date: updatedItem.date !== undefined ? updatedItem.date : list.items[idx].date,
          }
          this.persist()
        }
      }
    },

    /**
     * 根據清單標題更新卡片資料
     * @param {string} listTitle - 清單標題
     * @param {object} updatedItem - 包含更新資料的卡片物件，必須包含id
     */
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

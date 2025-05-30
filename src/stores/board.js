/**
 * Trello-like 看板資料管理 Pinia Store
 * 完整串接後端 API，確保資料一致性。
 * - CRUD 皆以 API 回傳資料為主
 * - 本地 localStorage 僅做快取
 */
import { defineStore } from 'pinia'
import {
  getLists,
  createList,
  deleteList as apiDeleteList,
  getCards,
  createCard,
  updateCard,
  deleteCard as apiDeleteCard,
  resetBoard
} from '@/services/apiService'

const STORAGE_KEY = 'trello_lists_v3'

/**
 * 從 localStorage 讀取 lists 快取
 * @returns {Array|null}
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
 * lists 寫入 localStorage
 * @param {Array} lists
 */
function saveLists(lists) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists))
  } catch (e) {}
}

export const useBoardStore = defineStore('board', {
  state: () => ({
    /**
     * lists 結構：[{ id, title, items: [card...] }]
     */
    lists: [],
    loading: false
  }),
  actions: {
    /**
     * 初始化：從 API 載入 lists 與 cards
     * @param {number} boardId
     */
    async fetchLists(boardId) {
      this.loading = true
      
      // 清除舊快取，確保每次都從 API 獲取最新資料
      localStorage.removeItem(STORAGE_KEY)
      
      try {
        const res = await getLists(boardId)
        const lists = res.data?.data || res.data || []
        
        console.log('API 返回的清單資料:', lists)
        
        // 處理清單資料，確保結構正確
        const listsWithCards = lists.map(list => {
          // 檢查清單是否已包含卡片資料
          if (list.cards) {
            // API 已經返回了卡片資料，直接使用
            return { ...list, items: list.cards }
          } else {
            // 如果沒有卡片資料，設為空陣列
            return { ...list, items: [] }
          }
        })
        
        // 檢查是否需要再次請求卡片資料
        if (listsWithCards.length > 0 && !lists[0].cards) {
          // 原始 API 回傳沒有包含卡片，需要個別請求
          const finalLists = await Promise.all(
            listsWithCards.map(async l => {
              try {
                const cardsRes = await getCards(l.id)
                const cards = cardsRes.data?.data || cardsRes.data || []
                return { ...l, items: cards }
              } catch (error) {
                console.error(`獲取清單 ${l.id} 的卡片失敗:`, error)
                return l
              }
            })
          )
          this.lists = finalLists
        } else {
          // 直接使用已處理的資料
          this.lists = listsWithCards
        }
        
        // 儲存到本地快取
        saveLists(this.lists)
      } catch (err) {
        console.error('[Pinia] 載入清單失敗:', err)
        
        // 若 API 失敗，fallback localStorage
        const cache = loadLists()
        if (cache) this.lists = cache
      } finally {
        this.loading = false
      }
    },

    /**
     * 新增清單（串接 API，id 以後端為主）
     * @param {number} boardId
     * @param {string} title
     */
    async addList(boardId, title) {
      if (!title) return
      try {
        const res = await createList(boardId, { title })
        const list = res.data
        if (list) {
          this.lists.push({ ...list, items: [] })
          saveLists(this.lists)
        }
      } catch (err) {
        console.error('[Pinia] 新增清單 API 失敗', err)
      }
    },

    /**
     * 刪除清單（串接 API）
     * @param {number} listId
     */
    async deleteList(listId) {
      try {
        await apiDeleteList(listId)
        this.lists = this.lists.filter(l => l.id !== listId)
        saveLists(this.lists)
      } catch (err) {
        console.error('[Pinia] 刪除清單 API 失敗', err)
      }
    },

    /**
     * 新增卡片（串接 API）
     * @param {number} listId
     * @param {object} cardData
     */
    async addCard(listId, cardData) {
      try {
        const res = await createCard(listId, cardData)
        const card = res.data?.data || res.data
        const list = this.lists.find(l => l.id === listId)
        if (list && card) {
          list.items.push(card)
          saveLists(this.lists)
        }
      } catch (err) {
        console.error('[Pinia] 新增卡片 API 失敗', err)
      }
    },

    /**
     * 刪除卡片（串接 API）
     * @param {number} listId
     * @param {number} cardId
     */
    async deleteItem(listId, cardId) {
      try {
        await apiDeleteCard(cardId)
        const list = this.lists.find(l => l.id === listId)
        if (list) {
          list.items = list.items.filter(i => i.id !== cardId)
          saveLists(this.lists)
        }
      } catch (err) {
        console.error('[Pinia] 刪除卡片 API 失敗', err)
      }
    },

    /**
     * 更新卡片（串接 API）
     * @param {number} listId
     * @param {object} updatedItem 必須含 id
     */
    async updateItem(listId, updatedItem) {
      try {
        const res = await updateCard(updatedItem.id, updatedItem)
        const card = res.data?.data || res.data
        const list = this.lists.find(l => l.id === listId)
        if (list && card) {
          const idx = list.items.findIndex(i => i.id === card.id)
          if (idx !== -1) {
            list.items[idx] = { ...list.items[idx], ...card }
            saveLists(this.lists)
          }
        }
      } catch (err) {
        console.error('[Pinia] 更新卡片 API 失敗', err)
      }
    },

    /**
     * 拖曳/排序功能（純前端）
     */
    moveList(oldIndex, newIndex) {
      const list = this.lists.splice(oldIndex, 1)[0]
      this.lists.splice(newIndex, 0, list)
      saveLists(this.lists)
    },
    moveItemAcrossLists(fromListId, toListId, fromIdx, toIdx) {
      const fromList = this.lists.find(l => l.id === fromListId)
      const toList = this.lists.find(l => l.id === toListId)
      if (!fromList || !toList) return
      const item = fromList.items.splice(fromIdx, 1)[0]
      toList.items.splice(toIdx, 0, item)
      saveLists(this.lists)
    },
    persist() {
      saveLists(this.lists)
    },
    /**
     * 重設看板為預設狀態
     * @param {number} boardId
     */
    async resetDefaultLists(boardId) {
      try {
        await resetBoard(boardId)
        await this.fetchLists(boardId)
      } catch (err) {
        console.error('[Pinia] 重設看板 API 失敗', err)
      }
    }
  }
})

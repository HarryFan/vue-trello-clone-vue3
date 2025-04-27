import { defineStore } from 'pinia'

const STORAGE_KEY = 'trello_lists_v3'

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
    lists: loadLists() || [
      { id: 1, title: '待辦', items: [ { id: 11, title: '範例任務1', description: '說明...', subItems: [], images: [] } ] },
      { id: 2, title: '進行中', items: [ { id: 21, title: '範例任務2', description: '', subItems: [], images: [] } ] },
    ]
  }),
  actions: {
    persist() {
      saveLists(this.lists)
    },
    addList(title) {
      if (!title || !title.trim()) return
      this.lists.push({ id: Date.now(), title, items: [] })
      this.persist()
    },
    deleteList(listId) {
      this.lists = this.lists.filter(l => l.id !== listId)
      this.persist()
    },
    addCard(listId, title) {
      if (!title || !title.trim()) return
      const list = this.lists.find(l => l.id === listId)
      if (list) {
        list.items.push({ id: Date.now(), title, description: '', subItems: [], images: [] })
        this.persist()
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

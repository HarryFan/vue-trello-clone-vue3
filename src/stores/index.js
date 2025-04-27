// Pinia store 入口，可依需求拆分多個 store
import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    // 在此放全域狀態
    user: null,
    loading: false,
  }),
  actions: {
    setUser(user) {
      this.user = user
    },
    setLoading(val) {
      this.loading = val
    }
  }
})

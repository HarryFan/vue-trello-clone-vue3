import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '@/services/apiService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('trello_user')) || null,
    token: localStorage.getItem('trello_token') || null,
    loading: false,
    error: null,
  }),
  
  getters: {
    isAuthenticated() {
      return !!this.token && !!this.user
    }
  },
  
  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiService.login(credentials)
        const userData = response.data
        
        // 儲存使用者資訊和 token
        this.user = userData
        this.token = userData.token
        
        localStorage.setItem('trello_user', JSON.stringify(userData))
        localStorage.setItem('trello_token', userData.token)
        
        return userData
      } catch (error) {
        this.error = error.response?.data?.messages || '登入失敗，請確認帳號密碼'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    logout() {
      // 清除使用者資訊和 token
      this.user = null
      this.token = null
      localStorage.removeItem('trello_user')
      localStorage.removeItem('trello_token')
    }
  }
})

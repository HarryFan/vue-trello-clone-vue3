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
        
        // 修正：獲取正確的用戶數據和令牌
        const responseData = response.data
        
        if (responseData.status === 'success' && responseData.user) {
          // 從回應中正確提取用戶資料和令牌
          this.user = responseData.user
          this.token = responseData.user.token
          
          localStorage.setItem('trello_user', JSON.stringify(responseData.user))
          localStorage.setItem('trello_token', responseData.user.token)
          
          // 觸發用戶已登入事件，啟動通知服務
          document.dispatchEvent(new Event('userAuthenticated'))
          
          return responseData.user
        } else {
          throw new Error(responseData.message || '登入回應格式不正確')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || '登入失敗，請確認帳號密碼'
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
      
      // 觸發用戶已登出事件，停止通知服務
      document.dispatchEvent(new Event('userLoggedOut'))
    }
  }
})

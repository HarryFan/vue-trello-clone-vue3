import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as apiLogin } from '@/services/apiService'

const TOKEN_KEY = 'trello_token'
const USER_KEY = 'trello_user'
const USER_ID_KEY = 'trello_user_id'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))
  const userId = ref(localStorage.getItem(USER_ID_KEY) || '')
  const loading = ref(false)

  const isAuthenticated = () => Boolean(token.value)

  const login = async (email, password) => {
    loading.value = true
    try {
      const res = await apiLogin({ email, password })
      const { token: newToken, ...userData } = res.data

      token.value = newToken
      user.value = userData
      userId.value = userData.id

      localStorage.setItem(TOKEN_KEY, newToken)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      localStorage.setItem(USER_ID_KEY, userData.id)

      return userData
    } catch (err) {
      console.error('[Auth] 登入失敗', err)
      throw new Error(err.response?.data?.message || '登入失敗，請稍後再試')
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = ''
    user.value = null
    userId.value = ''
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(USER_ID_KEY)
  }

  return {
    token,
    user,
    userId,
    loading,
    isAuthenticated,
    login,
    logout
  }
})

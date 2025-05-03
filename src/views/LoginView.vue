<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>簡易任務管理系統</h1>
        <p>請登入以繼續</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">帳號</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            placeholder="請輸入帳號" 
            required
            autocomplete="email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密碼</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            placeholder="請輸入密碼" 
            required
            autocomplete="current-password"
          />
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <button type="submit" :disabled="isLoading" class="login-button">
          {{ isLoading ? '登入中...' : '登入' }}
        </button>
        
        <div class="login-help">
          <p>測試帳號：harry750110@gmail.com</p>
          <p>測試密碼：12345678</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = '請輸入帳號和密碼'
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    await authStore.login({
      email: email.value,
      password: password.value
    })
    router.push('/')
  } catch (error) {
    errorMessage.value = error.message || '登入失敗，請確認帳號密碼'
    console.error('登入失敗', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 1.8rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #6c757d;
    font-size: 1rem;
  }
}

.login-form {
  .form-group {
    margin-bottom: 1.5rem;
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #2c3e50;
    }
    
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      font-size: 1rem;
      color: #495057;
      transition: border-color 0.2s;
      
      &:focus {
        outline: none;
        border-color: #4dabf7;
        box-shadow: 0 0 0 2px rgba(77, 171, 247, 0.2);
      }
    }
  }
  
  .error-message {
    color: #dc3545;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    padding: 0.5rem;
    background-color: #f8d7da;
    border-radius: 4px;
  }
  
  .login-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #0069d9;
    }
    
    &:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
  }
  
  .login-help {
    margin-top: 1.5rem;
    text-align: center;
    color: #6c757d;
    font-size: 0.9rem;
    
    p {
      margin: 0.2rem 0;
    }
  }
}
</style>

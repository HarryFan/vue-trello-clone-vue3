<template>
  <div class="login-container">
    <div class="login-box">
      <h1>登入</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">電子郵件</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="請輸入電子郵件"
          />
        </div>
        <div class="form-group">
          <label for="password">密碼</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="請輸入密碼"
          />
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '登入中...' : '登入' }}
        </button>
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

const email = ref('harry750110@gmail.com')  // 預設帳號
const password = ref('12345678')  // 預設密碼
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (loading.value) return

  loading.value = true
  error.value = ''

  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.message || '登入失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9fafc;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-box h1 {
  text-align: center;
  color: #42526e;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #42526e;
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #0052cc;
}

button {
  background-color: #0052cc;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #0047b3;
}

button:disabled {
  background-color: #dfe1e6;
  cursor: not-allowed;
}

.error-message {
  color: #de350b;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 0.5rem;
}
</style>

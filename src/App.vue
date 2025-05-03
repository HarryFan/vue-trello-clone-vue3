<template>
  <router-view></router-view>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { NotificationService } from '@/services/notificationService'
import { healthCheck } from '@/services/apiService'

const authStore = useAuthStore()
const notificationService = ref(null)

// 當用戶登入後啟動通知服務
onMounted(() => {
  if (authStore.isAuthenticated()) {
    notificationService.value = new NotificationService()
    notificationService.value.startPolling()
  }
})

// 當用戶登出時停止通知服務
onUnmounted(() => {
  if (notificationService.value) {
    notificationService.value.stopPolling()
  }
})

// 健康檢查
healthCheck()
  .then(res => {
    console.log(res.data)
  })
  .catch(err => {
    console.error('API 連線失敗', err)
  })
</script>

<style>
#app {
  font-family: 'Noto Sans TC', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: #f8fafc;
}
</style>

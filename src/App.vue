<template>
  <router-view />
</template>

<script setup>
import { healthCheck } from '@/services/apiService'

healthCheck()
  .then(res => {
    console.log(res.data) // 應顯示 { status: 'ok', message: 'API service 運作正常' }
  })
  .catch(err => {
    console.error('API 連線失敗', err)
  })
</script>

<style>
body {
  font-family: 'Segoe UI', 'PingFang TC', 'Helvetica Neue', Arial, '微軟正黑體', sans-serif;
  background: #f2f7fb;
  margin: 0;
}

#app {
  padding: 32px 0 32px 0;
  max-width: 1440px;
  margin: 0 auto;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>

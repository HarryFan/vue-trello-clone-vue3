<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { healthCheck, initApi } from '@/services/apiService'

onMounted(async () => {
  try {
    // 動態檢測並初始化 API 端點
    await initApi()
    await healthCheck()
    console.log('API 連線成功')
  } catch (error) {
    console.error('API 連線失敗', error)
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  background-color: #f8f9fa;
}

button {
  cursor: pointer;
  border: none;
  font-family: inherit;
}

a {
  text-decoration: none;
  color: inherit;
}

ul {
  list-style: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

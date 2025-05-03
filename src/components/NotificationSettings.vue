<template>
  <div class="notification-settings">
    <h3>通知設定</h3>
    
    <div class="form-group">
      <label>
        <input type="checkbox" v-model="preferences.browser" />
        接收瀏覽器桌面通知
      </label>
    </div>
    
    <div class="form-group">
      <label>
        <input type="checkbox" v-model="preferences.email" />
        接收電子郵件提醒
      </label>
    </div>
    
    <div class="form-group" v-if="preferences.email">
      <label>電子郵件地址</label>
      <input type="email" v-model="emailAddress" placeholder="請輸入電子郵件" />
      <button @click="testEmail" :disabled="!isValidEmail">測試電子郵件</button>
      <p v-if="emailMessage" class="email-message" :class="emailStatus">{{ emailMessage }}</p>
    </div>
    
    <div class="form-group">
      <label>檢查頻率 (秒)</label>
      <select v-model="preferences.pollingInterval">
        <option :value="10000">10 秒</option>
        <option :value="30000">30 秒</option>
        <option :value="60000">1 分鐘</option>
        <option :value="300000">5 分鐘</option>
      </select>
    </div>
    
    <div class="form-group">
      <label>提前提醒時間 (分鐘)</label>
      <select v-model="preferences.emailLeadTime">
        <option :value="15">15 分鐘</option>
        <option :value="30">30 分鐘</option>
        <option :value="60">1 小時</option>
        <option :value="1440">1 天</option>
      </select>
    </div>
    
    <div class="actions">
      <button class="primary" @click="saveSettings">儲存設定</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { NotificationService } from '@/services/notificationService'

const authStore = useAuthStore()
const notificationService = new NotificationService()

const preferences = reactive({
  browser: true,
  email: true,
  pollingInterval: 30000,
  emailLeadTime: 60
})

const emailAddress = ref('')
const emailMessage = ref('')
const emailStatus = ref('')

// 載入現有設定
onMounted(() => {
  const savedPrefs = notificationService.loadPreferences()
  Object.assign(preferences, savedPrefs)
  
  if (authStore.user?.email) {
    emailAddress.value = authStore.user.email
  }
})

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(emailAddress.value)
})

async function testEmail() {
  if (!isValidEmail.value) return
  
  try {
    emailMessage.value = '正在發送測試郵件...'
    emailStatus.value = 'pending'
    
    await notificationService.testEmail(emailAddress.value)
    
    emailMessage.value = '測試郵件已發送，請檢查您的郵箱'
    emailStatus.value = 'success'
  } catch (error) {
    emailMessage.value = `發送失敗: ${error.message}`
    emailStatus.value = 'error'
  }
}

function saveSettings() {
  // 儲存電子郵件
  if (preferences.email && isValidEmail.value) {
    // 更新使用者電子郵件（如果有需要，需在 auth store 實現 updateUserEmail 方法）
    // authStore.updateUserEmail(emailAddress.value)
  }
  
  // 儲存通知偏好
  notificationService.savePreferences(preferences)
  
  // 顯示成功訊息
  alert('通知設定已儲存')
}
</script>

<style scoped>
.notification-settings {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

input[type="checkbox"] {
  margin-right: 8px;
}

input[type="email"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
}

select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

.email-message {
  font-size: 14px;
  margin-top: 4px;
}

.email-message.pending {
  color: #2196F3;
}

.email-message.success {
  color: #4CAF50;
}

.email-message.error {
  color: #F44336;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #e0e0e0;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.primary {
  background-color: #2196F3;
  color: white;
}

.actions {
  margin-top: 24px;
  text-align: right;
}
</style>

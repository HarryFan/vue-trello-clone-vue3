import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTrash, faPenToSquare, faStar, faBell, faRotateRight } from '@fortawesome/free-solid-svg-icons'
import apiService from './services/apiService'
import { NotificationService } from './services/notificationService'

// 初始化 Font Awesome 圖示
library.add(faTrash, faPenToSquare, faStar, faBell, faRotateRight)

// 初始化通知服務
const notificationService = new NotificationService()

// 監聽身分驗證狀態
document.addEventListener('userAuthenticated', () => {
  // 用戶登入後啟動通知輪詢
  notificationService.startPolling()
  console.log('通知服務已啟動')
})

document.addEventListener('userLoggedOut', () => {
  // 用戶登出後停止通知輪詢
  notificationService.stopPolling()
  console.log('通知服務已停止')
})

// 全域掛載通知服務
const app = createApp(App)
app.config.globalProperties.$notificationService = notificationService

app.component('font-awesome-icon', FontAwesomeIcon)

app.use(router)
app.use(createPinia())
app.mount('#app')

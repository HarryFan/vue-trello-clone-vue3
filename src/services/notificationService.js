import * as apiService from './apiService'
import router from '@/router'

export class NotificationService {
  constructor() {
    this.checkPermission()
    this.pollingInterval = 30000 // 30秒
    this.timer = null
    this.notificationPreference = this.loadPreferences()
    this.notificationLogs = this.loadNotificationLogs()
    // 立即記錄調試信息
    console.log('NotificationService 初始化完成', {
      permission: Notification.permission,
      preference: this.notificationPreference
    })
  }

  // 載入通知偏好設定
  loadPreferences() {
    const preferences = localStorage.getItem('notification_preferences')
    if (preferences) {
      return JSON.parse(preferences)
    }
    return {
      browser: true,
      email: true,
      pollingInterval: 30000,
      emailLeadTime: 60 // 電子郵件提前 60 分鐘提醒
    }
  }

  // 儲存通知偏好設定
  savePreferences(preferences) {
    this.notificationPreference = { ...this.notificationPreference, ...preferences }
    localStorage.setItem('notification_preferences', JSON.stringify(this.notificationPreference))
    
    // 更新後端通知設定
    this.updateServerPreferences()
    
    // 更新輪詢間隔
    if (this.timer) {
      this.stopPolling()
      this.startPolling()
    }
  }
  
  // 載入通知歷史記錄
  loadNotificationLogs() {
    const logs = localStorage.getItem('notification_logs')
    return logs ? JSON.parse(logs) : []
  }
  
  // 儲存通知歷史記錄
  saveNotificationLog(notification) {
    // 確保通知記錄陣列已初始化
    if (!this.notificationLogs) {
      this.notificationLogs = []
    }
    
    // 建立包含時間戳記的通知記錄
    const log = {
      id: `notify-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: notification.title,
      body: notification.body,
      data: notification.data,
      read: false
    }
    
    // 將新記錄加入陣列前端
    this.notificationLogs.unshift(log)
    
    // 限制記錄數量，保留最新的100條
    if (this.notificationLogs.length > 100) {
      this.notificationLogs = this.notificationLogs.slice(0, 100)
    }
    
    // 儲存到 localStorage
    localStorage.setItem('notification_logs', JSON.stringify(this.notificationLogs))
    
    // 更新未讀通知數量
    this.updateUnreadCount()
    
    return log
  }
  
  // 獲取所有通知記錄
  getNotificationLogs() {
    return this.notificationLogs
  }
  
  // 將通知標記為已讀
  markAsRead(notificationId) {
    const index = this.notificationLogs.findIndex(log => log.id === notificationId)
    if (index !== -1) {
      this.notificationLogs[index].read = true
      localStorage.setItem('notification_logs', JSON.stringify(this.notificationLogs))
      this.updateUnreadCount()
    }
  }
  
  // 將所有通知標記為已讀
  markAllAsRead() {
    this.notificationLogs.forEach(log => {
      log.read = true
    })
    localStorage.setItem('notification_logs', JSON.stringify(this.notificationLogs))
    this.updateUnreadCount()
  }
  
  // 獲取未讀通知數量
  getUnreadCount() {
    return this.notificationLogs.filter(log => !log.read).length
  }
  
  // 更新未讀通知數量
  updateUnreadCount() {
    const count = this.getUnreadCount()
    // 觸發自訂事件，讓 UI 能夠反應未讀通知數量變化
    document.dispatchEvent(new CustomEvent('notificationCountChanged', { 
      detail: { count } 
    }))
    return count
  }
  
  // 更新後端通知設定
  async updateServerPreferences() {
    try {
      await apiService.post('/api/notifications/settings', this.notificationPreference)
    } catch (error) {
      console.error('更新通知設定失敗:', error)
    }
  }

  // 檢查通知權限
  async checkPermission() {
    if (!('Notification' in window)) {
      console.warn('此瀏覽器不支援通知功能')
      return false
    }

    console.log('當前通知權限狀態:', Notification.permission)

    if (Notification.permission === 'granted') {
      console.log('通知權限已獲授權')
      return true
    }

    if (Notification.permission !== 'denied') {
      try {
        console.log('請求通知權限...')
        const permission = await Notification.requestPermission()
        console.log('通知權限請求結果:', permission)
        return permission === 'granted'
      } catch (error) {
        console.error('請求通知權限時發生錯誤:', error)
        return false
      }
    }

    console.warn('通知權限已被用戶拒絕')
    return false
  }

  // 開始輪詢
  startPolling() {
    if (this.timer) return
    this.checkUpcoming()
    this.timer = setInterval(() => this.checkUpcoming(), 
      this.notificationPreference.pollingInterval || this.pollingInterval)
    
    console.log(`通知服務已啟動，輪詢間隔: ${this.notificationPreference.pollingInterval || this.pollingInterval}ms`)
    return true
  }

  // 停止輪詢
  stopPolling() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
      console.log('通知服務已停止')
      return true
    }
    return false
  }

  // 檢查即將到期任務
  async checkUpcoming() {
    try {
      console.log('開始檢查即將到期任務...')
      const response = await apiService.get('/api/notifications/upcoming')
      console.log('API返回數據:', response)
      
      const { data } = response.data
      
      if (data && data.length > 0) {
        console.log(`找到 ${data.length} 個即將到期任務`)
        data.forEach(task => {
          // 準備通知內容
          const title = '任務即將到期'
          
          // 格式化描述內容，包含任務標題、描述(如果有)、所屬清單和截止時間
          const taskDescription = task.description ? `\n${task.description}` : ''
          const formattedDeadline = this.formatDeadline(task.deadline)
          
          // 處理清單顯示，API 可能返回 list_title 或 listTitle
          const listTitle = task.list_title || task.listTitle || '未分類'
          
          const body = `${task.title}${taskDescription}\n\n清單：${listTitle}\n到期時間：${formattedDeadline}`
          
          // 無論瀏覽器通知設定如何，都顯示頁面內通知
          this.createInPageNotification(title, body, task)
          
          // 如果啟用了瀏覽器通知，嘗試顯示瀏覽器通知
          if (this.notificationPreference.browser) {
            this.showNotification(task)
          }
        })
      } else {
        console.log('沒有發現即將到期的任務')
      }
    } catch (error) {
      console.error('檢查到期任務失敗:', error)
    }
  }

  // 顯示通知
  async showNotification(task) {
    console.log('嘗試顯示通知:', task)
    
    // 準備通知內容
    const title = '任務即將到期'
    
    // 格式化描述內容，包含任務標題、描述(如果有)、所屬清單和截止時間
    const taskDescription = task.description ? `\n${task.description}` : ''
    const formattedDeadline = this.formatDeadline(task.deadline)
    
    // 處理清單顯示，API 可能返回 list_title 或 listTitle
    const listTitle = task.list_title || task.listTitle || '未分類'
    
    const body = `${task.title}${taskDescription}\n\n清單：${listTitle}\n到期時間：${formattedDeadline}`
    
    console.log('通知內容:', body)
    
    // 優先使用頁面內通知 (作為備用方案，確保用戶能看到通知)
    this.createInPageNotification(title, body, task)
    
    // 嘗試發送瀏覽器通知
    if (this.permission === 'granted') {
      try {
        const options = {
          body: body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          silent: false,
          requireInteraction: true
        }
        
        const notification = new Notification(title, options)
        console.log('通知已成功創建:', notification)
        
        // 紀錄通知
        this.logNotification(task)
        
        console.log('已發送通知:', title + ' - ' + body)
      } catch (error) {
        console.error('顯示通知時發生錯誤:', error)
      }
    } else {
      console.log('通知權限未被授予，無法顯示瀏覽器通知')
    }
  }
  
  // 建立頁面內通知 (備用方案)
  createInPageNotification(title, body, task) {
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = '20px'
    container.style.right = '20px'
    container.style.zIndex = '9999'
    container.style.backgroundColor = '#ffffff'
    container.style.color = '#333333'
    container.style.padding = '15px'
    container.style.borderRadius = '8px'
    container.style.boxShadow = '0 5px 15px rgba(0,0,0,0.15)'
    container.style.maxWidth = '320px'
    container.style.cursor = 'default' // 改為預設游標，因為按鈕有自己的游標
    container.style.transition = 'all 0.3s ease'
    container.style.borderLeft = '4px solid #4b97d2'
    container.style.fontFamily = 'Arial, sans-serif'
    
    // 創建 Font Awesome 圖示
    const bellIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" style="fill:#4b97d2;margin-right:8px;">
      <path d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"/>
    </svg>`;
    
    const closeIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="14" height="14" style="fill:#999;margin-left:8px;cursor:pointer;">
      <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
    </svg>`;
    
    // 格式化通知內容，使其更易閱讀
    const formattedBody = body.replace(/\n/g, '<br>');
    
    container.innerHTML = `
      <div style="display: flex; align-items: flex-start;">
        <div style="flex-grow: 1;">
          <div style="display:flex;align-items:center;font-weight: bold; margin-bottom: 6px; color: #4b97d2; font-size: 14px;">
            ${bellIconSvg}
            ${title}
          </div>
          <div style="font-size: 13px; color: #555; margin-left: 24px; margin-bottom: 12px; line-height: 1.4;">
            ${formattedBody}
          </div>
          <div style="display: flex; gap: 8px; margin-left: 24px;">
            <button class="notification-ok-btn" style="background-color: #4b97d2; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">已讀</button>
          </div>
        </div>
        <div style="margin-left: 10px; color: #999; font-size: 16px; cursor: pointer;" class="notification-close">
          ${closeIconSvg}
        </div>
      </div>
    `
    
    // 滑鼠移過時的效果
    container.onmouseover = () => {
      container.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)'
      container.style.transform = 'translateY(-2px)'
    }
    
    container.onmouseout = () => {
      container.style.boxShadow = '0 5px 15px rgba(0,0,0,0.15)'
      container.style.transform = 'translateY(0)'
    }
    
    // 添加淡入效果
    container.style.opacity = '0'
    setTimeout(() => {
      container.style.opacity = '1'
    }, 10)
    
    // 獲取按鈕並添加點擊事件
    setTimeout(() => {
      // 已讀按鈕
      const okBtn = container.querySelector('.notification-ok-btn')
      if (okBtn) {
        okBtn.onclick = () => {
          // 添加淡出效果
          container.style.opacity = '0'
          container.style.transform = 'translateY(10px)'
          setTimeout(() => {
            if (document.body.contains(container)) {
              document.body.removeChild(container)
            }
          }, 300)
        }
      }
      
      // 關閉按鈕
      const closeBtn = container.querySelector('.notification-close')
      if (closeBtn) {
        closeBtn.onclick = (e) => {
          e.stopPropagation() // 阻止事件冒泡
          container.style.opacity = '0'
          container.style.transform = 'translateY(10px)'
          setTimeout(() => {
            if (document.body.contains(container)) {
              document.body.removeChild(container)
            }
          }, 300)
        }
      }
    }, 10)
    
    document.body.appendChild(container)
    
    // 返回通知元素，以便外部可以控制它
    return container
  }

  // 格式化截止日期
  formatDeadline(deadline) {
    if (!deadline) return ''
    const date = new Date(deadline)
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  
  // 測試電子郵件
  async testEmail(email) {
    try {
      const response = await apiService.post('/api/notifications/test-email', { email })
      return response.data
    } catch (error) {
      console.error('測試電子郵件發送失敗:', error)
      throw error
    }
  }
  
  // 清除所有通知記錄
  clearAllNotificationLogs() {
    this.notificationLogs = []
    localStorage.setItem('notification_logs', JSON.stringify(this.notificationLogs))
    this.updateUnreadCount()
  }
}

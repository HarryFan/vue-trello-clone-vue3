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
          // 無論瀏覽器通知設定如何，都顯示頁面內通知
          this.createInPageNotification(
            '任務即將到期', 
            `${task.title} (在 ${task.list_title} 清單中) 將於 ${this.formatDeadline(task.deadline)} 到期`,
            task
          )
          
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
    
    // 再次檢查權限
    if (Notification.permission !== 'granted') {
      console.warn('無法顯示通知：未獲得權限')
      const hasPermission = await this.checkPermission()
      if (!hasPermission) {
        console.error('獲取通知權限失敗，無法顯示通知')
        return
      }
    }
    
    const title = '任務即將到期'
    const body = `${task.title} (在 ${task.list_title} 清單中) 將於 ${this.formatDeadline(task.deadline)} 到期`
    
    const notificationOptions = {
      body: body,
      icon: '/favicon.ico', // 使用現有的網站圖示
      tag: `task-${task.id}`, // 避免重複通知
      requireInteraction: true, // 要求使用者互動才會關閉
      actions: [ // 在支援的瀏覽器中顯示按鈕
        {
          action: 'view',
          title: '查看任務'
        },
        {
          action: 'dismiss',
          title: '稍後提醒'
        }
      ],
      data: {
        boardId: task.board_id,
        taskId: task.id,
        timestamp: new Date().toISOString()
      }
    }

    try {
      // 使用 try-catch 包裹通知創建
      const notification = new Notification(title, notificationOptions)
      console.log('通知已成功創建:', notification)

      // 儲存通知記錄到 localStorage
      this.saveNotificationLog({
        title: title,
        body: body,
        data: {
          boardId: task.board_id,
          taskId: task.id,
          deadline: task.deadline
        }
      })
      
      console.log(`已發送通知: ${title} - ${body}`)

      // 同時創建一個備用的內部通知元素
      this.createInPageNotification(title, body, task)

      // 點擊通知時的行為
      notification.onclick = () => {
        window.focus()
        // 導航到對應的任務卡片
        router.push(`/board/${task.board_id}?task=${task.id}`)
        
        // 標記為已讀
        const logIndex = this.notificationLogs.findIndex(
          log => log.data.taskId === task.id && !log.read
        )
        if (logIndex !== -1) {
          this.markAsRead(this.notificationLogs[logIndex].id)
        }
      }
      
      // 處理通知動作
      navigator.serviceWorker.ready.then(function(registration) {
        registration.addEventListener('notificationclick', function(event) {
          if (event.action === 'view') {
            window.focus()
            router.push(`/board/${task.board_id}?task=${task.id}`)
          }
          event.notification.close()
        })
      }).catch(err => console.log('Service Worker 註冊失敗', err))
    } catch (error) {
      console.error('創建通知時發生錯誤:', error)
      // 如果通知創建失敗，仍保存到日誌
      this.saveNotificationLog({
        title: title,
        body: body + ' (通知創建失敗)',
        data: {
          boardId: task.board_id,
          taskId: task.id,
          deadline: task.deadline
        }
      })
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
    container.style.cursor = 'pointer'
    container.style.transition = 'all 0.3s ease'
    container.style.borderLeft = '4px solid #4b97d2'
    container.style.fontFamily = 'Arial, sans-serif'
    
    container.innerHTML = `
      <div style="display: flex; align-items: flex-start;">
        <div style="flex-grow: 1;">
          <div style="font-weight: bold; margin-bottom: 6px; color: #4b97d2; font-size: 14px;">
            ${title}
          </div>
          <div style="font-size: 13px; color: #555;">
            ${body}
          </div>
        </div>
        <div style="margin-left: 10px; color: #999; font-size: 16px; cursor: pointer;">
          ×
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
    
    container.onclick = () => {
      document.body.removeChild(container)
      router.push(`/board/${task.board_id}?task=${task.id}`)
    }
    
    // 獲取關閉按鈕並添加點擊事件
    const closeBtn = container.querySelector('div[style*="margin-left: 10px"]')
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation() // 阻止事件冒泡
        document.body.removeChild(container)
      }
    }
    
    // 添加淡入效果
    container.style.opacity = '0'
    setTimeout(() => {
      container.style.opacity = '1'
    }, 10)
    
    // 8秒後自動消失
    setTimeout(() => {
      if (document.body.contains(container)) {
        container.style.opacity = '0'
        container.style.transform = 'translateY(10px)'
        setTimeout(() => {
          if (document.body.contains(container)) {
            document.body.removeChild(container)
          }
        }, 300)
      }
    }, 8000)
    
    document.body.appendChild(container)
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

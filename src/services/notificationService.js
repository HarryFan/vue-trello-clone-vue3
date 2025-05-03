import { useRouter } from 'vue-router'
import { getUpcomingTasks } from './apiService'

export class NotificationService {
  constructor() {
    this.router = useRouter()
    this.checkPermission()
    this.pollingInterval = 30000 // 30秒
    this.timer = null
  }

  // 檢查通知權限
  async checkPermission() {
    if (!('Notification' in window)) {
      console.warn('此瀏覽器不支援通知功能')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  // 開始輪詢
  startPolling() {
    if (this.timer) return
    this.checkUpcoming()
    this.timer = setInterval(() => this.checkUpcoming(), this.pollingInterval)
  }

  // 停止輪詢
  stopPolling() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  // 檢查即將到期任務
  async checkUpcoming() {
    try {
      const { data } = await getUpcomingTasks()
      
      if (data.success && data.data) {
        data.data.forEach(task => {
          this.showNotification(task)
        })
      }
    } catch (error) {
      console.error('檢查到期任務失敗:', error)
    }
  }

  // 顯示通知
  showNotification(task) {
    if (Notification.permission !== 'granted') return

    const notification = new Notification('任務即將到期', {
      body: `${task.title} (在 ${task.list_title} 清單中)`,
      icon: '/favicon.ico',
      tag: `task-${task.id}`, // 避免重複通知
      data: {
        boardId: task.board_id,
        taskId: task.id
      }
    })

    notification.onclick = () => {
      window.focus()
      // 導航到對應的任務卡片
      this.router.push(`/board/${task.board_id}?task=${task.id}`)
    }
  }
}

<template>
  <div class="task-card" :class="cardClasses" :data-id="item.id">
    <div class="icons">
      <span v-if="isDue" class="icon icon-due tooltip" :title="`此任務將於 ${formatDeadline(item.deadline)} 到期，剩餘 ${getHoursLeft()} 小時，請盡快處理！`">
        <font-awesome-icon :icon="['fas','star']" />
        <span class="tooltip-text">任務即將到期，剩餘 {{ getHoursLeft() }} 小時</span>
      </span>
      <span v-else-if="isOverdue" class="icon icon-overdue tooltip" :title="`此任務已於 ${formatDeadline(item.deadline)} 過期，請盡快處理！`">
        <font-awesome-icon :icon="['fas','exclamation-circle']" />
        <span class="tooltip-text">任務已過截止日期</span>
      </span>
      <span v-else-if="timestamp" class="icon icon-date tooltip" :title="`此任務已設定截止日期（${formatDeadline(item.deadline)}），目前距離到期超過 3 天`">
        <font-awesome-icon :icon="['fas','bell']" />
        <span class="tooltip-text">已設定截止日期，尚未進入提醒區間</span>
      </span>
      <span class="icon icon-edit tooltip" @click="emitEdit" title="編輯任務">
        <font-awesome-icon :icon="['fas','pen-to-square']" />
        <span class="tooltip-text">編輯</span>
      </span>
      <span class="icon icon-delete tooltip" @click.stop="emitDelete" title="刪除任務">
        <font-awesome-icon :icon="['fas','trash']" />
        <span class="tooltip-text">刪除</span>
      </span>
    </div>
    <div class="card-content">
      <p class="item-title">{{ item.title || item.text }}</p>
      <p class="item-description" v-if="item.description">{{ item.description }}</p>
      <!-- 細項清單區塊（列表顯示） -->
      <div class="subitems" v-if="item.subItems && item.subItems.length">
        <div v-for="(sub, idx) in item.subItems" :key="sub.id" class="subitem-row">
          <input type="checkbox" :checked="sub.isCompleted" @change="toggleSubItem(idx)" />
          <span :class="{ 'completed': sub.isCompleted }">{{ sub.text }}</span>
        </div>
      </div>
      <p class="item-timestamp">
        <div class="timestamp-row">
          <i class="far fa-clock"></i>
          <span class="timestamp-label">建立：</span>
          <span class="timestamp-value">{{ formatCreatedAt(item.created_at) }}</span>
        </div>
        <div v-if="item.deadline" class="timestamp-row">
          <i class="far fa-calendar-alt"></i>
          <span class="timestamp-label">截止：</span>
          <span class="timestamp-value" :class="{'text-danger': isOverdue}">{{ formatDeadline(item.deadline) }}</span>
        </div>
      </p>
    </div>
  </div>
</template>

<script setup>
/**
 * 卡片組件 Card.vue
 * 顯示單一任務卡片內容，包含標題、描述、細項、日期與操作 icon。
 * - 支援「即將到期」與「提醒」icon，並有 CSS3 tooltip。
 * - 支援編輯、刪除、細項切換等互動。
 * @module Card
 * @prop {Object} item - 任務資料物件，必填。包含標題、描述、日期、細項等。
 * @prop {String} listTitle - 所屬清單名稱。
 * @event edit - 點擊編輯 icon 時發出，傳遞 item。
 * @event delete - 點擊刪除 icon 時發出，傳遞 item。
 * @event update - 細項勾選時發出，傳遞更新後的 item。
 */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
const emit = defineEmits(['edit', 'delete', 'update'])
const props = defineProps({
  /**
   * 任務卡片資料物件
   * @type {Object}
   */
  item: {
    type: Object,
    required: true
  },
  /**
   * 所屬清單名稱
   * @type {String}
   */
  listTitle: {
    type: String,
    required: true
  }
})

/**
 * 卡片狀態 class 計算屬性
 * - is-due: 即將到期
 * - is-overdue: 已逾期
 * - completed-card: 已完成
 */
const cardClasses = computed(() => ({
  'is-due': isDue.value,
  'is-overdue': isOverdue.value,
  'completed-card': props.listTitle === '完成'
}))

/**
 * 取得日期 timestamp
 * @returns {number}
 */
const timestamp = computed(() => Number(new Date(props.item.deadline)))

/**
 * 是否逾期
 * @returns {boolean}
 */
const isOverdue = computed(() => timestamp.value && timestamp.value < Date.now())

/**
 * 是否進入即將到期區間（3天內）
 * @returns {boolean}
 */
const isDue = computed(() => {
  const date = timestamp.value
  const due = date - (1000 * 60 * 60 * 24) * 3
  const now = Date.now()
  return date > now && now > due
})

/**
 * 計算距離截止日剩餘小時數
 * @returns {number|null}
 */
function getHoursLeft() {
  if (!props.item.deadline) return null
  const deadline = new Date(props.item.deadline).getTime()
  const now = Date.now()
  const diff = deadline - now
  if (diff <= 0) return 0
  return Math.ceil(diff / (1000 * 60 * 60))
}

/**
 * 發送編輯事件
 * @fires edit
 */
function emitEdit() {
  emit('edit', props.item)
}
/**
 * 發送刪除事件
 * @fires delete
 */
function emitDelete() {
  emit('delete', props.item)
}
/**
 * 將 created_at 格式 "2025-05-02 11:17:49" 轉為 "2025/05/02 11:17"
 * 支援後端回傳的 SQL DATETIME 格式
 * @param {string} createdAt
 * @returns {string}
 */
function formatCreatedAt(createdAt) {
  if (!createdAt) return ''
  
  try {
    // 標準化日期字串，確保能被 Date 物件正確解析
    // 先將日期字串標準化為 ISO 格式
    const normalized = createdAt.replace(' ', 'T')
    
    // 將本地日期轉換為 Date 物件
    const d = new Date(normalized)
    
    // 檢查日期是否有效
    if (isNaN(d.getTime())) {
      console.warn('無效的日期格式', createdAt)
      return createdAt || ''
    }
    
    // 格式化為 2025/05/02 11:17 格式
    const yyyy = d.getFullYear()
    const mm = (d.getMonth() + 1).toString().padStart(2, '0')
    const dd = d.getDate().toString().padStart(2, '0')
    const hh = d.getHours().toString().padStart(2, '0')
    const min = d.getMinutes().toString().padStart(2, '0')
    
    return `${yyyy}/${mm}/${dd} ${hh}:${min}`
  } catch (e) {
    console.error('日期格式化錯誤', e)
    return createdAt || ''
  }
}

/**
 * 將 deadline 格式化為 "YYYY/MM/DD HH:mm" 格式（包含時間）
 * @param {string} deadline
 * @returns {string}
 */
function formatDeadline(deadline) {
  if (!deadline) return ''
  
  try {
    // 嘗試處理不同的日期格式
    // 如果日期只有 YYYY-MM-DD 格式，無需轉換為 ISO
    let d;
    
    if (deadline.includes('T') || deadline.includes(' ')) {
      // 包含時間的日期格式 (YYYY-MM-DD HH:MM:SS 或 ISO)
      const normalized = deadline.replace(' ', 'T')
      d = new Date(normalized)
    } else {
      // 純日期格式 (YYYY-MM-DD)
      d = new Date(deadline)
    }
    
    // 檢查日期是否有效
    if (isNaN(d.getTime())) {
      console.warn('無效的截止日期格式', deadline)
      return deadline
    }
    
    // 對截止日期顯示完整的日期和時間
    const yyyy = d.getFullYear()
    const mm = (d.getMonth() + 1).toString().padStart(2, '0')
    const dd = d.getDate().toString().padStart(2, '0')
    const hh = d.getHours().toString().padStart(2, '0')
    const min = d.getMinutes().toString().padStart(2, '0')
    
    return `${yyyy}/${mm}/${dd} ${hh}:${min}`
  } catch (e) {
    console.error('截止日期格式化錯誤', e)
    return deadline || ''
  }
}
/**
 * 細項勾選切換，發送 update 事件
 * @param {number} idx - 細項索引
 * @fires update
 */
function toggleSubItem(idx) {
  const newSubItems = props.item.subItems.map((s, i) =>
    i === idx ? { ...s, isCompleted: !s.isCompleted } : s
  )
  emit('update', { ...props.item, subItems: newSubItems, updatedAt: new Date().toISOString() })
}

const imagesForDisplay = computed(() => {
  return []
})
</script>

<style scoped>
.task-card {
  position: relative;
  background-color: white;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  cursor: pointer;
  transition: all 0.3s;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.task-card:hover {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.card-content {
  margin-top: 25px;
}

.item-title {
  font-weight: bold;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
  font-size: 14px;
  width: 100%;
}

.item-description {
  color: #666;
  font-size: 12px;
  margin-top: 0;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
}

.item-timestamp {
  color: #999;
  font-size: 11px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.timestamp-row {
  display: flex;
  align-items: center;
}

.timestamp-row i {
  margin-right: 5px;
}

.timestamp-label {
  font-weight: 500;
  margin-right: 4px;
}

.text-danger {
  color: #e57373;
}

.icons {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 0.5em;
  cursor: pointer;
  z-index: 2;
}

.is-overdue {
  color: red;
  border: 1px solid red;
}

.task-card:hover .icon-edit,
.task-card:hover .icon-delete {
  display: flex;
}

.icon-edit, .icon-date {
  color: #DDD;
}

.icon-edit, .icon-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 1.18em;
  background: #f6faff;
  border-radius: 50%;
  margin: 0 2px;
  border: 1px solid #e3f0fd;
  transition: background 0.15s, box-shadow 0.15s;
  box-shadow: 0 1px 3px #1976d21a;
  cursor: pointer;
}

.icon-edit {
  color: #1976d2;
}

.icon-edit:hover {
  background: #e3f2fd;
  box-shadow: 0 2px 8px #1976d233;
}

.icon-delete {
  color: #e57373;
}

.icon-delete:hover {
  background: #ffebee;
  color: #c62828;
  box-shadow: 0 2px 8px #ffcdd233;
}

.icon-due {
  color: #ff9800;
}

.icon-due:hover {
  background: #fff3e0;
  box-shadow: 0 2px 8px #ff980044;
}

.icon-overdue {
  color: #f44336;
}

.icon-overdue:hover {
  background: #ffebee;
  box-shadow: 0 2px 8px #f4433644;
}

.icon-date {
  color: #1976d2;
}

.icon-date:hover {
  background: #e3f2fd;
  box-shadow: 0 2px 8px #1976d244;
}

.subitem-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95em;
}

.completed {
  text-decoration: line-through;
  color: #bbb;
}

.tooltip {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: max-content;
  background: #222;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 3px 8px;
  position: absolute;
  z-index: 10;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%) translateY(-2px);
  opacity: 0;
  transition: opacity 0.18s;
  font-size: 0.83em;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 2px 8px #0002;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}
</style>

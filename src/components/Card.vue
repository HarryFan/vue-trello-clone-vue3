<template>
  <div class="card" :class="cardClasses" :data-id="item.id">
    <div class="icons">
      <span v-if="isDue" class="icon icon-due" :title="`Item is due on ${item.date}`">
        <i class="fas fa-star"></i>
      </span>
      <span v-else-if="timestamp" class="icon icon-date" :title="`Item is due on ${item.date}`">
        <i class="far fa-bell"></i>
      </span>
      <span class="icon icon-edit" @click="emitEdit">
        <i class="fas fa-edit"></i>
      </span>
      <span class="icon icon-delete" @click.stop="emitDelete" title="刪除任務">
        <i class="fas fa-trash-alt"></i>
      </span>
    </div>
    <div>
      <p class="item-title">{{ item.title || item.text }}</p>
      <p class="item-description" v-if="item.description">{{ item.description }}</p>
      <!-- 細項清單區塊（列表顯示） -->
      <div class="subitems" v-if="item.subItems && item.subItems.length">
        <div v-for="(sub, idx) in item.subItems" :key="sub.id" class="subitem-row">
          <input type="checkbox" :checked="sub.isCompleted" @change="toggleSubItem(idx)" />
          <span :class="{ 'completed': sub.isCompleted }">{{ sub.text }}</span>
        </div>
      </div>
      <p class="item-timestamp" v-if="item.updatedAt && item.updatedAt !== item.createdAt">
        <span class="timestamp-label">更新：</span>
        <span class="timestamp-value">{{ formatCreatedAt(item.updatedAt) }}</span>
      </p>
      <p class="item-timestamp" v-else-if="item.createdAt">
        <span class="timestamp-label">建立：</span>
        <span class="timestamp-value">{{ formatCreatedAt(item.createdAt) }}</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits, defineProps } from 'vue'
const emit = defineEmits(['edit', 'delete', 'update'])
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const cardClasses = computed(() => ({
  'is-due': isDue.value,
  'is-overdue': isOverdue.value,
}))

const timestamp = computed(() => Number(new Date(props.item.date)))
const isOverdue = computed(() => timestamp.value && timestamp.value < Date.now())
const isDue = computed(() => {
  const date = timestamp.value
  const due = date - (1000 * 60 * 60 * 24) * 3
  const now = Date.now()
  return date > now && now > due
})

function emitEdit() {
  emit('edit', props.item)
}
function emitDelete() {
  emit('delete', props.item)
}
function formatCreatedAt(createdAt) {
  if (!createdAt) return ''
  const d = new Date(createdAt)
  const yyyy = d.getFullYear()
  const mm = (d.getMonth() + 1).toString().padStart(2, '0')
  const dd = d.getDate().toString().padStart(2, '0')
  const hh = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`
}
function toggleSubItem(idx) {
  const newSubItems = props.item.subItems.map((s, i) =>
    i === idx ? { ...s, isCompleted: !s.isCompleted } : s
  )
  emit('update', { ...props.item, subItems: newSubItems, updatedAt: new Date().toISOString() })
}
</script>

<style scoped>
.card {
  position: relative;
  border-radius: 3px;
  cursor: default;
}
.item-title {
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 2px;
}
.item-description {
  font-size: 0.7em;
}
.item-timestamp {
  font-size: 0.68em;
  color: #8a8a8a;
  margin-top: 2px;
}
.timestamp-label {
  font-weight: bold;
  color: #b0b0b0;
}
.timestamp-value {
  font-family: monospace;
}
.icons {
  position: absolute;
  top: 10px;
  right: 10px;
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
.card:hover .icon-edit,
.card:hover .icon-delete {
  display: flex;
}
.icon-edit, .icon-date {
  color: #DDD;
}
.icon-edit, .icon-delete {
  display: none;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 1.1em;
  background: transparent;
  border: none;
  box-shadow: none;
  margin: 0;
  padding: 0;
}
.icon-edit {
  color: #b0b0b0;
  margin-right: 0;
}
.icon-delete {
  color: #e57373;
  margin-left: 2px;
  transition: color 0.2s;
}
.icon-delete:hover {
  color: #c62828;
}
.subitems {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 4px 0 0 0;
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
@media (max-width: 600px) {
  .icons {
    top: 7px;
    right: 7px;
    gap: 0.3em;
  }
  .icon-edit, .icon-delete {
    width: 20px;
    height: 20px;
    font-size: 1em;
  }
}
</style>

<template>
  <div class="card" :class="cardClasses" :data-id="item.id">
    <div class="icons">
      <span v-if="isDue" class="icon icon-due" :title="`Item is due on ${item.date}`">
        <font-awesome-icon icon="star" />
      </span>
      <span v-else-if="timestamp" class="icon icon-date" :title="`Item is due on ${item.date}`">
        <font-awesome-icon icon="bell" />
      </span>
      <span class="" @click="emitEdit">
        <font-awesome-icon icon="pen-to-square" />
      </span>
      <span class="" @click.stop="emitDelete" title="刪除任務">
        <font-awesome-icon icon="trash" />
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
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, defineEmits, defineProps } from 'vue'
const emit = defineEmits(['edit', 'delete', 'update'])
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  listTitle: {
    type: String,
    required: true
  }
})

const cardClasses = computed(() => ({
  'is-due': isDue.value,
  'is-overdue': isOverdue.value,
  'completed-card': props.listTitle === '完成'
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
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px #1976d21a, 0 1.5px 4px #b6d4ff33;
  margin-bottom: 16px;
  padding: 16px 14px 10px 14px;
  transition: box-shadow 0.2s, transform 0.2s;
  border: 1.5px solid #e3f0fd;
  cursor: pointer;
}
.card.completed-card {
  background: #f7fafd;
  color: #b0b0b0;
  border: 1.5px solid #e0e0e0;
  filter: grayscale(0.2);
  opacity: 0.8;
}
.card:hover {
  box-shadow: 0 4px 16px #1976d233, 0 2px 8px #b6d4ff44;
  transform: translateY(-2px) scale(1.02);
  border-color: #90caf9;
}
.item-title {
  font-weight: bold;
  font-size: 1.13em;
  margin-bottom: 6px;
  color: #1565c0;
}
.item-description {
  font-size: 0.9em;
  margin-bottom: 4px;
  color: #2c3e50;
}
.item-timestamp {
  font-size: 0.7em;
  color: #8a8a8a;
  margin-top: 4px;
}
.subitems {
  margin: 6px 0 0 0;
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

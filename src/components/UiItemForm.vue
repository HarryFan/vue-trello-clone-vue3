<template>
  <form @submit.prevent="submitForm" class="ui-form popup-box-wide">
    <div class="form-group">
      <label>標題</label>
      <input v-model="form.title" placeholder="請輸入標題" required />
    </div>
    <div class="form-group">
      <label>描述</label>
      <textarea v-model="form.description" placeholder="請輸入描述"></textarea>
    </div>
    <div class="form-group">
      <label>任務截止時間</label>
      <Datepicker
        v-model="form.deadline"
        :enable-time-picker="true"
        :format="format"
        :locale="zhTW"
        placeholder="選擇日期和時間"
        :min-date="new Date()"
        auto-apply
        :shortcuts="[
          {
            label: '今天',
            value: new Date()
          },
          {
            label: '明天',
            value: (() => {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24)
              return date
            })()
          },
          {
            label: '一週後',
            value: (() => {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
              return date
            })()
          }
        ]"
      />
    </div>
    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
    <div class="form-actions">
      <button type="submit" class="primary">{{ form.id ? '更新' : '新增' }}</button>
      <button type="button" @click="onCancel">取消</button>
    </div>
  </form>
</template>

<script setup>
import { nextTick, reactive, ref, watch } from 'vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const emit = defineEmits(['submit', 'cancel'])
const props = defineProps({
  modelValue: Object
})

const formRef = ref(null)
const form = reactive({
  id: null,
  title: '',
  description: '',
  deadline: null
})

// 日期時間格式化
const format = (date) => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 中文語系設定
const zhTW = {
  weekDays: ['日', '一', '二', '三', '四', '五', '六'],
  months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  hours: '時',
  minutes: '分',
  confirm: '確認'
}

// 監聽 props 變化，更新表單
watch(() => props.modelValue, (val) => {
  if (val) {
    form.id = val.id || null
    form.title = val.title || ''
    form.description = val.description || ''
    // 如果有截止時間，轉換為 Date 對象
    form.deadline = val.deadline ? new Date(val.deadline) : null
  } else {
    resetForm()
  }
}, { immediate: true })

const submitForm = () => {
  if (!form.title.trim()) {
    errorMsg.value = '請輸入標題！'
    return
  }

  // 送出時帶入所有欄位
  emit('submit', {
    id: form.id,
    title: form.title.trim(),
    description: form.description.trim(),
    deadline: form.deadline ? format(form.deadline) : null,
    list_id: props.modelValue?.list_id
  })

  // 重置表單
  resetForm()
}

function onCancel() { 
  emit('cancel')
}

function resetForm() {
  Object.assign(form, {
    id: null,
    title: '',
    description: '',
    deadline: null
  })
  errorMsg.value = ''
  nextTick(() => formRef.value?.clearValidate?.())
}

const errorMsg = ref('')
</script>

<style scoped>
.ui-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.popup-box-wide {
  min-width: 320px;
  max-width: 520px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 600px) {
  .popup-box-wide {
    min-width: 0;
    max-width: 98vw;
    padding: 0 4vw;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.error-msg {
  color: #e53935;
  font-size: 13px;
  margin-top: 4px;
}

button.primary {
  background-color: #2196f3;
  color: #fff;
  border: none;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
}

textarea {
  min-height: 80px;
  resize: vertical;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1.5px solid #e3f0fd;
  font-size: 1em;
  outline: none;
}

input {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1.5px solid #e3f0fd;
  font-size: 1em;
  outline: none;
}

input:focus, textarea:focus {
  border-color: #90caf9;
}

/* DatePicker 客製化樣式 */
:deep(.dp__input) {
  padding: 8px 12px;
  border: 1.5px solid #e3f0fd;
  border-radius: 6px;
  font-size: 1em;
  width: 100%;
}

:deep(.dp__main) {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:deep(.dp__active) {
  background: #228be6 !important;
  color: white !important;
}
</style>

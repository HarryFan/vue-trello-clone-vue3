<template>
  <form @submit.prevent="onSubmit" class="ui-form popup-box-wide">
    <div class="form-group">
      <label>標題</label>
      <input v-model="form.title" placeholder="請輸入標題" required />
    </div>
    <div class="form-group">
      <label>描述</label>
      <textarea v-model="form.description" placeholder="請輸入描述" rows="5" style="min-height: 100px;"></textarea>
    </div>
    <div class="form-group">
      <label>任務截止日期</label>
      <input type="datetime-local" v-model="form.deadline" />
      <div class="hint">選擇精確到分鐘的截止時間</div>
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
watch(() => props.modelValue, (val) => {
  Object.assign(form, val || { id: null, title: '', description: '', deadline: null })
}, { immediate: true })

function onSubmit() {
  if (!form.title.trim()) {
    errorMsg.value = '請填寫標題！'
    return
  }
  // 送出時帶入所有欄位
  emit('submit', {
    ...form,
    deadline: form.deadline // 確保 deadline 一定帶出
  })
  resetForm()
}
function onCancel() { emit('cancel') }
function resetForm() {
  Object.assign(form, { id: null, title: '', description: '', deadline: null })
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
.hint {
  font-size: 12px;
  color: #666;
}
</style>

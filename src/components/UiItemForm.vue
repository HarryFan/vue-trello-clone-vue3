<template>
  <form @submit.prevent="onSubmit" class="ui-form">
    <div class="form-group">
      <label>標題</label>
      <input v-model="form.title" placeholder="請輸入標題" required />
    </div>
    <div class="form-group">
      <label>描述</label>
      <textarea v-model="form.description" placeholder="請輸入描述"></textarea>
    </div>
    <div class="form-group">
      <label>日期</label>
      <input type="date" v-model="form.date" />
    </div>
    <div class="form-group">
      <label>圖片</label>
      <input type="file" @change="onImageUpload" accept="image/*" />
      <div class="images">
        <div v-for="(img, idx) in form.images" :key="idx" class="image-preview">
          <img :src="img" />
          <button type="button" class="delete" @click="removeImage(img)">x</button>
        </div>
      </div>
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
  date: null,
  images: []
})
watch(() => props.modelValue, (val) => {
  Object.assign(form, val || { id: null, title: '', description: '', date: null, images: [] })
}, { immediate: true })

function onSubmit() {
  if (!form.title.trim()) {
    errorMsg.value = '請填寫標題！'
    return
  }
  emit('submit', { ...form })
  resetForm()
}
function onCancel() { emit('cancel') }
function resetForm() {
  Object.assign(form, { id: null, title: '', description: '', date: null, images: [] })
  errorMsg.value = ''
  nextTick(() => formRef.value?.clearValidate?.())
}
const errorMsg = ref('')
function onImageUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 1024 * 1024) {
    errorMsg.value = '圖片大小不能超過 1MB'
    return
  }
  const reader = new FileReader()
  reader.onload = (evt) => {
    const base64 = evt.target.result
    form.images.push(base64)
  }
  reader.readAsDataURL(file)
}
function removeImage(imgId) {
  form.images = form.images.filter(id => id !== imgId)
}
</script>

<style scoped>
.ui-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}
.image-preview {
  position: relative;
  width: 80px;
  height: 80px;
}
.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}
.delete {
  position: absolute;
  top: 3px;
  right: 3px;
  z-index: 2;
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  cursor: pointer;
  font-size: 13px;
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
</style>

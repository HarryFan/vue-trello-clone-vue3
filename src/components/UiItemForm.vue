<template>
  <el-form :model="form" ref="formRef" label-width="60px" @submit.prevent>
    <el-form-item label="標題" prop="title" :rules="[{ required: true, message: '請輸入標題', trigger: 'blur' }]">
      <el-input v-model="form.title" placeholder="請輸入標題" @keyup.enter="onSubmit" />
    </el-form-item>
    <el-form-item label="描述">
      <el-input v-model="form.description" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="請輸入描述" />
    </el-form-item>
    <el-form-item label="日期">
      <el-date-picker v-model="form.date" type="date" placeholder="選擇日期" style="width:100%" />
    </el-form-item>
    <!-- 圖片上傳/預覽區塊 -->
    <el-form-item label="圖片">
      <div class="images">
        <div v-for="imgId in form.images" :key="imgId" class="image-preview">
          <img :src="getImageFromStorage(imgId)" alt="Task image" />
          <el-button class="delete is-small" @click="removeImage(imgId)" circle icon="el-icon-delete" />
        </div>
        <div class="image-upload">
          <input type="file" ref="fileInput" accept="image/*" @change="onImageUpload" style="display:none" />
          <el-button type="info" plain @click="triggerFileInput">
            <i class="fas fa-upload"></i>
            <span>上傳圖片</span>
          </el-button>
        </div>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">{{ form.id ? '更新' : '新增' }}</el-button>
      <el-button @click="onCancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { nextTick, reactive, ref, watch } from 'vue'

const emit = defineEmits(['submit', 'cancel'])
const props = defineProps({
  modelValue: { type: Object, default: () => ({}) }
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
  formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...form })
      resetForm()
    } else {
      ElMessage.error('請填寫所有必填欄位！')
    }
  })
}
function onCancel() {
  emit('cancel', { ...form })
  resetForm()
}
function resetForm() {
  Object.assign(form, { id: null, title: '', description: '', date: null, images: [] })
  nextTick(() => formRef.value?.clearValidate())
}
function getImageFromStorage(imgId) {
  // TODO: 實際專案請實作圖片讀取
  return ''
}
function removeImage(imgId) {
  // TODO: 實際專案請實作圖片刪除
  form.images = form.images.filter(id => id !== imgId)
}
function triggerFileInput() {
  document.querySelector('input[type=file][ref=fileInput]')?.click()
}
function onImageUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 1024 * 1024) {
    ElMessage.error('圖片大小不能超過 1MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (evt) => {
    const base64 = evt.target.result
    // TODO: 請根據專案需求存儲圖片並獲取 imgId
    // const imgId = saveImageToStorage(base64)
    // if (imgId) {
    //   form.images.push(imgId)
    // }
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
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
}
.image-upload {
  display: flex;
  align-items: center;
}
</style>

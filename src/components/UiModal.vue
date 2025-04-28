<template>
  <div v-if="modelValue" class="ui-modal-backdrop" @click.self="onCancel">
    <div class="ui-modal">
      <button class="ui-modal-close" @click="onCancel">×</button>
      <slot />
    </div>
  </div>
</template>
<script setup>
const emit = defineEmits(['update:modelValue', 'cancel'])
const props = defineProps({
  modelValue: Boolean
})
function onCancel() {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>
<style scoped>
.ui-modal-backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  background: rgba(0,0,0,0.22);
  display: flex;
  justify-content: center;
  align-items: center;
}
.ui-modal {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px #1976d244, 0 2px 8px #b6d4ff44;
  padding: 32px 28px 24px 28px;
  min-width: 520px;
  max-width: 90vw;
  min-height: 120px;
  position: relative;
  animation: modal-in 0.18s cubic-bezier(.4,1.3,.5,1.01);
}
.ui-modal-close {
  position: absolute;
  right: 16px;
  top: 12px;
  background: transparent;
  border: none;
  font-size: 2rem;
  color: #1976d2;
  cursor: pointer;
}
@keyframes modal-in {
  0% { opacity: 0; transform: scale(0.95) translateY(40px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
</style>

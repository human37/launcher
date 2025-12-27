<template>
  <div class="form-overlay" @click.self="close">
    <div class="form-container">
      <div class="form-header">
        <h2 class="form-title">{{ editingButton ? 'Edit Button' : 'Add New Button' }}</h2>
        <button class="close-button" @click="close">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="form-content">
        <div class="form-group">
          <label class="form-label">Label</label>
          <input
            v-model="formData.label"
            type="text"
            class="form-input"
            placeholder="Button label"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">URL</label>
          <input
            v-model="formData.url"
            type="url"
            class="form-input"
            placeholder="https://example.com"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Color</label>
          <div class="color-picker-container">
            <input
              v-model="formData.color"
              type="color"
              class="color-input"
            />
            <input
              v-model="formData.color"
              type="text"
              class="form-input color-text"
              placeholder="#000000"
            />
          </div>
          <div class="color-preview" :style="{ backgroundColor: formData.color }"></div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="close">Cancel</button>
          <button type="submit" class="btn btn-primary">{{ editingButton ? 'Update' : 'Add' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  editingButton: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'close'])

const formData = ref({
  label: '',
  url: '',
  color: '#000000'
})

watch(() => props.editingButton, (newButton) => {
  if (newButton) {
    formData.value = {
      label: newButton.label || '',
      url: newButton.url || '',
      color: newButton.color || '#000000'
    }
  } else {
    formData.value = {
      label: '',
      url: '',
      color: '#000000'
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('submit', { ...formData.value })
  close()
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.form-container {
  background: white;
  border: 4px solid #000;
  box-shadow: 12px 12px 0px 0px #000;
  max-width: 500px;
  width: 100%;
  padding: 0;
}

.form-header {
  background: #000;
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
}

.close-button {
  background: white;
  color: #000;
  border: 3px solid #000;
  width: 40px;
  height: 40px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 4px 4px 0px 0px #000;
  transition: all 0.1s ease;
}

.close-button:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px 0px #000;
}

.form-content {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 3px solid #000;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 4px 4px 0px 0px #000;
  transition: all 0.1s ease;
}

.form-input:focus {
  outline: none;
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px 0px #000;
}

.color-picker-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-input {
  width: 80px;
  height: 50px;
  border: 3px solid #000;
  cursor: pointer;
  box-shadow: 4px 4px 0px 0px #000;
}

.color-text {
  flex: 1;
}

.color-preview {
  margin-top: 0.5rem;
  height: 60px;
  border: 3px solid #000;
  box-shadow: 4px 4px 0px 0px #000;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  flex: 1;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  border: 4px solid #000;
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: system-ui, -apple-system, sans-serif;
}

.btn-primary {
  background: #000;
  color: white;
  box-shadow: 6px 6px 0px 0px #000;
}

.btn-primary:hover {
  transform: translate(3px, 3px);
  box-shadow: 3px 3px 0px 0px #000;
}

.btn-secondary {
  background: white;
  color: #000;
  box-shadow: 6px 6px 0px 0px #000;
}

.btn-secondary:hover {
  transform: translate(3px, 3px);
  box-shadow: 3px 3px 0px 0px #000;
}
</style>


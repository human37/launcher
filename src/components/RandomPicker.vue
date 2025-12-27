<template>
  <div class="picker-section">
    <h2 class="picker-title">Random Picker</h2>
    
    <div class="picker-display">
        <div v-if="isPicking" class="picking-animation">
          <div class="spinner">🎲</div>
          <div>Picking...</div>
        </div>
        <div v-else-if="selectedItem" class="selected-item">
          {{ selectedItem }}
        </div>
        <div v-else class="placeholder">
          Name your items and click "Pick Random" to select one at random.
        </div>
      </div>

      <div class="picker-controls">
      <div class="items-list" ref="itemsListRef">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="item-row"
        >
          <input
            v-model="items[index]"
            type="text"
            class="item-input"
            :placeholder="`Item ${index + 1}`"
          />
          <button
            @click="removeItem(index)"
            class="remove-button"
          >
            ×
          </button>
        </div>
      </div>

      <div class="picker-actions">
        <button
          @click="addItem"
          class="action-button add-item-button"
        >
          + Add Item
        </button>
        <button
          @click="pickRandom"
          :disabled="items.length === 0 || items.every(i => !i.trim())"
          class="action-button pick-button"
        >
          Pick Random
        </button>
        <button
          @click="clearSelection"
          class="action-button clear-button"
        >
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const items = ref([''])
const selectedItem = ref('')
const itemsListRef = ref(null)

const addItem = async () => {
  items.value.push('')
  // Wait for DOM to update, then scroll to bottom
  await nextTick()
  if (itemsListRef.value) {
    itemsListRef.value.scrollTop = itemsListRef.value.scrollHeight
  }
}

const removeItem = (index) => {
  if (items.value.length > 1) {
    items.value.splice(index, 1)
  } else {
    items.value[0] = ''
  }
  selectedItem.value = ''
}

const isPicking = ref(false)

const pickRandom = async () => {
  const validItems = items.value.filter(item => item.trim())
  if (validItems.length > 0) {
    // Show picking animation
    isPicking.value = true
    selectedItem.value = ''
    
    // Brief delay to show animation
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Select random item
    const randomIndex = Math.floor(Math.random() * validItems.length)
    selectedItem.value = validItems[randomIndex]
    isPicking.value = false
  }
}

const clearSelection = () => {
  selectedItem.value = ''
}
</script>

<style scoped>
.picker-section {
  background: white;
  border: 3px solid #000;
  box-shadow: 6px 6px 0px 0px #000;
  padding: 1rem;
  flex: 1;
  min-width: 300px;
}

.picker-title {
  font-size: 1.25rem;
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  color: #000;
  text-align: center;
}

.picker-display {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  min-height: 40px;
}

.selected-item {
  font-size: 1.5rem;
  font-weight: 900;
  color: #000;
  background: #ffff00;
  border: 3px solid #000;
  padding: 0.75rem 1rem;
  box-shadow: 4px 4px 0px 0px #000;
  text-align: center;
  word-break: break-word;
  animation: highlight 0.8s ease;
}

.picking-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #9C27B0;
  text-transform: uppercase;
}

.spinner {
  font-size: 3rem;
  animation: spin 0.5s linear infinite;
}

.placeholder {
  font-size: 0.875rem;
  font-weight: 600;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0.25rem;
}

@keyframes highlight {
  0% {
    transform: scale(0.8) rotate(-5deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.15) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

.picker-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 150px;
  overflow-y: auto;
  padding: 0.25rem;
  flex-shrink: 0;
}

.item-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.item-input {
  flex: 1;
  padding: 0.5rem;
  border: 3px solid #000;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 3px 3px 0px 0px #000;
  transition: all 0.1s ease;
}

.item-input:focus {
  outline: none;
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px 0px #000;
}

.remove-button {
  width: 28px;
  height: 28px;
  background: #ff0000;
  color: white;
  border: 3px solid #000;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 3px 3px 0px 0px #000;
  transition: all 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.remove-button:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px 0px #000;
}

.picker-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  border: 3px solid #000;
  cursor: pointer;
  box-shadow: 4px 4px 0px 0px #000;
  transition: all 0.1s ease;
  font-family: system-ui, -apple-system, sans-serif;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button:not(:disabled):hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px 0px #000;
}

.add-item-button {
  background: white;
  color: #000;
}

.pick-button {
  background: #9C27B0;
  color: white;
}

.clear-button {
  background: #f0f0f0;
  color: #000;
}

@media (max-width: 640px) {
  .selected-item {
    font-size: 1.5rem;
    padding: 1rem 1.5rem;
  }
  
  .picker-title {
    font-size: 1.5rem;
  }
}
</style>


import { ref, watch } from 'vue'

const STORAGE_KEY = 'web-launcher-buttons'
const GRID_SIZE = 20 // Grid size in pixels

const snapToGrid = (value) => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE
}

const buttons = ref([])

// Load from local storage on init
const loadButtons = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const loaded = JSON.parse(stored)
      // Ensure all buttons have position and size
      buttons.value = loaded.map((btn, index) => ({
        ...btn,
        x: btn.x !== undefined ? btn.x : snapToGrid(20 + (index % 5) * 250),
        y: btn.y !== undefined ? btn.y : snapToGrid(20 + Math.floor(index / 5) * 100),
        width: btn.width || 200,
        height: btn.height || 80
      }))
    }
  } catch (error) {
    console.error('Error loading buttons from storage:', error)
    buttons.value = []
  }
}

// Save to local storage whenever buttons change
watch(buttons, (newButtons) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newButtons))
  } catch (error) {
    console.error('Error saving buttons to storage:', error)
  }
}, { deep: true })

// Initialize
loadButtons()

export function useLauncher() {

  const addButton = (button) => {
    // Find a good default position (avoid overlapping)
    const existingButtons = buttons.value
    let x = 20
    let y = 20
    
    // Try to find an empty spot
    for (let i = 0; i < 10; i++) {
      const testX = snapToGrid(20 + i * 250)
      const testY = snapToGrid(20 + i * 100)
      const overlaps = existingButtons.some(b => {
        const bRight = b.x + (b.width || 200)
        const bBottom = b.y + (b.height || 80)
        const testRight = testX + 200
        const testBottom = testY + 80
        return !(testX >= bRight || testRight <= b.x || testY >= bBottom || testBottom <= b.y)
      })
      if (!overlaps) {
        x = testX
        y = testY
        break
      }
    }

    const newButton = {
      id: Date.now().toString(),
      label: button.label || 'New Button',
      url: button.url || '#',
      color: button.color || '#000000',
      x: button.x !== undefined ? snapToGrid(button.x) : x,
      y: button.y !== undefined ? snapToGrid(button.y) : y,
      width: button.width || 200,
      height: button.height || 80,
      ...button
    }
    buttons.value.push(newButton)
    return newButton
  }

  const updateButton = (id, updates) => {
    const index = buttons.value.findIndex(b => b.id === id)
    if (index !== -1) {
      const updated = { ...buttons.value[index], ...updates }
      // Snap position and size to grid
      if (updates.x !== undefined) updated.x = snapToGrid(updates.x)
      if (updates.y !== undefined) updated.y = snapToGrid(updates.y)
      if (updates.width !== undefined) updated.width = Math.max(GRID_SIZE * 4, snapToGrid(updates.width))
      if (updates.height !== undefined) updated.height = Math.max(GRID_SIZE * 4, snapToGrid(updates.height))
      buttons.value[index] = updated
    }
  }

  const deleteButton = (id) => {
    const index = buttons.value.findIndex(b => b.id === id)
    if (index !== -1) {
      buttons.value.splice(index, 1)
    }
  }

  const openUrl = (url) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return {
    buttons,
    addButton,
    updateButton,
    deleteButton,
    openUrl,
    snapToGrid
  }
}


<template>
  <div
    :style="containerStyle"
    class="button-container"
    :class="{ 
      'dragging': isDragging, 
      'resizing': isResizing,
      'edit-mode-active': props.editMode
    }"
  >
    <button
      :style="buttonStyle"
      @click="handleClick"
      @mousedown="handleButtonPress"
      @mouseup="handleButtonRelease"
      @mouseleave="handleButtonRelease"
      @contextmenu.prevent="handleRightClick"
      class="neobrutalism-button"
      :class="{ 'pressed': isPressed }"
    >
      <span class="button-label">{{ button.label }}</span>
      <span v-if="editMode" class="delete-icon" @click.stop="handleDelete">×</span>
    </button>
    
    <!-- Resize handles - only show in edit mode -->
    <div
      v-if="editMode"
      class="resize-handle resize-handle-se"
      @mousedown.stop="handleResizeStart($event, 'se')"
    ></div>
    <div
      v-if="editMode"
      class="resize-handle resize-handle-sw"
      @mousedown.stop="handleResizeStart($event, 'sw')"
    ></div>
    <div
      v-if="editMode"
      class="resize-handle resize-handle-ne"
      @mousedown.stop="handleResizeStart($event, 'ne')"
    ></div>
    <div
      v-if="editMode"
      class="resize-handle resize-handle-nw"
      @mousedown.stop="handleResizeStart($event, 'nw')"
    ></div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  button: {
    type: Object,
    required: true
  },
  editMode: {
    type: Boolean,
    default: false
  },
  snapToGrid: {
    type: Function,
    default: (v) => v
  }
})

const emit = defineEmits(['click', 'delete', 'edit', 'update'])

const isDragging = ref(false)
const isResizing = ref(false)
const isPressed = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0, direction: '' })

const containerStyle = computed(() => {
  return {
    position: 'absolute',
    left: `${props.button.x || 0}px`,
    top: `${props.button.y || 0}px`,
    width: `${props.button.width || 200}px`,
    height: `${props.button.height || 80}px`,
    zIndex: isDragging.value || isResizing.value ? 1000 : 1,
  }
})

const buttonStyle = computed(() => {
  const bgColor = props.button.color || '#000000'
  const textColor = getContrastColor(bgColor)
  
  return {
    backgroundColor: bgColor,
    color: textColor,
    border: '4px solid #000',
    boxShadow: '8px 8px 0px 0px #000',
    width: '100%',
    height: '100%',
  }
})

const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

const handleButtonPress = (e) => {
  // Don't show press animation in edit mode (will be handled by drag)
  if (props.editMode) {
    handleMouseDown(e)
    return
  }
  isPressed.value = true
}

const handleButtonRelease = () => {
  isPressed.value = false
}

const handleClick = (e) => {
  if (!isDragging.value && !isResizing.value) {
    emit('click', props.button)
  }
  // Reset press state after a brief delay for visual feedback
  setTimeout(() => {
    isPressed.value = false
  }, 150)
}

const handleRightClick = () => {
  emit('edit', props.button)
}

const handleDelete = () => {
  emit('delete', props.button.id)
}

const handleMouseDown = (e) => {
  // Only allow dragging in edit mode
  if (!props.editMode) return
  if (e.target.classList.contains('resize-handle')) return
  
  isDragging.value = true
  const container = document.querySelector('.buttons-container')
  const containerRect = container?.getBoundingClientRect() || { left: 0, top: 0 }
  const buttonRect = e.currentTarget.getBoundingClientRect()
  
  // Calculate offset from mouse position to button's top-left corner
  dragStart.value = {
    offsetX: e.clientX - buttonRect.left,
    offsetY: e.clientY - buttonRect.top,
    containerLeft: containerRect.left,
    containerTop: containerRect.top
  }
  e.preventDefault()
}

const handleResizeStart = (e, direction) => {
  isResizing.value = true
  const container = document.querySelector('.buttons-container')
  const containerRect = container?.getBoundingClientRect() || { left: 0, top: 0 }
  
  resizeStart.value = {
    x: e.clientX - containerRect.left,
    y: e.clientY - containerRect.top,
    width: props.button.width || 200,
    height: props.button.height || 80,
    startX: props.button.x || 0,
    startY: props.button.y || 0,
    direction
  }
  e.preventDefault()
  e.stopPropagation()
}

const handleMouseMove = (e) => {
  if (isDragging.value) {
    // Calculate new position: mouse position minus offset, relative to container
    const newX = props.snapToGrid(e.clientX - dragStart.value.containerLeft - dragStart.value.offsetX)
    const newY = props.snapToGrid(e.clientY - dragStart.value.containerTop - dragStart.value.offsetY)
    
    emit('update', {
      id: props.button.id,
      x: Math.max(0, newX),
      y: Math.max(0, newY)
    })
  } else if (isResizing.value) {
    const { direction, width, height, startX, startY, x: startMouseX, y: startMouseY } = resizeStart.value
    const container = document.querySelector('.buttons-container')
    if (!container) return
    
    const containerRect = container.getBoundingClientRect()
    const currentMouseX = e.clientX - containerRect.left
    const currentMouseY = e.clientY - containerRect.top
    const deltaX = currentMouseX - startMouseX
    const deltaY = currentMouseY - startMouseY
    
    let newWidth = width
    let newHeight = height
    let newX = startX
    let newY = startY
    
    if (direction.includes('e')) {
      newWidth = props.snapToGrid(width + deltaX)
    }
    if (direction.includes('w')) {
      newWidth = props.snapToGrid(width - deltaX)
      newX = props.snapToGrid(startX + deltaX)
    }
    if (direction.includes('s')) {
      newHeight = props.snapToGrid(height + deltaY)
    }
    if (direction.includes('n')) {
      newHeight = props.snapToGrid(height - deltaY)
      newY = props.snapToGrid(startY + deltaY)
    }
    
    const minSize = 80
    emit('update', {
      id: props.button.id,
      width: Math.max(minSize, newWidth),
      height: Math.max(minSize, newHeight),
      x: Math.max(0, newX),
      y: Math.max(0, newY)
    })
  }
}

const handleMouseUp = () => {
  isDragging.value = false
  isResizing.value = false
}

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style scoped>
.button-container {
  user-select: none;
}

.button-container.dragging,
.button-container.resizing {
  cursor: grabbing;
}

.neobrutalism-button {
  position: relative;
  padding: 1.5rem 2rem;
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.neobrutalism-button.pressed {
  transform: translate(4px, 4px);
  box-shadow: 4px 4px 0px 0px #000 !important;
}

.button-container:not(.dragging):not(.resizing) .neobrutalism-button {
  cursor: pointer;
}

.edit-mode-active .neobrutalism-button {
  cursor: grab;
}

.button-container.dragging .neobrutalism-button,
.button-container.resizing .neobrutalism-button {
  cursor: grabbing;
  transition: none;
}

.neobrutalism-button:active {
  cursor: grabbing;
}

.button-label {
  flex: 1;
  text-align: center;
  word-break: break-word;
  overflow: hidden;
}

.delete-icon {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  background: #ff0000;
  color: white;
  border: 3px solid #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 4px 4px 0px 0px #000;
  z-index: 10;
}

.delete-icon:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px 0px #000;
}

.resize-handle {
  position: absolute;
  background: #000;
  border: 2px solid #fff;
  z-index: 100;
}

.resize-handle-se {
  bottom: -6px;
  right: -6px;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
}

.resize-handle-sw {
  bottom: -6px;
  left: -6px;
  width: 16px;
  height: 16px;
  cursor: nesw-resize;
}

.resize-handle-ne {
  top: -6px;
  right: -6px;
  width: 16px;
  height: 16px;
  cursor: nesw-resize;
}

.resize-handle-nw {
  top: -6px;
  left: -6px;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
}

.resize-handle:hover {
  background: #333;
  transform: scale(1.2);
}
</style>

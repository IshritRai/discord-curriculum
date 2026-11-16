<script setup>
// Lets readers say which operating system they use, so lessons can show the right
// shortcuts and commands. The choice is saved in localStorage and applied as
// <html data-os="mac|windows|linux"> (the script in config.mjs sets it before paint).
import { onMounted, ref } from 'vue'

const options = [
  { id: 'mac', label: 'macOS' },
  { id: 'windows', label: 'Windows' },
  { id: 'linux', label: 'Linux' },
]
const current = ref('mac')

onMounted(() => {
  current.value = document.documentElement.dataset.os || 'mac'
})

function choose(id) {
  current.value = id
  document.documentElement.dataset.os = id
  try {
    localStorage.setItem('course-os', id)
  } catch {
    // Storage blocked: the choice just won't be remembered.
  }
}
</script>

<template>
  <div class="os-picker" role="group" aria-label="Your operating system">
    <span class="os-picker-label">I use</span>
    <button
      v-for="option in options"
      :key="option.id"
      type="button"
      class="os-picker-button"
      :class="{ active: current === option.id }"
      :aria-pressed="current === option.id"
      @click="choose(option.id)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

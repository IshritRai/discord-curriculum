<script setup>
// Renders a Mermaid diagram in the browser and re-renders it when the
// site switches between light and dark mode.
import { onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({ code: { type: String, required: true } })
const { isDark } = useData()
const svg = ref('')
let counter = 0

async function render() {
  const { default: mermaid } = await import('mermaid')
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark.value ? 'dark' : 'default',
    fontFamily: 'inherit',
    securityLevel: 'strict',
  })
  const id = `mermaid-${Math.random().toString(36).slice(2)}-${counter++}`
  const result = await mermaid.render(id, decodeURIComponent(props.code))
  svg.value = result.svg
}

onMounted(render)
watch(isDark, render)
</script>

<template>
  <div class="mermaid-diagram" v-html="svg" />
</template>

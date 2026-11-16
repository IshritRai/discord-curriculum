<script setup>
// Words that differ per operating system, for example:
//   <Os mac="Terminal" windows="Git Bash" linux="your terminal" />
defineProps({
  mac: { type: String, required: true },
  windows: { type: String, required: true },
  linux: { type: String, required: true },
})
</script>

<template>
  <span class="os-inline for-mac">{{ mac }}</span>
  <span class="os-inline for-windows">{{ windows }}</span>
  <span class="os-inline for-linux">{{ linux }}</span>
</template>

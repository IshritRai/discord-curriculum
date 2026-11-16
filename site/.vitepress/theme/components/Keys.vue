<script setup>
// A keyboard shortcut that differs per operating system, for example:
//   <Keys mac="Cmd+Option+I" win="Ctrl+Shift+I" />
// `win` is used for Windows and Linux unless `linux` is given too.
// All variants are rendered; CSS shows the one for the reader's OS.
const props = defineProps({
  mac: { type: String, required: true },
  win: { type: String, required: true },
  linux: { type: String, default: '' },
})
const parts = (text) => text.split('+')
</script>

<template>
  <span class="os-inline for-mac"><template v-for="(key, i) in parts(mac)" :key="i"><template v-if="i > 0">+</template><kbd>{{ key }}</kbd></template></span>
  <span class="os-inline for-windows"><template v-for="(key, i) in parts(win)" :key="i"><template v-if="i > 0">+</template><kbd>{{ key }}</kbd></template></span>
  <span class="os-inline for-linux"><template v-for="(key, i) in parts(linux || win)" :key="i"><template v-if="i > 0">+</template><kbd>{{ key }}</kbd></template></span>
</template>

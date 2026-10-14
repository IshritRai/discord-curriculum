<script setup>
// Shows overall progress above the sidebar and adds a ✓ to completed lessons.
import { computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { lessons, lessonLink, pad } from '../../curriculum.mjs'
import { useProgress } from '../progress.js'

const progress = useProgress()
const route = useRoute()
const core = lessons.filter((l) => !l.optional)
const completedCount = computed(() => (progress.state.loaded ? core.filter((l) => progress.isComplete(pad(l.n))).length : 0))
const percent = computed(() => Math.round((completedCount.value / core.length) * 100))

let observer
function mark() {
  const doneLinks = new Set(
    lessons.filter((l) => progress.isComplete(pad(l.n))).map((l) => withBase(lessonLink(l))),
  )
  document.querySelectorAll('.VPSidebar a.link').forEach((a) => {
    const href = a.getAttribute('href').replace(/\.html$/, '')
    a.classList.toggle('is-done', doneLinks.has(href))
  })
}

onMounted(() => {
  progress.load()
  nextTick(mark)
  const sidebar = document.querySelector('.VPSidebar')
  if (sidebar) {
    observer = new MutationObserver(() => {
      observer.disconnect()
      mark()
      observer.observe(sidebar, { childList: true, subtree: true })
    })
    observer.observe(sidebar, { childList: true, subtree: true })
  }
})
onBeforeUnmount(() => observer?.disconnect())
watch(() => [progress.state.data.completed, route.path], () => nextTick(mark), { deep: true })
</script>

<template>
  <div class="sidebar-progress">
    <div class="sidebar-progress-text">
      <span>{{ completedCount }} / {{ core.length }} core lessons</span>
      <span>{{ percent }}%</span>
    </div>
    <div class="sidebar-progress-bar"><div :style="{ width: percent + '%' }" /></div>
  </div>
</template>

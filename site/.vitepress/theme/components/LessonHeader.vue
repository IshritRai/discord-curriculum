<script setup>
import { computed, onMounted } from 'vue'
import { useData } from 'vitepress'
import { lessonByNumber, phases, pad, appFolder } from '../../curriculum.mjs'
import { useProgress } from '../progress.js'

const { frontmatter } = useData()
const progress = useProgress()
onMounted(() => progress.load())

const lesson = computed(() => lessonByNumber(frontmatter.value.lesson))
const phase = computed(() => phases.find((p) => p.id === lesson.value?.phase))
const done = computed(() => lesson.value && progress.state.loaded && progress.isComplete(pad(lesson.value.n)))
</script>

<template>
  <div v-if="lesson" class="lesson-header">
    <span class="lesson-chip">Lesson {{ pad(lesson.n) }}</span>
    <span class="lesson-meta">{{ phase?.title }}</span>
    <span class="lesson-meta">≈ {{ lesson.minutes }} min</span>
    <span v-if="lesson.app" class="lesson-meta">works in <code>{{ appFolder(lesson.app) }}/</code></span>
    <span v-if="lesson.optional" class="lesson-chip optional">Optional</span>
    <span v-if="done" class="lesson-chip done">✓ Completed</span>
  </div>
</template>

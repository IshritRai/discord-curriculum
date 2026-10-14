<script setup>
import { computed, onMounted } from 'vue'
import { useData, withBase } from 'vitepress'
import { lessonByNumber, pad, appFolder } from '../../curriculum.mjs'
import { useProgress } from '../progress.js'

const { frontmatter } = useData()
const progress = useProgress()
onMounted(() => progress.load())

const lesson = computed(() => lessonByNumber(frontmatter.value.lesson))
const key = computed(() => (lesson.value ? pad(lesson.value.n) : ''))
const done = computed(() => progress.state.loaded && progress.isComplete(key.value))
const quiz = computed(() => (progress.state.loaded ? progress.quiz(key.value) : {}))
const answered = computed(() => Object.keys(quiz.value).length)
const firstTry = computed(() => Object.values(quiz.value).filter((q) => q.firstTryCorrect).length)
const demo = computed(() => {
  if (!lesson.value?.app) return null
  return withBase(`/demos/lesson-${key.value}/${appFolder(lesson.value.app)}/index.html`)
})
</script>

<template>
  <div v-if="lesson" class="lesson-footer">
    <div class="lesson-footer-row">
      <button class="complete-button" :class="{ done }" @click="progress.setComplete(key, !done)">
        {{ done ? '✓ Lesson completed — click to undo' : 'Mark this lesson as complete' }}
      </button>
      <span v-if="answered" class="quiz-score">Quiz: {{ firstTry }} / {{ answered }} correct on first try</span>
    </div>
    <p class="solution-path">
      Reference solution for this lesson: <code>solutions/lesson-{{ key }}/</code> in the course repository.
      <template v-if="demo">
        <a :href="demo" target="_blank" rel="noopener">Open the reference app ↗</a>
        <span class="hint">(available after running <code>npm run demos</code>)</span>
      </template>
    </p>
  </div>
</template>

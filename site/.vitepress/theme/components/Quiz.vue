<script setup>
import { computed, onMounted, provide, ref } from 'vue'
import { useData } from 'vitepress'
import { useProgress } from '../progress.js'
import { pad } from '../../curriculum.mjs'

const props = defineProps({ id: { type: String, required: true } })
const { frontmatter } = useData()
const progress = useProgress()
const lessonKey = computed(() => (frontmatter.value.lesson !== undefined ? pad(frontmatter.value.lesson) : 'misc'))

const selected = ref(null)
const checked = ref(false)
const correctIndex = ref(null)

provide('quiz', {
  selected,
  checked,
  select(index) {
    if (!checked.value) selected.value = index
  },
  registerCorrect(index) {
    correctIndex.value = index
  },
})

const isCorrect = computed(() => checked.value && selected.value === correctIndex.value)
const record = computed(() => progress.quiz(lessonKey.value)[props.id])

onMounted(() => progress.load())

function check() {
  if (selected.value === null) return
  checked.value = true
  progress.recordAnswer(lessonKey.value, props.id, selected.value === correctIndex.value)
}

function retry() {
  checked.value = false
  selected.value = null
}
</script>

<template>
  <section class="quiz" :class="{ 'is-checked': checked, 'is-correct': isCorrect }">
    <div class="quiz-label">
      Question {{ id.slice(1) }}
      <span v-if="record && record.firstTryCorrect" class="quiz-badge good">✓ correct on first try</span>
      <span v-else-if="record && record.solved" class="quiz-badge ok">solved</span>
    </div>
    <slot />
    <div class="quiz-actions">
      <button v-if="!checked" class="quiz-button" :disabled="selected === null" @click="check">Check answer</button>
      <template v-else>
        <span class="quiz-result">{{ isCorrect ? 'Correct!' : 'Not quite.' }}</span>
        <button class="quiz-button secondary" @click="retry">Try again</button>
      </template>
    </div>
  </section>
</template>

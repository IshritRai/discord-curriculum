<script setup>
import { computed, inject } from 'vue'

const props = defineProps({
  index: { type: Number, required: true },
  correct: { type: Boolean, default: false },
})
const quiz = inject('quiz')
if (props.correct) quiz.registerCorrect(props.index)

const state = computed(() => {
  if (!quiz.checked.value) return quiz.selected.value === props.index ? 'selected' : ''
  if (props.correct) return 'right'
  return quiz.selected.value === props.index ? 'wrong' : 'dim'
})
</script>

<template>
  <button
    type="button"
    class="quiz-option"
    :class="state"
    role="radio"
    :aria-checked="quiz.selected.value === index"
    @click="quiz.select(index)"
  >
    <span class="quiz-letter">{{ String.fromCharCode(65 + index) }}</span>
    <span class="quiz-option-body"><slot /></span>
  </button>
</template>

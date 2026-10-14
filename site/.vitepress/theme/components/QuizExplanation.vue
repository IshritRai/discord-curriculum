<script setup>
import { inject } from 'vue'
const quiz = inject('quiz')
</script>

<template>
  <div v-show="quiz.checked.value" class="quiz-explanation">
    <strong>Explanation</strong>
    <slot />
  </div>
</template>

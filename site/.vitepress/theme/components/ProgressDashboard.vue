<script setup>
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { lessons, lessonLink, pad, phases } from '../../curriculum.mjs'
import { useProgress } from '../progress.js'

const progress = useProgress()
onMounted(() => progress.load())
const message = ref('')

const groups = computed(() =>
  phases.map((phase) => ({
    phase,
    lessons: lessons
      .filter((l) => l.phase === phase.id)
      .map((l) => {
        const quiz = progress.state.loaded ? progress.quiz(pad(l.n)) : {}
        const answers = Object.values(quiz)
        return {
          ...l,
          done: progress.state.loaded && progress.isComplete(pad(l.n)),
          answered: answers.length,
          firstTry: answers.filter((a) => a.firstTryCorrect).length,
        }
      }),
  })),
)
const core = computed(() => groups.value.flatMap((g) => g.lessons).filter((l) => !l.optional))
const doneCount = computed(() => core.value.filter((l) => l.done).length)
const quizTotals = computed(() => {
  const all = groups.value.flatMap((g) => g.lessons)
  return { answered: all.reduce((s, l) => s + l.answered, 0), firstTry: all.reduce((s, l) => s + l.firstTry, 0) }
})

function download() {
  const blob = new Blob([progress.exportJson()], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'chat-course-progress.json'
  a.click()
  URL.revokeObjectURL(a.href)
}
async function upload(event) {
  const file = event.target.files[0]
  if (!file) return
  try {
    progress.importJson(await file.text())
    message.value = 'Progress imported.'
  } catch (error) {
    message.value = `Could not import: ${error.message}`
  }
  event.target.value = ''
}
function reset() {
  if (window.confirm('Erase all saved progress and quiz answers in this browser?')) {
    progress.resetAll()
    message.value = 'Progress reset.'
  }
}
</script>

<template>
  <div class="progress-dashboard">
    <div class="progress-summary">
      <div><strong>{{ doneCount }}</strong> / {{ core.length }} core lessons complete</div>
      <div><strong>{{ quizTotals.firstTry }}</strong> / {{ quizTotals.answered }} quiz answers correct on first try</div>
    </div>
    <div v-for="g in groups" :key="g.phase.id" class="progress-phase">
      <h3>{{ g.phase.title }}</h3>
      <ul>
        <li v-for="l in g.lessons" :key="l.n" :class="{ done: l.done }">
          <span class="progress-check">{{ l.done ? '✓' : '○' }}</span>
          <a :href="withBase(lessonLink(l))">{{ pad(l.n) }} · {{ l.title }}</a>
          <span v-if="l.optional" class="optional-tag">optional</span>
          <span v-if="l.answered" class="progress-quiz">quiz {{ l.firstTry }}/{{ l.answered }}</span>
        </li>
      </ul>
    </div>
    <div class="progress-tools">
      <button @click="download">Export progress (.json)</button>
      <label class="file-button">Import progress<input type="file" accept="application/json" @change="upload" /></label>
      <button class="danger" @click="reset">Reset progress</button>
      <span>{{ message }}</span>
    </div>
    <p class="hint">Progress is stored in this browser only (localStorage). Export it if you switch browsers or computers.</p>
  </div>
</template>

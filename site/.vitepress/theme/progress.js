// Course progress, saved in this browser's localStorage.
//
// Shape (version 1):
// {
//   version: 1,
//   completed: { "05": "2026-10-14T10:00:00.000Z" },          // lesson → date completed
//   quizzes:   { "05": { "q1": { firstTryCorrect: true, solved: true } } }
// }

import { reactive, watch } from 'vue'

const KEY = 'chat-course-progress-v1'

const state = reactive({
  loaded: false,
  data: { version: 1, completed: {}, quizzes: {} },
})

function load() {
  if (state.loaded || typeof window === 'undefined') return
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY))
    if (saved && saved.version === 1) {
      state.data.completed = saved.completed || {}
      state.data.quizzes = saved.quizzes || {}
    }
  } catch {
    // Corrupt or unavailable storage: start fresh.
  }
  state.loaded = true
  watch(
    () => state.data,
    (data) => {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(data))
      } catch {
        // Storage full or blocked — progress just won't persist.
      }
    },
    { deep: true },
  )
}

export function useProgress() {
  return {
    state,
    load,
    isComplete: (key) => Boolean(state.data.completed[key]),
    setComplete(key, done) {
      if (done) state.data.completed[key] = new Date().toISOString()
      else delete state.data.completed[key]
    },
    quiz(key) {
      return state.data.quizzes[key] || {}
    },
    recordAnswer(key, questionId, correct) {
      const quiz = (state.data.quizzes[key] ||= {})
      const entry = (quiz[questionId] ||= { firstTryCorrect: correct, solved: false })
      if (correct) entry.solved = true
    },
    resetQuiz(key, questionId) {
      if (state.data.quizzes[key]) delete state.data.quizzes[key][questionId]
    },
    exportJson: () => JSON.stringify(state.data, null, 2),
    importJson(text) {
      const parsed = JSON.parse(text)
      if (!parsed || parsed.version !== 1) throw new Error('Not a progress file from this course.')
      state.data.completed = parsed.completed || {}
      state.data.quizzes = parsed.quizzes || {}
    },
    resetAll() {
      state.data.completed = {}
      state.data.quizzes = {}
    },
  }
}

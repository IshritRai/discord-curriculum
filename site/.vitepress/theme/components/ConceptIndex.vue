<script setup>
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import ledger from '../../../../concepts.json'
import { lessons, lessonLink, pad } from '../../curriculum.mjs'
import { tokenLabel } from './tokenLabel.js'

const query = ref('')
const rows = computed(() => {
  const q = query.value.trim().toLowerCase()
  return ledger.concepts
    .filter((c) => !q || c.title.toLowerCase().includes(q) || c.tokens.some((t) => tokenLabel(t).toLowerCase().includes(q)))
    .sort((a, b) => a.lesson - b.lesson)
})
const lessonFor = (n) => lessons.find((l) => l.n === n)
</script>

<template>
  <div class="concept-index">
    <input v-model="query" class="concept-search" type="search" placeholder="Search concepts, e.g. flex, fetch, useState…" />
    <p class="concept-count">{{ rows.length }} concepts</p>
    <table>
      <thead>
        <tr><th>Lesson</th><th>Concept</th><th>Includes</th></tr>
      </thead>
      <tbody>
        <tr v-for="c in rows" :key="c.id">
          <td><a :href="withBase(lessonLink(lessonFor(c.lesson)))">{{ pad(c.lesson) }}</a></td>
          <td>{{ c.title }}</td>
          <td class="concept-tokens"><code v-for="t in c.tokens" :key="t">{{ tokenLabel(t) }}</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
